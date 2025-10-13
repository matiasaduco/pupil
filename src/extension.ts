import * as vscode from 'vscode'
import { PupilEditorProvider } from './providers/PupilEditorProvider.js'

export function activate(context: vscode.ExtensionContext) {
	const editor = PupilEditorProvider.register(context)
	context.subscriptions.push(editor)

	const disposable = vscode.commands.registerCommand('pupil.openSpeechWeb', async () => {
		const terminal = vscode.window.createTerminal('SpeechWeb Server')
		const serverPath = context.asAbsolutePath('speech-web/server.js')
		terminal.sendText(`node "${serverPath}"`, true)
		terminal.show()

		setTimeout(() => {
			vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'))
		}, 2000)
	})
	context.subscriptions.push(disposable)
}

export function deactivate() {}
