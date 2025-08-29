import { Editor } from '@monaco-editor/react';
import { usePupilEditor } from './hooks/usePupilEditor.js';
import { forwardRef } from 'react';
import { PupilEditorHandle } from '../../types/PupilEditorHandle.js';

const PupilEditor = forwardRef<PupilEditorHandle, {}>((_, ref) => {
	const { theme, language, value, handleOnChange, handleOnMount } = usePupilEditor(ref);

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

export default PupilEditor
