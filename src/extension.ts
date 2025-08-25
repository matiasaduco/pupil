import * as vscode from 'vscode';
import { PupilEditorProvider } from './providers/PupilEditorProvider.js';

export function activate(context: vscode.ExtensionContext) {
	const editor = vscode.window.registerCustomEditorProvider(
		'pupil.editor',
		new PupilEditorProvider(context),
		{
			webviewOptions: { retainContextWhenHidden: true },
			supportsMultipleEditorsPerDocument: false
		}
	);

	context.subscriptions.push(editor);
}

export function deactivate() {}
