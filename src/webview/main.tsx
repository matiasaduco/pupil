import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Hello from React Webview!</h1>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
