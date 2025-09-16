import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { useEffect, useRef, useState } from 'react'
import { DEFAULT_PORT, LOCALHOST } from '../../../../constants.js'

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
			if (event.data.type === 'set-focus') {
				setFocus(event.data.focus)
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
			'{copy}': () => editorRef.current?.copySelection(),
			'{cut}': () => editorRef.current?.cutSelection(),
			'{create-terminal}': () => {
				vscode.postMessage({ type: 'terminal-create' })
				setFocus('terminal')
			},
			'{open-terminal}': () => {
				vscode.postMessage({ type: 'terminal-open' })
				setFocus('terminal')
			},
			'{cls}': () => vscode.postMessage({ type: 'terminal-clear' }),
			'{paste}': () => editorRef.current?.pasteClipboard()
		},
		terminal: {
			'{space}': () => vscode.postMessage({ type: 'terminal-space' }),
			'{bksp}': () => vscode.postMessage({ type: 'terminal-bksp' }),
			'{enter}': () => vscode.postMessage({ type: 'terminal-enter' }),
			'{create-terminal}': () => {
				vscode.postMessage({ type: 'terminal-create' })
				setFocus('terminal')
			},
			'{open-terminal}': () => {
				vscode.postMessage({ type: 'terminal-open' })
				setFocus('terminal')
			},
			'{cls}': () => vscode.postMessage({ type: 'terminal-clear' }),
			'{paste}': () => vscode.postMessage({ type: 'terminal-paste' })
		}
	}

	const handleKeyboardInput = (input: string) => {
		const actionsF = actions[focus]
		if (input in actionsF) {
			actionsF[input]()
		} else if (focus === 'editor') {
			editorRef.current?.insertAtCursor(input)
		} else if (focus === 'terminal') {
			vscode.postMessage({ type: 'terminal-input', content: input })
		}
	}

	const switchFocus = () => {
		setFocus((prev) => {
			if (prev === 'editor') {
				vscode.postMessage({ type: 'terminal-open' })
				return 'terminal'
			} else {
				vscode.postMessage({ type: 'terminal-hide' })
				return 'editor'
			}
		})
	}

	const openWeb = (url: string = LOCALHOST, port: string = DEFAULT_PORT) => {
		vscode.postMessage({ type: 'openWeb', url: `${url}:${port}` })
	}

	return {
		editorRef,
		keyboardVisible,
		toggle: () => setKeyboardVisible(!keyboardVisible),
		handleKeyboardInput,
		colorScheme,
		focus,
		switchFocus,
		switchColorScheme: () => setColorScheme((prev) => (prev === 'vs' ? 'vs-dark' : 'vs')),
		openWeb,
		stopProcess: () => vscode.postMessage({ type: 'terminal-stop-process' })
	}
}

export default usePupilEditorContainer
