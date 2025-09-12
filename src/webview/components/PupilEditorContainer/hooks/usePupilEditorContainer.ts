import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { useEffect, useRef, useState } from 'react'

type ActionsProps = {
	editor: Record<string, () => void>
	terminal: Record<string, () => void>
}

const usePupilEditorContainer = () => {
	const vscode = useVsCodeApi()
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)
	const [focus, setFocus] = useState<'editor' | 'terminal'>('editor')
	const [colorScheme, setColorScheme] = useState<string>('vs-dark')

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === 'set-theme') {
				setColorScheme(event.data.theme)
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const actions: ActionsProps = {
		editor: {
			'{space}': () => editorRef.current?.insertAtCursor(' '),
			'{bksp}': () => editorRef.current?.deleteAtCursor(),
			'{enter}': () => editorRef.current?.enterAtCursor(),
			'{comment}': () => editorRef.current?.commentAtCursor(),
			'{create-terminal}': () => vscode.postMessage({ type: 'terminal-create' }),
			'{open-terminal}': () => vscode.postMessage({ type: 'terminal-open' })
		},
		terminal: {
			'{space}': () => vscode.postMessage({ type: 'terminal-space' }),
			'{bksp}': () => vscode.postMessage({ type: 'terminal-bksp' }),
			'{enter}': () => vscode.postMessage({ type: 'terminal-enter' }),
			'{create-terminal}': () => vscode.postMessage({ type: 'terminal-create' }),
			'{open-terminal}': () => vscode.postMessage({ type: 'terminal-open' }),
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

	const switchFocus = () =>
		setFocus((prev) => {
			if (prev === 'editor') {
				vscode.postMessage({ type: 'terminal-open' })
				return 'terminal'
			} else {
				vscode.postMessage({ type: 'terminal-hide' })
				return 'editor'
			}
		})

	return {
		editorRef,
		keyboardVisible,
		toggle: () => setKeyboardVisible(!keyboardVisible),
		handleKeyboardInput,
		colorScheme,
		focus,
		switchFocus,
		switchColorScheme: () => setColorScheme((prev) => (prev === 'vs' ? 'vs-dark' : 'vs'))
	}
}

export default usePupilEditorContainer
