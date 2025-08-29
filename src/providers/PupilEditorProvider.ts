import * as vscode from 'vscode';
import { getEditorContent } from '../utils/getEditorContent.js';

export class PupilEditorProvider implements vscode.CustomTextEditorProvider {
	constructor(private readonly context: vscode.ExtensionContext) {}

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			PupilEditorProvider.viewType,
			new PupilEditorProvider(context),
			{
				webviewOptions: { retainContextWhenHidden: true },
				supportsMultipleEditorsPerDocument: false
			}
		);
	}

	private static readonly viewType = 'pupil.editor';

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		let webviewReady = false;

		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')
			]
		};

		webviewPanel.webview.html = getEditorContent(this.context, webviewPanel.webview);

		const eventsListener = vscode.window.onDidChangeActiveColorTheme(() => {
			this.updateTheme(webviewPanel);
		});

		const onDidReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage((message) => {
			if (message.type === 'ready' && !webviewReady) {
				webviewReady = true;
				this.openTextDocument(webviewPanel, document);
			}
			if (message.type === 'edit') {
				this.updateTextDocument(document, message.content);
			}
		});

		const changeTextDocListener = vscode.workspace.onDidChangeTextDocument((e) => {
			if (e.document.uri.toString() === document.uri.toString()) {
				this.openTextDocument(webviewPanel, e.document);
			}
		});

		webviewPanel.onDidDispose(() => {
			eventsListener.dispose();
			onDidReceiveMessageListener.dispose();
			changeTextDocListener.dispose();
		});
	}

	private openTextDocument(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
		const content = document.getText();
		const fileName = document.fileName;
		const fileExtension = fileName.split('.').pop() || '';

		webviewPanel.webview.postMessage({
			type: 'init',
			content,
			fileName,
			fileExtension
		});
	}

	private updateTextDocument(document: vscode.TextDocument, value: string) {
		const edit = new vscode.WorkspaceEdit();
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);
		edit.replace(document.uri, fullRange, value);
		return vscode.workspace.applyEdit(edit);
	}

	private updateTheme(webviewPanel: vscode.WebviewPanel) {
		const themeKind = vscode.window.activeColorTheme.kind;
		let theme: string;
	
		switch (themeKind) {
			case vscode.ColorThemeKind.Dark:
				theme = 'vs-dark';
				break;
			case vscode.ColorThemeKind.HighContrast:
				theme = 'hc-black';
				break;
			default:
				theme = 'vs';
				break;
		}
		
		webviewPanel.webview.postMessage({ type: 'set-theme', theme });
	}
}
