import * as vscode from 'vscode'
import { PupilEditorProvider } from './providers/PupilEditorProvider.js'
import { WebSocketServer } from 'ws'

export function activate(context: vscode.ExtensionContext) {
	let wss: WebSocketServer | undefined

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

		wss = new WebSocketServer({ port: 8080 })

		wss.on('connection', (ws) => {
			console.log('Client connected')

			ws.on('message', (message) => {
				const transcript = message.toString()
				console.log(`Received message: ${transcript}`)
				vscode.window.showInformationMessage(`Transcripción: ${transcript}`)
			})

			ws.on('close', () => {
				console.log('Client disconnected')
			})
		})
	})

	context.subscriptions.push({
		dispose: () => {
			wss?.close()
			wss = undefined
		}
	})

	context.subscriptions.push(disposable)
}

export function deactivate() {}
