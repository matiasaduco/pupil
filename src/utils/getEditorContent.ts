import * as vscode from 'vscode';
import * as fs from 'fs';

export function getEditorContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): string {
  const assetsPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview', 'assets');
  let jsFile = '';
  let cssFile = '';
  try {
    const files = fs.readdirSync(assetsPath.fsPath);
    jsFile = files.find((f: string) => f.endsWith('.js')) || '';
    cssFile = files.find((f: string) => f.endsWith('.css')) || '';
  } catch (e) {
    console.error('Error reading assets directory:', e);
  }

  const scriptUri = jsFile ? webview.asWebviewUri(vscode.Uri.joinPath(assetsPath, jsFile)) : '';
  const styleUri = cssFile ? webview.asWebviewUri(vscode.Uri.joinPath(assetsPath, cssFile)) : '';

  return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1.0" />
				<link href="${styleUri}" rel="stylesheet" />
			</head>
			<body>
				<div id="root"></div>
				<script type="module" src="${scriptUri}"></script>
			</body>
		</html>`;
}
