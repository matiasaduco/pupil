
import ReactDOM from 'react-dom/client';
import PupilEditor from './PupilEditor.js';

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<PupilEditor />);
}
