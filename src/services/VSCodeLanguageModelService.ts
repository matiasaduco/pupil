import * as vscode from 'vscode'

export class VSCodeLanguageModelService {
	private models: vscode.LanguageModelChat[] = []

	async initialize(): Promise<boolean> {
		try {
			this.models = await vscode.lm.selectChatModels({
				vendor: undefined,
				family: undefined
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
			const model = this.models[0]

			const messages = [
				vscode.LanguageModelChatMessage.User(
					`You are a code completion assistant. Complete the following ${language} code. Provide ONLY the missing part that comes after the given code. Do not repeat the code that is already there. No explanations, no markdown, no code blocks.\n\nContext:\n${context}\n\nCode to complete:\n${prompt}\n\nComplete with only the missing part:`
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
