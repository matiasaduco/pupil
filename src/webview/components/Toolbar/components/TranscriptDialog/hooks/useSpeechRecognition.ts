import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { useEffect, useState } from 'react'

const useSpeechRecognition = () => {
	const [transcript, setTranscript] = useState<string>('')
	const [listening, setListening] = useState<boolean>(false)
	const vscode = useVsCodeApi()

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === 'transcript') {
				setTranscript(event.data.content)
			}
		}

		window.addEventListener('message', handleMessage)

		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const resetTranscript = () => {
		setTranscript('')
	}

	const startListening = ({ continuous = false } = {}) => {
		if (!listening) {
			setListening(true)
			vscode.postMessage({ type: 'start-listening', continuous })
		}
	}

	const stopListening = () => {
		if (listening) {
			setListening(false)
			vscode.postMessage({ type: 'stop-listening' })
		}
	}

	return { transcript, listening, resetTranscript, startListening, stopListening }
}

export default useSpeechRecognition
