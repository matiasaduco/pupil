import { useEffect, useState } from 'react'
import { useVsCodeApi } from '../../../../contexts/VsCodeApiContext.js';
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

const useSnippets = () => {
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

	return { snippets }
}

export default useSnippets
