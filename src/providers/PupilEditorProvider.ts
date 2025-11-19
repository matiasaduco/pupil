import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { getEditorContent } from '../utils/getEditorContent.js'
import SnippetManager from '../managers/SnippetManager.js'
import ThemeManager from '../managers/ThemeManager.js'
import DocumentManager from '../managers/DocumentManager.js'
import { FolderNode } from '@webview/components/FolderTree/FolderTree.js'
import { DEFAULT_URL, ConnectionStatus, ConnectionStatusType } from '../constants.js'
import { VSCodeLanguageModelService } from '../services/VSCodeLanguageModelService.js'

export class PupilEditorProvider implements vscode.CustomTextEditorProvider {
	private static readonly viewType = 'pupil.editor'
	private pendingAction: { type: 'file' | 'folder'; name: string } | null = null
	private webviewPanel: vscode.WebviewPanel | null = null
	private sendToSpeechWebClient: (message: unknown) => void
	private stopSpeechServer: () => void
	private connectionStatus: ConnectionStatusType = ConnectionStatus.DISCONNECTED
	private languageModelService: VSCodeLanguageModelService

	constructor(
		private readonly context: vscode.ExtensionContext,
		sendToSpeechWebClient: (message: unknown) => void,
		stopSpeechServer: () => void
	) {
		this.sendToSpeechWebClient = sendToSpeechWebClient
		this.stopSpeechServer = stopSpeechServer
		this.languageModelService = new VSCodeLanguageModelService()
		this.initializeLogsDirectory()
		this.initializeLanguageModel()
	}

	public sendMessageToWebview(message: unknown) {
		if (this.webviewPanel) {
			this.webviewPanel.webview.postMessage(message)
		}
	}

	private initializeLogsDirectory() {
		const logsDir = path.join(this.context.extensionPath, 'logs')
		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir, { recursive: true })
		}
	}

	private getLogFilePath(level: string): string {
		const logsDir = path.join(this.context.extensionPath, 'logs')
		const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

		if (level === 'error') {
			return path.join(logsDir, `error-${date}.log`)
		}
		return path.join(logsDir, `combined-${date}.log`)
	}

	private writeLog(entry: {
		timestamp: string
		level: string
		message: string
		meta?: string | object
	}) {
		try {
			const { timestamp, level, message, meta } = entry

			const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : ''
			const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}\n`

			const combinedLogPath = this.getLogFilePath(level)
			fs.appendFileSync(combinedLogPath, logEntry)

			if (level === 'error') {
				const errorLogPath = this.getLogFilePath('error')
				fs.appendFileSync(errorLogPath, logEntry)
			}
		} catch (error) {
			console.error('Failed to write log to file:', error)
		}
	}

	public updateConnectionStatus(status: ConnectionStatusType) {
		this.connectionStatus = status
		this.sendMessageToWebview({ type: 'connection-status', status })
	}

	public disposable(): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(PupilEditorProvider.viewType, this, {
			webviewOptions: { retainContextWhenHidden: true },
			supportsMultipleEditorsPerDocument: false
		})
	}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel
	): Promise<void> {
		const webviewReady = false
		this.webviewPanel = webviewPanel

		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')]
		}

		webviewPanel.webview.html = getEditorContent(this.context, webviewPanel.webview)

		const onDidChangeActiveColorThemeListener = vscode.window.onDidChangeActiveColorTheme(() => {
			try {
				this.updateTheme(webviewPanel)
			} catch (error) {
				console.error('Error en onDidChangeActiveColorTheme:', error)
			}
		})

		const onDidReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage(
			async (message) => {
				try {
					if (message.type === 'log') {
						this.writeLog(message.data)
						return
					}

					if (message.type === 'ready') {
						this.init(webviewReady, webviewPanel, document)
					}
					if (message.type === 'create-folder') {
						await this.createNewFolder(message.name, webviewPanel)
					}
					if (message.type === 'create-file') {
						await this.createNewFile(message.name, webviewPanel)
					}
					if (message.type === 'folder-selected' && this.pendingAction) {
						await this.handleFolderSelection(message.path)
					}
					if (message.type === 'get-snippets') {
						this.getSnippets(webviewPanel)
					}
					if (message.type === 'insert-snippet' && message.body) {
						// Insert snippet using VS Code API so placeholders/tabstops work.
						// First ensure the editor that corresponds to the current custom document has focus.
						try {
							let targetEditor = vscode.window.visibleTextEditors.find(
								(e) => e.document.uri.toString() === document.uri.toString()
							)
							if (!targetEditor) {
								// Try to open the document in an editor to ensure focus
								const doc = await vscode.workspace.openTextDocument(document.uri)
								targetEditor = await vscode.window.showTextDocument(doc)
							} else {
								// Reveal/focus the existing editor
								await vscode.window.showTextDocument(targetEditor.document, targetEditor.viewColumn)
							}
							if (!targetEditor) {
								return
							}
							let body: string
							if (Array.isArray(message.body)) {
								body = message.body.join('\n')
							} else {
								body = String(message.body)
							}
							const snippet = new vscode.SnippetString(body)
							await targetEditor.insertSnippet(snippet, targetEditor.selection)
						} catch (err) {
							console.error('Failed to insert snippet:', err)
						}
					}
					if (message.type === 'edit' && message.content) {
						this.updateTextDocument(document, message.content)
					}
					if (message.type === 'terminal-open') {
						this.openTerminal()
					}
					if (message.type === 'terminal-create') {
						this.createTerminal(message.content)
					}
					if (message.type === 'terminal-input' && message.content) {
						vscode.window.activeTerminal?.sendText(message.content, false)
					}
					if (message.type === 'terminal-space') {
						vscode.window.activeTerminal?.sendText(' ', false)
					}
					if (message.type === 'terminal-bksp') {
						vscode.window.activeTerminal?.sendText('\b', false)
					}
					if (message.type === 'terminal-enter') {
						vscode.window.activeTerminal?.sendText('\n', false)
					}
					if (message.type === 'terminal-clear') {
						vscode.window.activeTerminal?.sendText('clear', true)
					}
					if (message.type === 'stop-process') {
						vscode.window.activeTerminal?.sendText('\x03', true)
					}
					if (message.type === 'terminal-hide') {
						vscode.window.activeTerminal?.hide()
					}
					if (message.type === 'terminal-list') {
						this.getTerminals(webviewPanel)
					}
					if (message.type === 'terminal-show' && message.content) {
						this.showTerminal(message.content, webviewPanel)
					}
					if (message.type === 'openSimpleBrowser') {
						this.openSimpleBrowser(message.url)
					}
					if (message.type === 'terminal-paste') {
						vscode.env.clipboard.readText().then((text) => {
							vscode.window.activeTerminal?.sendText(text, false)
						})
					}
					if (message.type === 'save-file') {
						document.save()
					}
					if (message.type === 'start-listening') {
						this.sendToSpeechWebClient({
							type: 'start-listening',
							continuous: message.continuous
						})
					}
					if (message.type === 'stop-listening') {
						this.sendToSpeechWebClient({ type: 'stop-listening' })
					}
					if (message.type === 'start-speech-server') {
						if (this.connectionStatus.value !== 'connected') {
							vscode.commands.executeCommand('pupil.openSpeechWeb')
						}
					}
					if (message.type === 'stop-speech-server') {
						if (this.connectionStatus.value === 'connected') {
							this.stopSpeechServer()
						}
					}
					if (message.type === 'transcript') {
						webviewPanel.webview.postMessage(message)
					}
					if (message.type === 'ai-completion-request') {
						// Proxy AI completion requests to avoid CORS in webview
						this.handleAICompletionRequest(message, webviewPanel)
					}
					if (message.type === 'request-language-model-status') {
						// Send current language model status
						if (this.languageModelService.isAvailable()) {
							webviewPanel.webview.postMessage({
								type: 'language-model-available',
								modelName: this.languageModelService.getModelName()
							})
						}
					}
				} catch (error) {
					console.error('Error en onDidReceiveMessage:', error)
					this.writeLog({
						timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
						level: 'error',
						message: 'Error in onDidReceiveMessage',
						meta: { error: error instanceof Error ? error.message : String(error) }
					})
				}
			}
		)

		const onDidChangeTextDocumentListener = vscode.workspace.onDidChangeTextDocument((e) => {
			try {
				if (e.document.uri.toString() === document.uri.toString()) {
					this.openTextDocument(webviewPanel, e.document)
				}
			} catch (error) {
				console.error('Error en onDidChangeTextDocument:', error)
			}
		})

		const onDidCloseTerminalListener = vscode.window.onDidCloseTerminal((closedTerminal) => {
			try {
				this.dittachTerminal(closedTerminal, webviewPanel)
			} catch (error) {
				console.error('Error en onDidCloseTerminal:', error)
			}
		})

		webviewPanel.onDidDispose(() => {
			onDidChangeActiveColorThemeListener.dispose()
			onDidReceiveMessageListener.dispose()
			onDidChangeTextDocumentListener.dispose()
			onDidCloseTerminalListener.dispose()
		})
	}

	private init(
		webviewReady: boolean,
		webviewPanel: vscode.WebviewPanel,
		document: vscode.TextDocument
	) {
		if (!webviewReady) {
			webviewReady = true
			this.updateTheme(webviewPanel)
			this.openTextDocument(webviewPanel, document)
			this.getSnippets(webviewPanel)
		}
	}

	private openTextDocument(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
		const { content, fileName, fileExtension } = DocumentManager.openTextDocument(document)
		webviewPanel.webview.postMessage({
			type: 'init',
			content,
			fileName,
			fileExtension
		})
	}

	private updateTextDocument(document: vscode.TextDocument, value: string) {
		DocumentManager.updateTextDocument(document, value)
	}

	private updateTheme(webviewPanel: vscode.WebviewPanel) {
		const theme = ThemeManager.getCurrentTheme()
		webviewPanel.webview.postMessage({ type: 'set-theme', theme })
	}

	private getSnippets(webviewPanel: vscode.WebviewPanel) {
		const snippets = SnippetManager.getAllSnippets()
		webviewPanel.webview.postMessage({ type: 'snippets', snippets })
	}

	private openTerminal(title?: string) {
		const terminal = vscode.window.activeTerminal || vscode.window.createTerminal(title)
		terminal.show()
	}

	private createTerminal(title?: string) {
		const terminal = vscode.window.createTerminal(title)
		terminal.show()
	}

	private async getTerminals(webviewPanel: vscode.WebviewPanel) {
		const terminals = vscode.window.terminals
		const terminalsWithIds = await Promise.all(
			terminals.map(async (t) => ({
				name: t.name,
				processId: await t.processId
			}))
		)
		webviewPanel.webview.postMessage({
			type: 'set-terminals',
			content: terminalsWithIds
		})
	}

	private async showTerminal(processId: number, webviewPanel: vscode.WebviewPanel) {
		const terminals = vscode.window.terminals
		for (const terminal of terminals) {
			const terminalProcessId = await terminal.processId
			if (terminalProcessId === processId) {
				terminal.show()
				webviewPanel.webview.postMessage({
					type: 'set-focus',
					focus: 'terminal'
				})
				break
			}
		}
	}

	private async createNewFile(fileName: string, webviewPanel: vscode.WebviewPanel) {
		this.pendingAction = { type: 'file', name: fileName }
		await this.showFolderTreeSelector(webviewPanel)
	}

	private async createNewFolder(folderName: string, webviewPanel: vscode.WebviewPanel) {
		this.pendingAction = { type: 'folder', name: folderName }
		await this.showFolderTreeSelector(webviewPanel)
	}

	private async handleFolderSelection(selectedPath: string) {
		if (!this.pendingAction) {
			return
		}

		const destUri = vscode.Uri.file(selectedPath)

		try {
			if (this.pendingAction.type === 'file') {
				const fileUri = vscode.Uri.joinPath(destUri, this.pendingAction.name)
				const wsedit = new vscode.WorkspaceEdit()
				wsedit.createFile(fileUri, { ignoreIfExists: true })
				await vscode.workspace.applyEdit(wsedit)

				const doc = await vscode.workspace.openTextDocument(fileUri)
				await vscode.window.showTextDocument(doc)
			} else if (this.pendingAction.type === 'folder') {
				const folderUri = vscode.Uri.joinPath(destUri, this.pendingAction.name)
				await vscode.workspace.fs.createDirectory(folderUri)
				vscode.window.showInformationMessage(
					`Folder "${this.pendingAction.name}" created in ${folderUri.fsPath}`
				)
			}
		} catch (err) {
			vscode.window.showErrorMessage(`Could not create ${this.pendingAction.type}: ${err}`)
		} finally {
			this.pendingAction = null
		}
	}

	private async showFolderTreeSelector(webviewPanel: vscode.WebviewPanel) {
		const folders = vscode.workspace.workspaceFolders
		if (!folders) {
			vscode.window.showErrorMessage('No workspace folder open.')
			return
		}

		const tree = await this.buildFolderTree(folders)

		webviewPanel.webview.postMessage({
			type: 'show-folder-tree',
			items: tree
		})
	}

	private async buildFolderTree(folders: readonly vscode.WorkspaceFolder[]): Promise<FolderNode[]> {
		const tree: FolderNode[] = []

		for (const folder of folders) {
			const rootNode: FolderNode = {
				id: folder.uri.fsPath,
				name: folder.name,
				fullPath: folder.uri.fsPath,
				children: await this.buildFolderChildren(folder.uri)
			}
			tree.push(rootNode)
		}

		return tree
	}

	private async buildFolderChildren(uri: vscode.Uri): Promise<FolderNode[]> {
		const IGNORAR = new Set(['node_modules', 'public', '.git', 'dist', 'build'])
		const children: FolderNode[] = []

		try {
			const entries = await vscode.workspace.fs.readDirectory(uri)

			for (const [name, tipo] of entries) {
				if (tipo === vscode.FileType.Directory && !IGNORAR.has(name)) {
					const childUri = vscode.Uri.joinPath(uri, name)
					const childNode: FolderNode = {
						id: childUri.fsPath,
						name: name,
						fullPath: childUri.fsPath,
						children: await this.buildFolderChildren(childUri)
					}
					children.push(childNode)
				}
			}
		} catch (error) {
			console.error('Error reading directory:', error)
		}

		return children
	}

	private async openSimpleBrowser(url: string = DEFAULT_URL) {
		await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup')
		await vscode.commands.executeCommand('simpleBrowser.show', url)
	}

	private dittachTerminal(closedTerminal: vscode.Terminal, webviewPanel: vscode.WebviewPanel) {
		const terminal = vscode.window.activeTerminal
		if (terminal && closedTerminal === terminal) {
			webviewPanel.webview.postMessage({
				type: 'set-focus',
				focus: 'editor'
			})
		}
	}

	private async handleAICompletionRequest(
		message: { requestId: string; service: string; payload: any },
		webviewPanel: vscode.WebviewPanel
	) {
		try {
			let response: any = null

			if (message.service === 'vscode-lm') {
				response = await this.fetchVSCodeLanguageModel(message.payload)
			} else if (message.service === 'huggingface') {
				response = await this.fetchHuggingFace(message.payload)
			} else if (message.service === 'ollama') {
				response = await this.fetchOllama(message.payload)
			} else if (message.service === 'openai') {
				response = await this.fetchOpenAI(message.payload)
			}

			webviewPanel.webview.postMessage({
				type: 'ai-completion-response',
				requestId: message.requestId,
				response
			})
		} catch (error) {
			console.error('AI completion request error:', error)
			webviewPanel.webview.postMessage({
				type: 'ai-completion-response',
				requestId: message.requestId,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}

	private async fetchHuggingFace(payload: {
		inputs: string
		parameters: any
	}): Promise<any> {
		const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/codegen-350M-mono', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})

		if (!response.ok) {
			throw new Error(`HuggingFace API error: ${response.status}`)
		}

		return await response.json()
	}

	private async fetchOllama(payload: { model: string; prompt: string; stream: boolean; options: any }): Promise<any> {
		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status}`)
		}

		return await response.json()
	}

	private async fetchOpenAI(payload: { model: string; messages: any[]; temperature: number; max_tokens: number }): Promise<any> {
		const apiKey = vscode.workspace.getConfiguration('pupil').get<string>('openaiApiKey')
		if (!apiKey) {
			throw new Error('OpenAI API key not configured')
		}

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload)
		})

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status}`)
		}

		return await response.json()
	}

	private async initializeLanguageModel() {
		const available = await this.languageModelService.initialize()
		if (available) {
			console.log('✓ VS Code Language Model available:', this.languageModelService.getModelName())
			// Notify webview that Copilot is available
			if (this.webviewPanel) {
				this.webviewPanel.webview.postMessage({
					type: 'language-model-available',
					modelName: this.languageModelService.getModelName()
				})
			}
		} else {
			console.log('ℹ No language models available (Copilot not enabled)')
		}
	}

	private async fetchVSCodeLanguageModel(payload: {
		prompt: string
		context: string
		language: string
	}): Promise<{ completion: string } | null> {
		if (!this.languageModelService.isAvailable()) {
			return null
		}

		const completion = await this.languageModelService.getCompletion(
			payload.prompt,
			payload.context,
			payload.language
		)

		if (!completion) {
			return null
		}

		return { completion }
	}
}
