import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useEffect, useState } from 'react'

type Snippet = {
	extension: string
	file: string
	snippets: Record<string, { prefix?: string; body: string | string[]; description?: string }>
}

type SnippetMessage = {
	user: Snippet[]
	extension: Snippet[]
	builtin: Snippet[]
	all: Snippet[]
}

const useSnippets = (editorRef: RefObject<PupilEditorHandle | null>) => {
	const vscode = useVsCodeApi()
	const [snippets, setSnippets] = useState<SnippetMessage>()
	const [open, setOpen] = useState<boolean>(false)

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === 'snippets') {
				setSnippets(message.snippets)
			}
		}

		window.addEventListener('message', handleMessage)
		vscode.postMessage({ type: 'get-snippets' })

		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const handleSnippetPress = (snippet: string | string[]) => {
		// Prefer inserting directly into the in-webview editor when available so we
		// don't steal focus or open another editor. Only ask the extension to insert
		// a SnippetString when the editorRef is not available (for environments
		// where the webview doesn't host an editor, e.g. tests without a real editor).
		if (editorRef.current) {
			if (Array.isArray(snippet)) {
				editorRef.current.insertMultipleAtCursor(snippet)
			} else {
				editorRef.current.insertAtCursor(snippet)
			}
		} else if (vscode) {
			vscode.postMessage({ type: 'insert-snippet', body: snippet })
		}
		setOpen(false)
	}

	const openModal = () => setOpen(true)
	const onClose = () => setOpen(false)

	return { snippets, handleSnippetPress, open, openModal, onClose }
}

export default useSnippets
