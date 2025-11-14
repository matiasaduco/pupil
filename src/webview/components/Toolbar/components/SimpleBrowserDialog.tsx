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
	const [formState, setFormState] = useState({ url: 'http://localhost', port: '3000' })
	const { setActiveInput } = useKeyboardFocus()
	const inputRef = useRef<HTMLInputElement | null>(null)
	const shouldMaintainFocusRef = useRef(false)

	useLayoutEffect(() => {
		if (shouldMaintainFocusRef.current && inputRef.current) {
			inputRef.current.focus()
			shouldMaintainFocusRef.current = false
		}
	}, [formState])

	useEffect(() => {
		if (!isOpen) {
			setActiveInput(null)
		}
	}, [isOpen, setActiveInput])

	const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		const nativeInput = e.target as HTMLInputElement
		inputRef.current = nativeInput
		setActiveInput(nativeInput)

		logger.info('Input focused in SimpleBrowser', {
			inputId: nativeInput.id,
			inputValue: nativeInput.value,
			timestamp: new Date().toISOString()
		})
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'port') => {
		const input = e.target as HTMLInputElement
		inputRef.current = input
		setActiveInput(input)
		setFormState((prev) => ({ ...prev, [field]: e.target.value }))
		shouldMaintainFocusRef.current = true
	}

	const handleClose = () => {
		setActiveInput(null)
		onClose()
	}

	const handleConfirm = () => {
		logger.info('SimpleBrowser opening URL', { url: formState.url, port: formState.port })
		onClick(formState.url, formState.port)
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
						ref={inputRef}
						id="url"
						type="text"
						placeholder="http://localhost"
						value={formState.url}
						onChange={(e) => handleInputChange(e, 'url')}
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
						value={formState.port}
						onChange={(e) => handleInputChange(e, 'port')}
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
