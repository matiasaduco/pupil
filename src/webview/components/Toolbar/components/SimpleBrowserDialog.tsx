import { Button } from '@mui/material'
import PupilDialog from '../../PupilDialog/PupilDialog.js'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import logger from '../../../../utils/logger.js'

type SimpleBrowserProps = {
	isOpen: boolean
	onClose: () => void
	onClick: (url: string, port: string) => void
}

const SimpleBrowserDialog = ({ isOpen, onClose, onClick }: SimpleBrowserProps) => {
	const [url, setUrl] = useState<string>('http://localhost')
	const [port, setPort] = useState<string>('3000')
	const { setActiveInput } = useKeyboardFocus()
	const activeInputRef = useRef<HTMLInputElement | null>(null)
	const shouldMaintainFocusRef = useRef(false)

	useLayoutEffect(() => {
		// Maintain focus after state updates from physical keyboard
		if (shouldMaintainFocusRef.current && activeInputRef.current) {
			activeInputRef.current.focus()
			shouldMaintainFocusRef.current = false
		}
	}, [url, port])

	useEffect(() => {
		if (!isOpen) {
			setActiveInput(null)
		}
	}, [isOpen, setActiveInput])

	const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		const nativeInput = e.target as HTMLInputElement
		activeInputRef.current = nativeInput
		setActiveInput(nativeInput)

		logger.info('Input focused in SimpleBrowser', {
			inputId: nativeInput.id,
			inputValue: nativeInput.value,
			timestamp: new Date().toISOString()
		})
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement
		// Keep focus active when typing with physical keyboard
		activeInputRef.current = input
		setActiveInput(input)
		shouldMaintainFocusRef.current = true
	}

	const handleClose = () => {
		setActiveInput(null)
		logger.info('SimpleBrowser dialog closed')
		onClose()
	}

	const handleConfirm = () => {
		logger.info('SimpleBrowser opening URL', { url, port })
		onClick(url, port)
		setActiveInput(null)
		onClose()
	}

	return (
		<PupilDialog open={isOpen} title="Simple Browser" onClose={handleClose}>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<label htmlFor="url" className="font-medium">
						URL
					</label>
					<input
						id="url"
						type="text"
						placeholder="http://localhost"
						value={url}
						onChange={(e) => {
							setUrl(e.target.value)
							handleInputChange(e)
						}}
						onFocus={handleInputFocus}
						className="border border-gray-300 rounded p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label htmlFor="port" className="font-medium">
						Port
					</label>
					<input
						id="port"
						type="text"
						placeholder="3000"
						value={port}
						onChange={(e) => {
							setPort(e.target.value)
							handleInputChange(e)
						}}
						onFocus={handleInputFocus}
						className="border border-gray-300 rounded p-2"
					/>
				</div>
				<Button variant="contained" onClick={handleConfirm}>
					Open Browser
				</Button>
			</div>
		</PupilDialog>
	)
}

export default SimpleBrowserDialog
