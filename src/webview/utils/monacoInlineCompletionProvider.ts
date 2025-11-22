import type * as monaco from 'monaco-editor'
import { AIServiceManager } from './aiService.js'

/**
 * Monaco inline completion provider for context-aware suggestions
 */
export class MonacoInlineCompletionProvider implements monaco.languages.InlineCompletionsProvider {
	private aiService: AIServiceManager
	private initPromise: Promise<void>

	constructor(vscodeApi: { postMessage: (message: unknown) => void }) {
		this.aiService = new AIServiceManager(vscodeApi)
		this.initPromise = this.initialize()
	}

	private async initialize() {
		console.log('🔄 Initializing AI service...')
		await this.aiService.initialize()
		console.log('✅ AI Service initialized:', this.aiService.getActiveServiceName())
		console.log('   Available:', this.aiService.isAIAvailable())
	}
	provideInlineCompletions(
		model: monaco.editor.ITextModel,
		position: monaco.Position,
		context: monaco.languages.InlineCompletionContext
	): monaco.languages.ProviderResult<monaco.languages.InlineCompletions> {
		try {
			// Don't provide suggestions if explicitly triggered or if there's already a suggestion
			if (context.triggerKind === 1) {
				// 1 = Explicit trigger
				return { items: [] }
			}

			const lineContent = model.getLineContent(position.lineNumber)
			const textBeforeCursor = lineContent.substring(0, position.column - 1).trim()

			// Don't suggest on empty lines or very short input
			if (!textBeforeCursor || textBeforeCursor.length < 3) {
				return { items: [] }
			}

			// Get context lines
			const contextBefore = this.getContextLines(model, position.lineNumber, -5)
			const language = model.getLanguageId()

			// Return a promise for async completion
			return this.generateInlineCompletion(textBeforeCursor, contextBefore, language, position)
		} catch (error) {
			console.error('Error in inline completion provider:', error)
			return { items: [] }
		}
	}

	private async generateInlineCompletion(
		textBeforeCursor: string,
		contextBefore: string,
		language: string,
		position: monaco.Position
	): Promise<monaco.languages.InlineCompletions> {
		const suggestion = await this.generateSingleCompletion(
			textBeforeCursor,
			contextBefore,
			language
		)

		if (!suggestion) {
			return { items: [] }
		}

		return {
			items: [
				{
					insertText: suggestion,
					range: {
						startLineNumber: position.lineNumber,
						startColumn: position.column,
						endLineNumber: position.lineNumber,
						endColumn: position.column
					}
				}
			]
		}
	}

	freeInlineCompletions(): void {
		// Cleanup if needed
	}

	private getContextLines(
		model: monaco.editor.ITextModel,
		startLine: number,
		count: number
	): string {
		const lines: string[] = []
		const direction = count > 0 ? 1 : -1
		const absCount = Math.abs(count)
		const totalLines = model.getLineCount()

		for (let i = 0; i < absCount; i++) {
			const lineNum = startLine + i * direction
			if (lineNum >= 1 && lineNum <= totalLines) {
				lines.push(model.getLineContent(lineNum))
			}
		}

		return direction > 0 ? lines.join('\n') : lines.reverse().join('\n')
	}

	private async generateSingleCompletion(
		textBeforeCursor: string,
		contextBefore: string,
		language: string
	): Promise<string | null> {
		// Wait for initialization to complete
		await this.initPromise

		// Try AI completion first if available
		if (this.aiService.isAIAvailable()) {
			console.log('🤖 Trying AI completion...')
			const aiCompletion = await this.getAICompletion(textBeforeCursor, contextBefore, language)
			if (aiCompletion) {
				console.log('✓ AI completion received:', aiCompletion.substring(0, 50))
				return aiCompletion
			} else {
				console.log('⚠ AI returned null, falling back to patterns')
			}
		} else {
			console.log('⚠ AI service not available, using pattern-based completions')
		}

		// Fallback to intelligent pattern-based completions
		const intelligentSuggestion = this.getIntelligentSuggestion(textBeforeCursor, contextBefore)
		if (intelligentSuggestion) {
			return intelligentSuggestion
		}

		// Final fallback to basic pattern completions
		// Function declarations
		if (this.isFunctionDeclaration(textBeforeCursor)) {
			return this.suggestFunctionImplementation(textBeforeCursor)
		}

		// Conditional statements
		if (this.isConditionalStatement(textBeforeCursor)) {
			return this.suggestConditionalBody(textBeforeCursor)
		}

		// Loops
		if (this.isLoopStatement(textBeforeCursor)) {
			return this.suggestLoopBody(textBeforeCursor)
		}

		// Variables
		if (this.isVariableDeclaration(textBeforeCursor)) {
			const suggestions = this.suggestVariableInitialization(textBeforeCursor)
			return suggestions.length > 0 ? suggestions[0] : null
		}

		// Class methods
		if (this.isClassMethod(textBeforeCursor, contextBefore)) {
			return this.suggestMethodImplementation(textBeforeCursor)
		}

		// Comment-driven
		if (this.isCommentLine(textBeforeCursor, contextBefore)) {
			return this.suggestFromComment(contextBefore)
		}

		return null
	}

	/**
	 * Get AI-powered completion
	 */
	private async getAICompletion(
		textBeforeCursor: string,
		contextBefore: string,
		language: string
	): Promise<string | null> {
		try {
			console.log('📤 Sending to AI:', { prompt: textBeforeCursor.substring(0, 30), language })
			const response = await this.aiService.getCompletion({
				prompt: textBeforeCursor,
				context: contextBefore,
				language: language
			})

			if (response) {
				console.log('📥 AI response received:', response.completion.substring(0, 50))
			}
			return response?.completion || null
		} catch (error) {
			console.error('❌ AI completion error:', error)
			return null
		}
	}

	/**
	 * Intelligent suggestion based on code context and patterns
	 * This can be extended to call AI services
	 */
	private getIntelligentSuggestion(textBeforeCursor: string, contextBefore: string): string | null {
		// Analyze the context to understand what's being written
		const context = this.analyzeContext(textBeforeCursor, contextBefore)

		if (!context) {
			return null
		}

		// Generate suggestion based on context
		switch (context.type) {
			case 'function':
				return this.generateFunctionBody(context)
			case 'arrow-function':
				return this.generateArrowFunctionBody(context)
			case 'method':
				return this.generateMethodBody(context)
			case 'conditional':
				return this.generateConditionalBody()
			case 'loop':
				return this.generateLoopBody(context)
			case 'class':
				return this.generateClassBody()
			case 'try-catch':
				return this.generateTryCatchBody()
			default:
				return null
		}
	}

	private analyzeContext(
		text: string,
		contextBefore: string
	): { type: string; name?: string; params?: string; returnType?: string } | null {
		// Function declaration
		if (/function\s+(\w+)\s*\(([^)]*)\)/.test(text)) {
			const match = text.match(/function\s+(\w+)\s*\(([^)]*)\)/)
			return {
				type: 'function',
				name: match?.[1],
				params: match?.[2]
			}
		}

		// Arrow function
		if (/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>/.test(text)) {
			const match = text.match(/(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/)
			return {
				type: 'arrow-function',
				name: match?.[1],
				params: match?.[2]
			}
		}

		// Method in class
		if (/(?:class\s+|extends\s+)/.test(contextBefore)) {
			const match = text.match(/(?:async\s+)?(\w+)\s*\(([^)]*)\)/)
			if (match) {
				return {
					type: 'method',
					name: match[1],
					params: match[2]
				}
			}
		}

		// Conditional
		if (/(?:if|else\s+if|elif)\s*\(/.test(text)) {
			return { type: 'conditional' }
		}

		// Loop
		if (/(?:for|while)\s*\(/.test(text)) {
			const match = text.match(/(for|while)/)
			return { type: 'loop', name: match?.[1] }
		}

		// Try-catch
		if (/try\s*\{?\s*$/.test(text)) {
			return { type: 'try-catch' }
		}

		// Class
		if (/class\s+(\w+)/.test(text)) {
			const match = text.match(/class\s+(\w+)/)
			return { type: 'class', name: match?.[1] }
		}

		return null
	}

	private generateFunctionBody(context: {
		type: string
		name?: string
		params?: string
	}): string | null {
		if (!context.name) {
			return ' {\n\t\n}'
		}

		const name = context.name

		// Infer function purpose from name
		if (/^get/.test(name)) {
			const prop = name.replace(/^get/, '').toLowerCase()
			return ` {\n\treturn this.${prop}\n}`
		}

		if (/^set/.test(name)) {
			const prop = name.replace(/^set/, '').toLowerCase()
			const param = context.params?.split(',')[0]?.trim().split(':')[0]?.trim() || 'value'
			return ` {\n\tthis.${prop} = ${param}\n}`
		}

		if (/^is|^has|^can|^should/.test(name)) {
			return ` {\n\treturn false\n}`
		}

		if (/^calculate|^compute|^count/.test(name)) {
			return ` {\n\treturn 0\n}`
		}

		if (/^find|^search|^get/.test(name)) {
			return ` {\n\treturn null\n}`
		}

		if (/^create|^build|^make/.test(name)) {
			return ` {\n\treturn {}\n}`
		}

		if (/^handle|^on/.test(name)) {
			return ` {\n\t// Handle event\n}`
		}

		if (/^validate|^check/.test(name)) {
			return ` {\n\treturn true\n}`
		}

		if (/^init|^initialize|^setup/.test(name)) {
			return ` {\n\t// Initialize\n}`
		}

		if (/^render|^draw|^display/.test(name)) {
			return ` {\n\t// Render logic\n}`
		}

		if (/^fetch|^load|^retrieve/.test(name)) {
			return ` {\n\treturn await fetch(url)\n}`
		}

		if (/^save|^write|^update/.test(name)) {
			return ` {\n\t// Save logic\n}`
		}

		if (/^delete|^remove|^clear/.test(name)) {
			return ` {\n\t// Delete logic\n}`
		}

		if (/^format|^transform|^convert/.test(name)) {
			const param = context.params?.split(',')[0]?.trim().split(':')[0]?.trim() || 'value'
			return ` {\n\treturn ${param}\n}`
		}

		// Default
		return ` {\n\t// TODO: Implement ${name}\n}`
	}

	private generateArrowFunctionBody(context: {
		type: string
		name?: string
		params?: string
	}): string | null {
		if (!context.name) {
			return ' {\n\t\n}'
		}

		// Similar logic to regular functions but with arrow function style
		return this.generateFunctionBody({ ...context, type: 'function' })
	}

	private generateMethodBody(context: {
		type: string
		name?: string
		params?: string
	}): string | null {
		if (!context.name) {
			return ' {\n\t\n}'
		}

		const name = context.name

		// Special method names
		if (name === 'constructor') {
			return ' {\n\t// Initialize properties\n}'
		}

		if (name === 'render') {
			return ' {\n\treturn null\n}'
		}

		if (name === 'componentDidMount' || name === 'useEffect') {
			return ' {\n\t// Side effects\n}'
		}

		// Use function body generation for other methods
		return this.generateFunctionBody({ ...context, type: 'function' })
	}

	private generateConditionalBody(): string | null {
		return ' {\n\t// Implementation\n}'
	}

	private generateLoopBody(context: { type: string; name?: string }): string | null {
		if (context.name === 'for') {
			return ' {\n\t// Loop body\n}'
		}
		if (context.name === 'while') {
			return ' {\n\t// Loop condition\n}'
		}
		return ' {\n\t// Loop body\n}'
	}

	private generateClassBody(): string | null {
		return ' {\n\tconstructor() {\n\t\t// Initialize\n\t}\n}'
	}

	private generateTryCatchBody(): string | null {
		return ' {\n\t// Try code\n} catch (error) {\n\t// Handle error\n}'
	}

	private generateCompletions(
		textBeforeCursor: string,
		textAfterCursor: string,
		contextBefore: string,
		contextAfter: string,
		token: monaco.CancellationToken
	): string[] {
		if (token.isCancellationRequested) {
			return []
		}

		const completions: string[] = []

		// Function declarations
		if (this.isFunctionDeclaration(textBeforeCursor)) {
			const completion = this.suggestFunctionImplementation(textBeforeCursor)
			if (completion) {
				completions.push(completion)
			}
		}

		// Conditional statements
		if (this.isConditionalStatement(textBeforeCursor)) {
			const completion = this.suggestConditionalBody(textBeforeCursor)
			if (completion) {
				completions.push(completion)
			}
		}

		// Loops
		if (this.isLoopStatement(textBeforeCursor)) {
			const completion = this.suggestLoopBody(textBeforeCursor)
			if (completion) {
				completions.push(completion)
			}
		}

		// Variables
		if (this.isVariableDeclaration(textBeforeCursor)) {
			completions.push(...this.suggestVariableInitialization(textBeforeCursor))
		}

		// Class methods
		if (this.isClassMethod(textBeforeCursor, contextBefore)) {
			const completion = this.suggestMethodImplementation(textBeforeCursor)
			if (completion) {
				completions.push(completion)
			}
		}

		// Comment-driven
		if (this.isCommentLine(textBeforeCursor, contextBefore)) {
			const completion = this.suggestFromComment(contextBefore)
			if (completion) {
				completions.push(completion)
			}
		}

		return completions
	}

	// Pattern detection methods
	private isFunctionDeclaration(text: string): boolean {
		return /(?:function\s+\w+\s*\(|const\s+\w+\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>|def\s+\w+\s*\()/i.test(
			text
		)
	}

	private isConditionalStatement(text: string): boolean {
		return /^\s*(?:if|else\s+if|elif)\s*\([^)]*\)\s*\{?\s*$/.test(text)
	}

	private isLoopStatement(text: string): boolean {
		return /^\s*(?:for|while|do)\s*[\(\{]/.test(text)
	}

	private isClassMethod(text: string, context: string): boolean {
		return (
			/(?:class\s+\w+|extends\s+\w+)/i.test(context) &&
			/^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{?\s*$/.test(text)
		)
	}

	private isVariableDeclaration(text: string): boolean {
		return /^\s*(?:const|let|var)\s+\w+\s*=\s*$/.test(text)
	}

	private isCommentLine(text: string, context: string): boolean {
		const lastLines = context.split('\n').slice(-3).join('\n')
		return /\/\/.*(?:TODO|FIXME|create|implement|add)/i.test(lastLines)
	}

	// Suggestion generation methods
	private suggestFunctionImplementation(text: string): string | null {
		const match = text.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=.*)\s*\(([^)]*)\)/)
		if (!match) {
			return null
		}

		const functionName = match[1] || match[2]
		const params = match[3]

		if (/^get/.test(functionName)) {
			return ` {\n\treturn this.${functionName.replace(/^get/, '').toLowerCase()}\n}`
		} else if (/^set/.test(functionName)) {
			const paramName = params.split(',')[0]?.trim().split(':')[0]?.trim()
			return ` {\n\tthis.${functionName.replace(/^set/, '').toLowerCase()} = ${paramName}\n}`
		} else if (/^is|^has|^can/.test(functionName)) {
			return ` {\n\treturn false\n}`
		} else if (/^calculate|^compute/.test(functionName)) {
			return ` {\n\treturn 0\n}`
		}

		return ` {\n\t// TODO: Implement ${functionName}\n}`
	}

	private suggestConditionalBody(text: string): string | null {
		if (text.includes('{')) {
			return '\n\t// Implementation\n}'
		}
		return ' {\n\t// Implementation\n}'
	}

	private suggestLoopBody(text: string): string | null {
		if (text.includes('for') || text.includes('while')) {
			return ' {\n\t// Loop body\n}'
		}
		return null
	}

	private suggestMethodImplementation(text: string): string | null {
		const match = text.match(/(\w+)\s*\([^)]*\)/)
		if (!match) {
			return null
		}

		const methodName = match[1]

		if (methodName === 'constructor') {
			return ' {\n\t// Initialize properties\n}'
		} else if (methodName === 'render') {
			return ' {\n\treturn null\n}'
		} else if (/^on[A-Z]/.test(methodName)) {
			return ' {\n\t// Handle event\n}'
		}

		return ' {\n\t// Implementation\n}'
	}

	private suggestVariableInitialization(text: string): string[] {
		const completions: string[] = []
		const match = text.match(/(?:const|let|var)\s+(\w+)\s*=/)
		if (!match) {
			return completions
		}

		const varName = match[1].toLowerCase()

		if (varName.includes('array') || varName.includes('list')) {
			completions.push(' []')
		} else if (
			varName.includes('object') ||
			varName.includes('config') ||
			varName.includes('options')
		) {
			completions.push(' {}')
		} else if (varName.includes('count') || varName.includes('index')) {
			completions.push(' 0')
		} else if (varName.includes('is') || varName.includes('has') || varName.includes('can')) {
			completions.push(' false')
		} else if (
			varName.includes('name') ||
			varName.includes('text') ||
			varName.includes('message')
		) {
			completions.push(" ''")
		}

		return completions
	}

	private suggestFromComment(context: string): string | null {
		const commentMatch = context.match(/\/\/\s*(.+)$/m)
		if (!commentMatch) {
			return null
		}

		const commentText = commentMatch[1].toLowerCase()

		if (commentText.includes('todo') || commentText.includes('implement')) {
			if (commentText.includes('function')) {
				return '\nfunction implementation() {\n\t// Implementation\n}'
			} else if (commentText.includes('class')) {
				return '\nclass ClassName {\n\tconstructor() {\n\t\t// Initialize\n\t}\n}'
			} else if (commentText.includes('loop') || commentText.includes('iterate')) {
				return '\nfor (let i = 0; i < length; i++) {\n\t// Loop body\n}'
			}
		}

		return null
	}
}
