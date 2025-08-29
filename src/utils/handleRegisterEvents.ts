import { sendTheme } from "../events/theme.js";
import * as vscode from 'vscode';

export function handleRegisterEvents(webviewPanel: vscode.WebviewPanel) {
    sendTheme(webviewPanel);
}
