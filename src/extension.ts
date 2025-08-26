import * as vscode from 'vscode';
import { WebSocketServer } from 'ws';

let wss: WebSocketServer;

export function activate(context: vscode.ExtensionContext) {
    let panel: vscode.WebviewPanel;

    const disposable = vscode.commands.registerCommand('pupil.openWebview', () => {
        panel = vscode.window.createWebviewPanel(
            'pupilWebview',
            'Pupil Webview',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        
        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    #gaze-dot {
                        width: 10px;
                        height: 10px;
                        background: red;
                        position: absolute;
                        border-radius: 50%;
                        pointer-events: none;
                    }
                </style>
            </head>
            <body>
                <h2>GazeCloud Eye Tracking</h2>
                <div id="gaze-dot"></div>

                <script>
                    window.addEventListener('message', (event) => {
                        const data = event.data;

                        if (data.type === 'gaze') {
                            const dot = document.getElementById('gaze-dot');
                            const webviewWidth = window.innerWidth;
                            const webviewHeight = window.innerHeight;

                            
                            const x = Math.min(Math.max(data.data.x, 0), webviewWidth - 10); // Subtract dot size
                            const y = Math.min(Math.max(data.data.y, 0), webviewHeight - 10); // Subtract dot size

                            dot.style.left = x + 'px';
                            dot.style.top = y + 'px';
                        }
                    });
                </script>
            </body>
            </html>
        `;
    });

    context.subscriptions.push(disposable);

    
    wss = new WebSocketServer({ port: 8765 });
    console.log('WebSocket puerto 8765');
    wss.on('connection', socket => {
        console.log('Server conectado');
        socket.on('message', message => {
            const gazeData = JSON.parse(message.toString());
            console.log('Gaze Data:', gazeData);

            
            if (panel && panel.visible) {
                panel.webview.postMessage({ type: 'gaze', data: gazeData });
            }
        });
    });
}

export function deactivate() {
    if (wss) wss.close();
}
