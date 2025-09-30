import { useState, useEffect, useRef } from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'

type CreateFileFolderDialogProps = {
	externalOpen?: boolean
	onExternalClose?: () => void
}

const CreateFileFolderDialog = ({ externalOpen, onExternalClose }: CreateFileFolderDialogProps) => {
	const vscode = useVsCodeApi()
	const { setActiveInput } = useKeyboardFocus()
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [type, setType] = useState<'file' | 'folder'>('file')
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (externalOpen) {
			setOpen(true)
		}
	}, [externalOpen])

	useEffect(() => {
		if (!open) {
			setActiveInput(null)
		} else {
			setTimeout(() => {
				inputRef.current?.focus()
			}, 100)
		}
	}, [open, setActiveInput])

	const reset = () => {
		setOpen(false)
		setName('')
		setType('file')
		setActiveInput(null)
		onExternalClose?.()
	}

	const handleConfirm = () => {
		if (!name.trim()) {
			return
		}

		vscode.postMessage({ type: `create-${type}`, name })
		reset()
	}

	const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		const nativeInput = e.target as HTMLInputElement
		inputRef.current = nativeInput
		setActiveInput(nativeInput)
		console.log('Input focused, registered:', nativeInput)
	}

	return (
		<PupilDialog
			open={open}
			title={`Create New ${type === 'file' ? 'File' : 'Folder'}`}
			onSubmit={handleConfirm}
			onCancel={reset}
			onClose={reset}
		>
			<RadioGroup row value={type} onChange={(e) => setType(e.target.value as 'file' | 'folder')}>
				<FormControlLabel value="file" control={<Radio />} label="File" />
				<FormControlLabel value="folder" control={<Radio />} label="Folder" />
			</RadioGroup>

			<div className="flex flex-col gap-2 mt-4">
				<label htmlFor="name-input" className="font-medium">
					{type === 'file' ? 'File' : 'Folder'} name
				</label>
				<input
					ref={inputRef}
					id="name-input"
					type="text"
					placeholder={`Enter ${type} name`}
					value={name}
					onChange={(e) => setName(e.target.value)}
					onFocus={handleInputFocus}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handleConfirm()
						}
					}}
					className="border border-gray-300 rounded p-2"
				/>
			</div>
		</PupilDialog>
	)
}

export default CreateFileFolderDialog
