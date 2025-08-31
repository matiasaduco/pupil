import { useEffect, useState } from "react";

const useEditorState = () => {
    const [theme, setTheme] = useState<string>('vs-dark');
    const [value, setValue] = useState<string>('');
    const [language, setLanguage] = useState<string>('plaintext');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'set-theme') {
                setEditorTheme(event);
            }
            else if (event.data.type === 'init') {
                setDocumentText(event);
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
