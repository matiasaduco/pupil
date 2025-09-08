import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { useRef, useState } from 'react'

type ActionsProps = {
	editor: Record<string, () => void>
	terminal: Record<string, () => void>
}

const usePupilEditorContainer = () => {
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)
	const [focus, setFocus] = useState<'editor' | 'terminal'>('editor')
	const vscode = useVsCodeApi()

	const actions: ActionsProps = {
		editor: {
			'{space}': () => editorRef.current?.insertAtCursor(' '),
			'{bksp}': () => editorRef.current?.deleteAtCursor(),
			'{enter}': () => editorRef.current?.enterAtCursor(),
			'{comment}': () => editorRef.current?.commentAtCursor(),
			'{create-terminal}': () => vscode.postMessage({ type: 'create-terminal' }),
			'{open-terminal}': () => vscode.postMessage({ type: 'open-terminal' })
		},
		terminal: {
			'{space}': () => editorRef.current?.insertAtCursor(' '),
			'{bksp}': () => vscode.postMessage({ type: 'terminal-bksp' }),
			'{enter}': () => vscode.postMessage({ type: 'terminal-enter' }),
			'{clear}': () => vscode.postMessage({ type: 'terminal-clear' }),
			'{create-terminal}': () => vscode.postMessage({ type: 'create-terminal' }),
			'{open-terminal}': () => vscode.postMessage({ type: 'open-terminal' }),
			'{cls}': () => vscode.postMessage({ type: 'terminal-clear' })
		}
	}

	const handleKeyboardInput = (input: string) => {
		const actionsF = actions[focus]
		if (input in actionsF) {
			actionsF[input]()
		} else if (focus === 'editor') {
			editorRef.current?.insertAtCursor(input)
		} else if (focus === 'terminal') {
			vscode.postMessage({ type: 'terminal-input', value: input })
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
		toggle: () => setKeyboardVisible(!keyboardVisible),
		handleKeyboardInput,
		handleSnippetPress,
		focus,
		switchFocus: () =>
			setFocus((prev) => {
				if (prev === 'editor') {
					vscode.postMessage({ type: 'open-terminal' })
					return 'terminal'
				} else {
					vscode.postMessage({ type: 'hide-terminal' })
					return 'editor'
				}
			})
	}
}

export default usePupilEditorContainer
