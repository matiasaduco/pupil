import { Editor } from '@monaco-editor/react';
import { forwardRef } from 'react';
import useEditorState from './hooks/useEditorState.js';
import useForwardRef from './hooks/useForwardRef.js';
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js';

const PupilEditor = forwardRef<PupilEditorHandle, object>((_, ref) => {
  const { theme, value, language, handleOnChange } = useEditorState();
  const { handleOnMount } = useForwardRef(ref);

  return (
    <Editor
      theme={theme}
      language={language}
      value={value}
      onChange={handleOnChange}
      onMount={handleOnMount}
    />
  );
});

export default PupilEditor;
