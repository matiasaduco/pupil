import { Editor } from '@monaco-editor/react'
import { forwardRef } from 'react'
import { PupilEditorHandle } from '../../types/PupilEditorHandle.js'
import useEditorState from './hooks/useEditorState.js'
import useForwardRef from './hooks/useForwardRef.js'

type PupilEditorProps = {
	keyboardVisible?: boolean
}

const PupilEditor = forwardRef<PupilEditorHandle, PupilEditorProps>(({ keyboardVisible }, ref) => {
	const { handleOnMount } = useForwardRef(ref)
	const { theme, language, value, handleOnChange } = useEditorState()
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
