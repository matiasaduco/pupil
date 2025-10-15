import * as vscode from 'vscode'
import { PupilEditorProvider } from './providers/PupilEditorProvider.js'
import { WebSocketServer, WebSocket } from 'ws'

export function activate(context: vscode.ExtensionContext) {
	let wss: WebSocketServer | undefined = undefined
	let client: WebSocket | undefined = undefined

	const pupilEditorProvider = new PupilEditorProvider(context, sendToSpeechWebClient)
	const editorDisposable = pupilEditorProvider.disposable()
	context.subscriptions.push(editorDisposable)

	const disposable = vscode.commands.registerCommand('pupil.openSpeechWeb', async () => {
		const terminal = vscode.window.createTerminal('WebSocket Server')
		const serverPath = context.asAbsolutePath('speech-web/server.js')
		terminal.sendText(`node "${serverPath}"`, true)

		setTimeout(() => {
			vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'))
		}, 2000)

		wss = new WebSocketServer({ port: 8080 })

		wss.on('connection', (ws) => {
			console.log('Client connected')
			client = ws

			ws.on('message', (message) => {
				const transcript = JSON.parse(message.toString())
				pupilEditorProvider.sendMessageToWebview(transcript)
			})

			ws.on('close', () => {
				console.log('Client disconnected')
				client = undefined
			})
		})
	})

	function sendToSpeechWebClient(message: unknown) {
		const data = JSON.stringify(message)
		client?.send(data)
	}

	context.subscriptions.push({
		dispose: () => {
			wss?.close()
			wss = undefined
		}
	})

	context.subscriptions.push(disposable)
}

export function deactivate() {}
