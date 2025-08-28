import { useEffect, useState } from "react";

const useEditorState = () => {
    const [theme, setTheme] = useState<string>('vs-dark');
    const [value, setValue] = useState<string>('');
    const [language, setLanguage] = useState<string>('plaintext');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            switch (event.data.type) {
            case 'set-theme':
                setEditorTheme(event);
                break;
            case 'init':
                setDocumentText(event);
                break;
            default:
                console.error(`Unknown message type: ${event.data.type}`);
                break;
            }
        };

        window.addEventListener('message', handleMessage);

        const vscode = acquireVsCodeApi();
        vscode.postMessage({ type: 'ready' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const setEditorTheme = (event: MessageEvent) => {
      setTheme(event.data.theme);
    };
  
    const setDocumentText = (event: MessageEvent) => {
      const msg = event.data;
      let lang = 'plaintext';
  
      if (['js', 'jsx'].includes(msg.fileExtension)) { lang = 'javascript'; }
      else if (['ts', 'tsx'].includes(msg.fileExtension)) { lang = 'typescript'; }
      else if (msg.fileExtension === 'json') { lang = 'json'; }
      else if (msg.fileExtension === 'md') { lang = 'markdown'; }
      else if (msg.fileExtension === 'css') { lang = 'css'; }
      else if (msg.fileExtension === 'html') { lang = 'html'; }
  
      setValue(msg.content || '');
      setLanguage(lang);
    };
  
    const handleOnChange = (value: string | undefined) => {
      const vscode = acquireVsCodeApi();
        vscode.postMessage({
          type: 'edit',
          content: value || ''
        });
        setValue(value || "");
    };

    return { theme, value, language, handleOnChange, setEditorTheme, setDocumentText };
};

export default useEditorState;
