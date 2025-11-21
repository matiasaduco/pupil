export interface AICompletionRequest {
	prompt: string
	language: string
	context: string
}

export interface AICompletionResponse {
	completion: string
	confidence?: number
}

export interface AIService {
	getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null>
	isAvailable(): Promise<boolean>
	getName(): string
}

export class VSCodeLMService implements AIService {
	private vscodeApi: { postMessage: (message: unknown) => void }
	private available = false
	private checkPending = true

	constructor(vscodeApi: { postMessage: (message: unknown) => void }) {
		this.vscodeApi = vscodeApi

		window.addEventListener('message', (event) => {
			const message = event.data
			if (message.type === 'language-model-available') {
				this.available = true
				this.checkPending = false
				console.log('✓ VS Code Language Model detected:', message.modelName)
			}
		})

		this.vscodeApi.postMessage({ type: 'request-language-model-status' })
	}

	getName(): string {
		return 'VS Code Copilot'
	}

	async isAvailable(): Promise<boolean> {
		for (let i = 0; i < 40 && this.checkPending; i++) {
			await new Promise((resolve) => setTimeout(resolve, 50))
		}
		console.log(`VS Code LM availability: ${this.available} (checkPending: ${this.checkPending})`)
		return this.available
	}

	async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null> {
		try {
			console.log('VS Code Language Model: Sending request...')

			const response = await this.sendToExtension('vscode-lm', {
				prompt: request.prompt,
				context: request.context,
				language: request.language
			})

			if (!response || !(response as { completion?: string }).completion) {
				console.warn('VS Code Language Model returned no completion')
				return null
			}

			let completion = (response as { completion: string }).completion.trim()

			const promptTrimmed = request.prompt.trim()
			if (completion.startsWith(promptTrimmed)) {
				completion = completion.substring(promptTrimmed.length).trim()
			}

			console.log('VS Code Language Model completion:', completion.substring(0, 50))
			return {
				completion,
				confidence: 0.95
			}
		} catch (error) {
			console.error('VS Code Language Model error:', error)
			return null
		}
	}

	private sendToExtension(service: string, payload: unknown): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const requestId = Math.random().toString(36).substring(7)

			const handler = (event: MessageEvent) => {
				const message = event.data
				if (message.type === 'ai-completion-response' && message.requestId === requestId) {
					window.removeEventListener('message', handler)
					if (message.error) {
						reject(new Error(message.error))
					} else {
						resolve(message.response)
					}
				}
			}

			window.addEventListener('message', handler)

			setTimeout(() => {
				window.removeEventListener('message', handler)
				reject(new Error('Request timeout'))
			}, 30000)

			this.vscodeApi.postMessage({
				type: 'ai-completion-request',
				requestId,
				service,
				payload
			})
		})
	}
}

export class HuggingFaceService implements AIService {
	private vscodeApi: { postMessage: (message: unknown) => void }

	constructor(vscodeApi: { postMessage: (message: unknown) => void }) {
		this.vscodeApi = vscodeApi
	}

	getName(): string {
		return 'HuggingFace (CodeGen)'
	}

	async isAvailable(): Promise<boolean> {
		return false
	}

	async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null> {
		try {
			console.log('HuggingFace: Sending request via extension proxy...')
			const prompt = `${request.context}\n${request.prompt}`
			const response = await this.sendToExtension('huggingface', {
				inputs: prompt,
				parameters: {
					max_new_tokens: 100,
					temperature: 0.2,
					return_full_text: false,
					stop: ['\n\n', 'function ', 'class ', 'def ', 'const ', 'let ', 'var ']
				}
			})

			if (!response) {
				console.warn('HuggingFace returned no response')
				return null
			}

			console.log('HuggingFace raw response:', response)
			const rawCompletion = Array.isArray(response)
				? response[0]?.generated_text
				: (response as { generated_text?: string }).generated_text

			if (!rawCompletion) {
				console.warn('HuggingFace returned no completion')
				return null
			}

			let completion = rawCompletion.trim()

			const promptTrimmed = request.prompt.trim()
			if (completion.startsWith(promptTrimmed)) {
				completion = completion.substring(promptTrimmed.length).trim()
			}

			console.log('HuggingFace completion:', completion.substring(0, 50))
			return {
				completion,
				confidence: 0.7
			}
		} catch (error) {
			console.error('HuggingFace API error:', error)
			return null
		}
	}

	private sendToExtension(service: string, payload: unknown): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const requestId = Math.random().toString(36).substring(7)
			const handler = (event: MessageEvent) => {
				const message = event.data
				if (message.type === 'ai-completion-response' && message.requestId === requestId) {
					window.removeEventListener('message', handler)
					if (message.error) {
						reject(new Error(message.error))
					} else {
						resolve(message.response)
					}
				}
			}

			window.addEventListener('message', handler)
			setTimeout(() => {
				window.removeEventListener('message', handler)
				reject(new Error('Request timeout'))
			}, 30000)

			this.vscodeApi.postMessage({
				type: 'ai-completion-request',
				requestId,
				service,
				payload
			})
		})
	}
}

export class OllamaService implements AIService {
	private baseUrl: string
	private model: string

	constructor(baseUrl = 'http://localhost:11434', model = 'codellama:7b') {
		this.baseUrl = baseUrl
		this.model = model
	}

	getName(): string {
		return 'Ollama (CodeLlama)'
	}

	async isAvailable(): Promise<boolean> {
		try {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 1000)
			const response = await fetch(`${this.baseUrl}/api/tags`, {
				method: 'GET',
				signal: controller.signal
			})
			clearTimeout(timeoutId)
			return response.ok
		} catch {
			return false
		}
	}

	async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null> {
		try {
			const prompt = this.buildPrompt(request)

			const response = await fetch(`${this.baseUrl}/api/generate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: this.model,
					prompt: prompt,
					stream: false,
					options: {
						temperature: 0.2,
						top_p: 0.9,
						stop: ['\n\n', '```']
					}
				})
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			const completion = this.extractCompletion(data.response)

			return {
				completion,
				confidence: 0.8
			}
		} catch (error) {
			console.error('Ollama completion error:', error)
			return null
		}
	}

	private buildPrompt(request: AICompletionRequest): string {
		return `Complete the following ${request.language} code. Only provide the completion, no explanations.

Context:
${request.context}

Code to complete:
${request.prompt}

Completion:`
	}

	private extractCompletion(response: string): string {
		let completion = response.trim()

		completion = completion.replace(/```[\w]*\n?/g, '')

		const lines = completion.split('\n')
		const result: string[] = []
		let braceCount = 0

		for (const line of lines) {
			result.push(line)

			for (const char of line) {
				if (char === '{') {
					braceCount++
				}
				if (char === '}') {
					braceCount--
				}
			}

			if (braceCount === 0 && result.length > 1) {
				break
			}
		}

		return result.join('\n')
	}
}

export class OpenAIService implements AIService {
	private apiKey: string
	private model: string

	constructor(apiKey: string, model = 'gpt-3.5-turbo') {
		this.apiKey = apiKey
		this.model = model
	}

	getName(): string {
		return 'OpenAI (GPT-3.5)'
	}

	async isAvailable(): Promise<boolean> {
		return !!this.apiKey
	}

	async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null> {
		try {
			const messages = [
				{
					role: 'system',
					content: `You are a code completion assistant. Provide only the code completion, no explanations. Complete the code naturally based on context.`
				},
				{
					role: 'user',
					content: `Complete this ${request.language} code:\n\nContext:\n${request.context}\n\nCode to complete:\n${request.prompt}\n\nProvide only the completion:`
				}
			]

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`
				},
				body: JSON.stringify({
					model: this.model,
					messages: messages,
					temperature: 0.2,
					max_tokens: 200,
					stop: ['\n\n']
				})
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			const completion = data.choices[0]?.message?.content?.trim() || ''

			return {
				completion,
				confidence: 0.9
			}
		} catch (error) {
			console.error('OpenAI completion error:', error)
			return null
		}
	}
}

export class AIServiceManager {
	private services: AIService[] = []
	private currentService: AIService | null = null

	constructor(vscodeApi: { postMessage: (message: unknown) => void }) {
		// Priority order:
		// 1. VS Code Language Model (best: Copilot if available)
		// 2. Ollama (great: local, fast, private)
		// 3. HuggingFace (disabled: free tier unreliable)
		// 4. OpenAI (optional: paid, requires API key)
		this.services.push(new VSCodeLMService(vscodeApi))
		this.services.push(new OllamaService())
		this.services.push(new HuggingFaceService(vscodeApi))

		const openAIKey = this.getOpenAIKey()
		if (openAIKey) {
			this.services.push(new OpenAIService(openAIKey))
		}
	}

	async initialize(): Promise<void> {
		for (const service of this.services) {
			const available = await service.isAvailable()
			if (available) {
				this.currentService = service
				const serviceName = service.getName()
				console.log(`✓ AI completions enabled: ${serviceName}`)
				return
			}
		}

		console.warn('No AI services available.')
		console.log('Install Ollama for intelligent completions: https://ollama.ai')
	}

	async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse | null> {
		if (!this.currentService) {
			return null
		}

		return this.currentService.getCompletion(request)
	}

	isAIAvailable(): boolean {
		return this.currentService !== null
	}

	getActiveServiceName(): string {
		return this.currentService?.getName() || 'None'
	}

	private getOpenAIKey(): string | null {
		// In a real implementation, this would read from VS Code settings
		return null
	}
}
