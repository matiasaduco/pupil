import * as vscode from 'vscode';
import { getWebviewContent } from '../utils/getWebviewContent.js';
import { sendTheme } from '../events/sendTheme.js';
import { openText } from '../events/openText.js';

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

		webviewPanel.webview.html = getWebviewContent(this.context, webviewPanel.webview);

		const eventsListener = vscode.window.onDidChangeActiveColorTheme(() => {
			sendTheme(webviewPanel);
		});

		const openTextDocListener = vscode.workspace.onDidOpenTextDocument(() => {
			openText(webviewPanel, document);
		});

		const onDidReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage((message) => {
			if (message.type === 'ready' && !webviewReady) {
				webviewReady = true;
				openText(webviewPanel, document);
			}
			if (message.type === 'edit') {
				this.updateTextDocument(document, message.content);
			}
		});

		// const changeTextDocListener = vscode.workspace.onDidChangeTextDocument((e) => {
		// 	if (e.document.uri.toString() === document.uri.toString()) {
		// 		openText(webviewPanel, e.document);
		// 	}
		// });

		webviewPanel.onDidDispose(() => {
			eventsListener.dispose();
			openTextDocListener.dispose();
			onDidReceiveMessageListener.dispose();
			// changeTextDocListener.dispose();
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
}
