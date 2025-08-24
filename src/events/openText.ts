import * as vscode from 'vscode';

export const openText = (webviewPanel: vscode.WebviewPanel, openedDocument: vscode.TextDocument) => {
    const fileName = openedDocument.fileName;
    const fileExtension = fileName.split('.').pop() || '';

    webviewPanel.webview.postMessage({
        type: 'init',
        content: openedDocument.getText(),
        fileName,
        fileExtension
    });
};
