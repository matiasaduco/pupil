import { useEffect, useState } from 'react'

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
	const [snippets, setSnippets] = useState<SnippetMessage>()

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === 'snippets') {
				setSnippets(message.snippets)
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [])

	return { snippets }
}

export default useSnippets
