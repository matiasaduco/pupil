import * as vscode from 'vscode';
import { WebSocketServer } from 'ws';
import { getWebviewContent } from '@utils/getWebviewContent.js';

export class EyetrackerProvider {
  private panel: vscode.WebviewPanel | undefined;
  private wss: WebSocketServer;

  constructor() {
    // Inicializar el WebSocketServer
    this.wss = new WebSocketServer({ port: 8765 });
    console.log('WebSocket server started on port 8765');

    // Manejar conexiones WebSocket
    this.wss.on('connection', (socket) => {
      console.log('WebSocket client connected');
      socket.on('message', (message) => {
        const gazeData = JSON.parse(message.toString());
        console.log('Received Gaze Data:', gazeData);

        // Enviar datos al Webview si está abierto
        if (this.panel && this.panel.visible) {
          this.panel.webview.postMessage({ type: 'gaze', data: gazeData });
        }
      });
    });
  }

  public register(): vscode.Disposable {
    return vscode.commands.registerCommand('pupil.openWebview', () => {
      this.panel = vscode.window.createWebviewPanel(
        'pupilWebview',
        'Pupil Webview',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
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
