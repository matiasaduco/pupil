import * as React from 'react';
import FolderTree from './FolderTree.js';
import { FolderNode } from './FolderTree.js';
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js';

const FolderTreeContainer: React.FC = () => {
  const [tree, setTree] = React.useState<FolderNode[]>([]);
  const [selecting, setSelecting] = React.useState(false);
  const vscode = useVsCodeApi();

  React.useEffect(() => {
    const listener = (event: MessageEvent) => {
      const msg = event.data;
        console.log('Mensaje recibido en webview:', msg);
      // Si el webview recibe la señal para mostrar el árbol
      if (msg.type === 'show-folder-tree') {
        setTree(msg.items);
        setSelecting(true);
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  const handleSelect = (fullPath: string) => {
    console.log('Carpeta seleccionada en webview:');
    vscode.postMessage({ type: 'folder-selected', path: fullPath });
    setSelecting(false);
    setTree([]); // Limpiamos el árbol para que desaparezca
  };

  if (!selecting) {
    return null; // No mostrar nada si no estamos seleccionando
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 16,
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        borderRadius: 8,
        zIndex: 1000,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <h3>Elegí carpeta destino:</h3>
      <FolderTree tree={tree} onSelect={handleSelect} />
    </div>
  );
};

export default FolderTreeContainer;
