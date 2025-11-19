import * as vscode from 'vscode'

/**
 * Service to use VS Code's built-in Language Model API (Copilot, etc.)
 */
export class VSCodeLanguageModelService {
	private models: vscode.LanguageModelChat[] = []

	async initialize(): Promise<boolean> {
		try {
			// Get all available language models (Copilot, etc.)
			this.models = await vscode.lm.selectChatModels({
				vendor: undefined, // Accept any vendor
				family: undefined // Accept any family
			})

			if (this.models.length > 0) {
				console.log(
					`✓ Found ${this.models.length} language model(s):`,
					this.models.map((m) => m.name).join(', ')
				)
				return true
			}

			console.log('⚠ No language models available (Copilot not enabled)')
			return false
		} catch (error) {
			console.error('Error initializing language model:', error)
			return false
		}
	}

	async getCompletion(prompt: string, context: string, language: string): Promise<string | null> {
		if (this.models.length === 0) {
			return null
		}

		try {
			const model = this.models[0] // Use first available model

			const messages = [
				vscode.LanguageModelChatMessage.User(
					`You are a code completion assistant. Complete the following ${language} code. Provide ONLY the completion, no explanations or markdown.\n\nContext:\n${context}\n\nCode to complete:\n${prompt}\n\nCompletion:`
				)
			]

			const response = await model.sendRequest(
				messages,
				{},
				new vscode.CancellationTokenSource().token
			)

			let completion = ''
			for await (const chunk of response.text) {
				completion += chunk
			}

			return completion.trim()
		} catch (error) {
			console.error('Language model completion error:', error)
			return null
		}
	}

	isAvailable(): boolean {
		return this.models.length > 0
	}

	getModelName(): string {
		return this.models.length > 0 ? this.models[0].name : 'None'
	}
}
