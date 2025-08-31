import * as vscode from 'vscode';
import { PupilEditorProvider } from './providers/PupilEditorProvider.js';
import { EyetrackerProvider } from './providers/EyetrackerProvider.js';

let eyetrackerWebview: EyetrackerProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  const editor = PupilEditorProvider.register(context);
  context.subscriptions.push(editor);

  // Registrar el comando y el WebSocket server
  eyetrackerWebview = new EyetrackerProvider();
  const disposable = eyetrackerWebview.register();
  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (eyetrackerWebview) {
    eyetrackerWebview.dispose();
  }
}
