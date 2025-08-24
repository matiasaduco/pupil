import { useEffect, useState } from "react";

export const usePupilEditor = () => {
    const [theme, setTheme] = useState('vs-dark');

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (msg && msg.type === 'set-theme' && msg.theme) {
        setTheme(msg.theme);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return { theme };
};
