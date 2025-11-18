import type * as monaco from 'monaco-editor'

/**
 * Monaco inline completion provider for context-aware suggestions
 */
export class MonacoInlineCompletionProvider implements monaco.languages.InlineCompletionsProvider {
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

			const suggestion = this.generateSingleCompletion(textBeforeCursor, contextBefore)

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
		} catch (error) {
			console.error('Error in inline completion provider:', error)
			return { items: [] }
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

	private generateSingleCompletion(textBeforeCursor: string, contextBefore: string): string | null {
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
			return `\n\treturn this.${functionName.replace(/^get/, '').toLowerCase()}\n}`
		} else if (/^set/.test(functionName)) {
			const paramName = params.split(',')[0]?.trim().split(':')[0]?.trim()
			return `\n\tthis.${functionName.replace(/^set/, '').toLowerCase()} = ${paramName}\n}`
		} else if (/^is|^has|^can/.test(functionName)) {
			return `\n\treturn false\n}`
		} else if (/^calculate|^compute/.test(functionName)) {
			return `\n\treturn 0\n}`
		}

		return `\n\t// TODO: Implement ${functionName}\n}`
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
