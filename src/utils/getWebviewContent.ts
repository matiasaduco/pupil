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
}
