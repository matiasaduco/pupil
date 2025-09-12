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

	return { snippets, handleSnippetPress }
}

export default useSnippets
