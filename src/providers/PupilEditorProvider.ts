import * as vscode from 'vscode'
import { getEditorContent } from '../utils/getEditorContent.js'
import SnippetManager from '../managers/SnippetManager.js'
import ThemeManager from '../managers/ThemeManager.js'
import DocumentManager from '../managers/DocumentManager.js'
import { DEFAULT_URL } from '../constants.js'

export class PupilEditorProvider implements vscode.CustomTextEditorProvider {
	private static readonly viewType = 'pupil.editor'
	private terminal: vscode.Terminal | null = null

	constructor(private readonly context: vscode.ExtensionContext) {}

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			PupilEditorProvider.viewType,
			new PupilEditorProvider(context),
			{
				webviewOptions: { retainContextWhenHidden: true },
				supportsMultipleEditorsPerDocument: false
			}
		)
	}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_token: vscode.CancellationToken
	): Promise<void> {
		let webviewReady = false

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

		const onDidReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage((message) => {
			try {
				if (message.type === 'ready') {
					this.init(webviewReady, webviewPanel, document)
				}
				if (message.type === 'create-folder') {
					this.createNewFolder(message.name)
				}
				if (message.type === 'create-file') {
					this.createNewFile(message.name)
				}
				if (message.type === 'get-snippets') {
					this.getSnippets(webviewPanel)
				}
				if (message.type === 'edit' && message.content) {
					this.updateTextDocument(document, message.content)
				}
				if (message.type === 'terminal-open') {
					this.openTerminal()
				}
				if (message.type === 'terminal-create') {
					this.createTerminal()
				}
				if (message.type === 'terminal-input' && message.content) {
					this.terminal?.sendText(message.content, false)
				}
				if (message.type === 'terminal-space') {
					this.terminal?.sendText(' ', false)
				}
				if (message.type === 'terminal-bksp') {
					this.terminal?.sendText('\b', false)
				}
				if (message.type === 'terminal-enter') {
					this.terminal?.sendText('\n', false)
				}
				if (message.type === 'terminal-clear') {
					this.terminal?.sendText('clear', true)
				}
				if (message.type === 'terminal-stop-process') {
					this.terminal?.sendText('\x03', true)
				}
				if (message.type === 'terminal-hide') {
					this.terminal?.hide()
				}
				if (message.type === 'terminal-list') {
					this.getTerminals(webviewPanel)
				}
				if (message.type === 'terminal-show' && message.content) {
					this.showTerminal(message.content)
				}
				if (message.type === 'openWeb') {
					this.openWeb(message.url)
				}
			} catch (error) {
				console.error('Error en onDidReceiveMessage:', error)
			}
		})

		const onDidChangeTextDocumentListener = vscode.workspace.onDidChangeTextDocument((e) => {
			try {
				if (e.document.uri.toString() === document.uri.toString()) {
					this.openTextDocument(webviewPanel, e.document)
				}
			} catch (error) {
				console.error('Error en onDidChangeTextDocument:', error)
			}
		})

		webviewPanel.onDidDispose(() => {
			onDidChangeActiveColorThemeListener.dispose()
			onDidReceiveMessageListener.dispose()
			onDidChangeTextDocumentListener.dispose()
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
		let theme = ThemeManager.getCurrentTheme()
		webviewPanel.webview.postMessage({ type: 'set-theme', theme })
	}

	private getSnippets(webviewPanel: vscode.WebviewPanel) {
		const snippets = SnippetManager.getAllSnippets()
		webviewPanel.webview.postMessage({ type: 'snippets', snippets })
	}

	private openTerminal() {
		this.terminal = this.terminal || vscode.window.createTerminal('Pupil Terminal')
		this.terminal.show()
	}

	private createTerminal() {
		this.terminal = vscode.window.createTerminal('Pupil Terminal')
		this.terminal.show()
	}

	private getTerminals(webviewPanel: vscode.WebviewPanel) {
		webviewPanel.webview.postMessage({
			type: 'set-terminals',
			content: vscode.window.terminals
		})
	}

	private showTerminal(index: number) {
		const terminal = vscode.window.terminals[index]
		if (terminal) {
			this.terminal = terminal
			this.terminal.show()
		}
	}

	private async createNewFile(fileName: string) {
		const folders = vscode.workspace.workspaceFolders
		if (!folders || folders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder open.')
			return
		}

		const rootUri = folders[0].uri
		const fileUri = vscode.Uri.joinPath(rootUri, fileName)

		const wsedit = new vscode.WorkspaceEdit()
		wsedit.createFile(fileUri, { ignoreIfExists: true })
		await vscode.workspace.applyEdit(wsedit)

		const doc = await vscode.workspace.openTextDocument(fileUri)
		await vscode.window.showTextDocument(doc)
	}

	private async createNewFolder(folderName: string) {
		const folders = vscode.workspace.workspaceFolders
		if (!folders || folders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder open.')
			return
		}

		const rootUri = folders[0].uri
		const folderUri = vscode.Uri.joinPath(rootUri, folderName)

		try {
			await vscode.workspace.fs.createDirectory(folderUri)
			vscode.window.showInformationMessage(`Folder "${folderName}" created.`)
		} catch (err) {
			vscode.window.showErrorMessage(`Could not create folder: ${err}`)
		}
	}

	private async openWeb(url: string = DEFAULT_URL) {
		await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup')
		await vscode.commands.executeCommand('simpleBrowser.show', url)
	}
}
