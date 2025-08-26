import { useEffect } from "react";
const webgazer = require("webgazer");

declare const acquireVsCodeApi: () => {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};
interface GazeData {
  x: number; // horizontal pixel coord
  y: number; // vertical pixel coord
}

// Receive messages from extension
window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.type === 'gaze') {
        const dot = document.getElementById('gaze-dot');
        if(dot) {
            dot.style.left = message.data.x + 'px';
            dot.style.top = message.data.y + 'px';
        }
    }
});

const PupilEditor = () => {
  useEffect(() => {
    // Start WebGazer
    // @ts-ignore
    webgazer.setRegression('ridge') // optional, choose model
      .setGazeListener((data: GazeData, elapsedTime:number ) => {
        if (data) {
          const vscode = acquireVsCodeApi();
          vscode.postMessage({ type: 'gaze', x: data.x, y: data.y });
        }
      })
      .begin();
    
    // Show the video and face overlay (optional)
    webgazer.showVideo(true).showFaceOverlay(true).showPredictionPoints(true);

    return () => {
      webgazer.end();
    };
  }, []);

  return <div>WebGazer Running!</div>;
};
export default PupilEditor;
