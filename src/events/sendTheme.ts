import * as vscode from 'vscode';

export function sendTheme(webviewPanel: vscode.WebviewPanel) {
    const themeKind = vscode.window.activeColorTheme.kind;
    let theme: string;

    switch (themeKind) {
        case vscode.ColorThemeKind.Dark:
            theme = 'vs-dark';
            break;
        case vscode.ColorThemeKind.HighContrast:
            theme = 'hc-black';
            break;
        default:
            theme = 'vs';
            break;
    }
    
    webviewPanel.webview.postMessage({ type: 'set-theme', theme });
}
