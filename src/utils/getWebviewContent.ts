export function getWebviewContent(): string {
    return `
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
                <h2> Eye Tracking</h2>
                <div id="gaze-dot"></div>

                <script>
                    window.addEventListener('message', (event) => {
                        const data = event.data;

                        if (data.type === 'gaze') {
                            const dot = document.getElementById('gaze-dot');
                            const webviewWidth = window.innerWidth;
                            const webviewHeight = window.innerHeight;

                            const x = Math.min(Math.max(data.data.x * webviewWidth, 0), webviewWidth - 10);
                            const y = Math.min(Math.max(data.data.y * webviewHeight, 0), webviewHeight - 10);

                            dot.style.left = x + 'px';
                            dot.style.top = y + 'px';
                        }
                    });
                    let lastBlinkTime = 0;

                    webgazer.setGazeListener((data, elapsedTime) => {
                        if (!data) {
                            const now = Date.now();
                            if (now - lastBlinkTime > 200) { // at least 200ms between blinks
                                console.log("Blink detected!");
                                lastBlinkTime = now;
                            }
                        }
                    });

                </script>
            </body>
            </html>
        `;
}
