import * as vscode from 'vscode';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { getWebviewContent } from '../utils/getWebviewContent.js';

export class EyetrackerProvider {
    private panel: vscode.WebviewPanel | undefined;
    private wss: WebSocketServer;

    constructor() {
        // Inicializar el WebSocketServer
        this.wss = new WebSocketServer({ port: 8765 });
        console.log('WebSocket server started on port 8765');

        // Manejar conexiones WebSocket
        this.wss.on('connection', socket => {
            console.log('WebSocket client connected');
            socket.on('message', message => {
                const gazeData = JSON.parse(message.toString());
                console.log('Received Gaze Data:', gazeData);

                // Enviar datos al Webview si está abierto
                if (this.panel && this.panel.visible) {
                    this.panel.webview.postMessage({ type: 'gaze', data: gazeData });
                }
            });
        });
        const app = express();
        const PORT = 3000;

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        app.use(express.static(path.join(__dirname, '../../src/webview')));

        app.listen(PORT, () => {
            console.log(`Eye Tracker server running at http://localhost:${PORT}/eye-tracker.html`);
        });
    }

    public register(): vscode.Disposable {
        return vscode.commands.registerCommand('pupil.openWebview', () => {
            this.panel = vscode.window.createWebviewPanel(
                'pupilWebview',
                'Pupil Webview',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            this.panel.webview.html = getWebviewContent();
        });
    }

    public dispose() {
        if (this.wss) {
            this.wss.close();
        }
    }
}
