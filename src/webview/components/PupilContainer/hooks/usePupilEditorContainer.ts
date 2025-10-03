import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { useEffect, useRef, useState } from 'react'

type FocusTarget = 'editor' | 'terminal' | 'dialog'

type ActionsProps = {
	editor: Record<string, () => void>
	terminal: Record<string, () => void>
	dialog: Record<string, () => void>
}

const usePupilEditorContainer = () => {
	const vscode = useVsCodeApi()
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)
	const [focus, setFocus] = useState<FocusTarget>('editor')
	const { activeInput, insertIntoActiveInput, deleteFromActiveInput } = useKeyboardFocus()
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
			'{paste}': () => editorRef.current?.pasteClipboard(),
			'{save}': () => {
				vscode.postMessage({ type: 'save-file' })
				editorRef.current?.focus()
			},
			'{undo}': () => editorRef.current?.undo(),
			'{redo}': () => editorRef.current?.redo()
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
			'{paste}': () => vscode.postMessage({ type: 'terminal-paste' }),
			'{save}': () => vscode.postMessage({ type: 'save-file' }),
			'{stop-process}': () => vscode.postMessage({ type: 'stop-process' })
		},
		dialog: {
			'{space}': () => insertIntoActiveInput(' '),
			'{bksp}': () => deleteFromActiveInput(),
			'{enter}': () => {
			},
			'{paste}': async () => {
				const text = await navigator.clipboard.readText()
				insertIntoActiveInput(text)
			}
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

	const switchFocus = (current: FocusTarget) => {
		if (current === 'editor') {
			vscode.postMessage({ type: 'terminal-open' })
			setFocus('terminal')
		} else if (current === 'terminal') {
			vscode.postMessage({ type: 'terminal-hide' })
			setFocus('editor')
		}
	}

	return {
		editorRef,
		keyboardVisible,
		toggleKeyboard: () => setKeyboardVisible(!keyboardVisible),
		handleKeyboardInput,
		colorScheme,
		focus,
		switchFocus,
		switchColorScheme: () => setColorScheme((prev) => (prev === 'vs' ? 'vs-dark' : 'vs'))
	}
}

export default usePupilEditorContainer