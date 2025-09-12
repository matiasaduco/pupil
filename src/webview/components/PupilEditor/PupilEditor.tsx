import { Editor } from '@monaco-editor/react'
import { forwardRef } from 'react'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import useEditorState from './hooks/useEditorState.js'
import useForwardRef from './hooks/useForwardRef.js'

type PupilEditorProps = {
	keyboardVisible?: boolean
	visible?: boolean
	theme?: string
}

const PupilEditor = forwardRef<PupilEditorHandle, PupilEditorProps>(
	({ keyboardVisible, visible, theme }, ref) => {
		const { handleOnMount } = useForwardRef(ref)
		const { language, value, handleOnChange } = useEditorState()
		const editorHeight = keyboardVisible ? '60vh' : '90vh'

		return (
			<div
				className="relative"
				style={{ height: editorHeight, display: visible ? 'block' : 'none' }}
			>
				<Editor
					theme={theme}
					language={language}
					value={value}
					onChange={handleOnChange}
					onMount={handleOnMount}
				/>
				<span id="pupil-dialog-portal" />
			</div>
		)
	}
)

export default PupilEditor
