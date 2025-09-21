import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { useEffect, useState } from 'react'

const useEditorState = () => {
	const [value, setValue] = useState<string>('')
	const [language, setLanguage] = useState<string>('plaintext')
	const vscode = useVsCodeApi()
	const [initialValue, setInitialValue] = useState('')

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === 'init') {
				setDocumentText(event)
			}
		}

		window.addEventListener('message', handleMessage)
		vscode.postMessage({ type: 'ready' })

		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const setDocumentText = (event: MessageEvent) => {
		const msg = event.data
		let lang = 'plaintext'

		if (['js', 'jsx'].includes(msg.fileExtension)) {
			lang = 'javascript'
		} else if (['ts', 'tsx'].includes(msg.fileExtension)) {
			lang = 'typescript'
		} else if (msg.fileExtension === 'json') {
			lang = 'json'
		} else if (msg.fileExtension === 'md') {
			lang = 'markdown'
		} else if (msg.fileExtension === 'css') {
			lang = 'css'
		} else if (msg.fileExtension === 'html') {
			lang = 'html'
		}

		setInitialValue(msg.content || '')
		setLanguage(lang)
	}

	const handleOnChange = (value: string | undefined) => {
		vscode.postMessage({
			type: 'edit',
			content: value || ''
		})
		setValue(value || '')
	}

	return { language, value, handleOnChange, initialValue }
}

export default useEditorState
