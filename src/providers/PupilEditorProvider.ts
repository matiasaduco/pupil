import * as vscode from 'vscode';
import { getWebviewContent } from '../utils/getWebviewContent.js';
import { handleRegisterEvents } from '../utils/handleRegisterEvents.js';

export class PupilEditorProvider implements vscode.CustomTextEditorProvider {
	constructor(private readonly context: vscode.ExtensionContext) {}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')
			]
		};

		webviewPanel.webview.html = getWebviewContent(this.context, webviewPanel.webview);

		const eventsListener = vscode.window.onDidChangeActiveColorTheme(() => {
			handleRegisterEvents(webviewPanel);
		});

		webviewPanel.onDidDispose(() => {
			eventsListener.dispose();
		});
	}
}
