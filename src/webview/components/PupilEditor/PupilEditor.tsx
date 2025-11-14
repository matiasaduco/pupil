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

const PupilEditor = forwardRef<PupilEditorHandle, PupilEditorProps>(({ visible, theme }, ref) => {
	const { handleOnMount } = useForwardRef(ref)
	const { language, value, handleOnChange, initialValue } = useEditorState()

	return (
		<div className={`relative flex-1 min-h-0 ${visible ? '' : 'hidden'}`}>
			{initialValue ? (
				<Editor
					theme={theme}
					language={language}
					value={value}
					defaultValue={initialValue}
					onChange={handleOnChange}
					onMount={handleOnMount}
					options={{
						automaticLayout: true,
						acceptSuggestionOnEnter: 'smart',
						quickSuggestions: {
							other: 'inline',
							comments: true,
							strings: true
						}
					}}
					height="100%"
				/>
			) : (
				<Skeleton variant="rectangular" width="100%" height="100%" />
			)}
			<span id="pupil-dialog-portal" />
		</div>
	)
})

export default PupilEditor
