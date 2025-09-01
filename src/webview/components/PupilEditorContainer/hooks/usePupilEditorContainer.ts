import { useRef, useState } from 'react'
import { PupilEditorHandle } from '../../../types/PupilEditorHandle.js'
import { useVsCodeApi } from '../../../contexts/VsCodeApiContext.js'

const usePupilEditorContainer = () => {
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)
	const vscode = useVsCodeApi()

	const handleKeyboardInput = (input: string) => {
		if (input === '{bksp}') {
			editorRef.current?.deleteAtCursor()
		} else if (input === '{enter}') {
			editorRef.current?.enterAtCursor()
		} else if (input === '{comment}') {
			editorRef.current?.commentAtCursor()
		} else if (input === '{terminal}') {
			vscode.postMessage({ type: 'open-terminal' })
		} else {
			editorRef.current?.insertAtCursor(input)
		}
	}

	const handleSnippetPress = (snippet: string | string[]) => {
		if (Array.isArray(snippet)) {
			snippet.forEach((line, index) => {
				editorRef.current?.insertAtCursor(line)
				if (index < snippet.length - 1) {
					editorRef.current?.enterAtCursor()
				}
			})
		} else {
			editorRef.current?.insertAtCursor(snippet)
		}
	}

	return {
		editorRef,
		keyboardVisible,
		setKeyboardVisible,
		handleKeyboardInput,
		handleSnippetPress
	}
}

export default usePupilEditorContainer
