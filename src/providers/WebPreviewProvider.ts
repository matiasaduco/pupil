import * as vscode from 'vscode'
import getPreviewContent from '../utils/getPreviewContent.js'

export class WebPreviewProvider {
	static currentPanel: vscode.WebviewPanel | undefined

	static showPanel() {
		if (WebPreviewProvider.currentPanel) {
			WebPreviewProvider.currentPanel.reveal()
			return
		}

		const panel = vscode.window.createWebviewPanel(
			'myWebview',
			'Project Preview',
			{ viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
			{ enableScripts: true }
		)

		WebPreviewProvider.currentPanel = panel
		panel.webview.html = getPreviewContent()

		panel.onDidDispose(() => {
			WebPreviewProvider.currentPanel = undefined
		})
	}
}
