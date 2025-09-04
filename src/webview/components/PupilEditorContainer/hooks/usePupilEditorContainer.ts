import { useRef, useState } from 'react'
import { PupilEditorHandle } from '../../../types/PupilEditorHandle.js'
import { useVsCodeApi } from '../../../contexts/VsCodeApiContext.js'

const usePupilEditorContainer = () => {
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)
	const vscode = useVsCodeApi()

	const editorActions: Record<string, () => void> = {
		'{bksp}': () => editorRef.current?.deleteAtCursor(),
		'{enter}': () => editorRef.current?.enterAtCursor(),
		'{comment}': () => editorRef.current?.commentAtCursor(),
		'{terminal}': () => vscode.postMessage({ type: 'create-terminal' }),
		'{new-terminal}': () => vscode.postMessage({ type: 'open-terminal' })
	}

	const handleKeyboardInput = (input: string) => {
		if (input in editorActions) {
			editorActions[input]()
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
