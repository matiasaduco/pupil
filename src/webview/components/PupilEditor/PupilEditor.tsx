import { Editor } from '@monaco-editor/react'
import { usePupilEditor } from './hooks/usePupilEditor.js'
import { forwardRef } from 'react'
import { PupilEditorHandle } from '../../types/PupilEditorHandle.js'

type PupilEditorProps = {
	keyboardVisible?: boolean
}

const PupilEditor = forwardRef<PupilEditorHandle, PupilEditorProps>(({ keyboardVisible }, ref) => {
	const { theme, language, value, handleOnChange, handleOnMount } = usePupilEditor(ref)
	const editorHeight = keyboardVisible ? '60vh' : '100vh'

	return (
		<div style={{ height: editorHeight }}>
			<Editor
				theme={theme}
				language={language}
				value={value}
				onChange={handleOnChange}
				onMount={handleOnMount}
				height="100%"
			/>
		</div>
	)
})

export default PupilEditor
