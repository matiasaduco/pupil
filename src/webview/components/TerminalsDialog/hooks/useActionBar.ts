import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import Terminal from '@webview/types/Terminal.js'
import { useEffect, useState } from 'react'

const useActionBar = () => {
	const vscode = useVsCodeApi()
	const getTerminals = () => vscode.postMessage({ type: 'terminal-list' })
	const [terminals, setTerminals] = useState<Terminal[]>([])
	const [open, setOpen] = useState<boolean>(false)

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === 'set-terminals') {
				setTerminals(event.data.content)
				setOpen(true)
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const handleOnClose = () => setOpen(false)

	const openTerminal = (processId: number | undefined) => {
		if (processId !== undefined) {
			vscode.postMessage({ type: 'terminal-show', content: processId })
			setOpen(false)
		}
	}

	return { getTerminals, terminals, open, handleOnClose, openTerminal }
}

export default useActionBar
