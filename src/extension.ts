import * as vscode from 'vscode'
import { PupilEditorProvider } from './providers/PupilEditorProvider.js'

export function activate(context: vscode.ExtensionContext) {
	const editor = PupilEditorProvider.register(context)
	context.subscriptions.push(editor)
}

export function deactivate() {}
