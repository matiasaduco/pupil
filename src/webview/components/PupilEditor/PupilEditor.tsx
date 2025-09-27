import { Editor } from '@monaco-editor/react'
import { forwardRef } from 'react'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import useEditorState from './hooks/useEditorState.js'
import useForwardRef from './hooks/useForwardRef.js'
import { Skeleton } from '@mui/material'

type PupilEditorProps = {
	keyboardVisible?: boolean
	visible?: boolean
	theme?: string
}

const PupilEditor = forwardRef<PupilEditorHandle, PupilEditorProps>(
	({ keyboardVisible, visible, theme }, ref) => {
		const { handleOnMount } = useForwardRef(ref)
		const { language, value, handleOnChange, initialValue } = useEditorState()
		const editorHeight = keyboardVisible ? '65vh' : '90vh'

		return (
			<div
				className="relative"
				style={{ height: editorHeight, display: visible ? 'block' : 'none' }}
			>
				{initialValue ? (
					<Editor
						theme={theme}
						language={language}
						value={value}
						defaultValue={initialValue}
						onChange={handleOnChange}
						onMount={handleOnMount}
					/>
				) : (
					<Skeleton variant="rectangular" width="100%" height="90vh" />
				)}
				<span id="pupil-dialog-portal" />
			</div>
		)
	}
)

export default PupilEditor
