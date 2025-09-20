import { useState, useEffect } from 'react'
import { RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import PupilDialog from '../PupilDialog/PupilDialog.js'

type CreateDialogProps = {
	externalOpen?: boolean
	onExternalClose?: () => void
}

const CreateDialog = ({ externalOpen, onExternalClose }: CreateDialogProps) => {
	const vscode = useVsCodeApi()
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [type, setType] = useState<'file' | 'folder'>('file')

	useEffect(() => {
		const handleMiddleClick = (e: MouseEvent) => {
			if (e.button === 1) {
				e.preventDefault()
				setOpen(true)
			}
		}
		window.addEventListener('mouseup', handleMiddleClick, true)
		return () => window.removeEventListener('mouseup', handleMiddleClick, true)
	}, [])

	useEffect(() => {
		if (externalOpen) {
			setOpen(true)
		}
	}, [externalOpen])

	const reset = () => {
		setOpen(false)
		setName('')
		setType('file')
		onExternalClose?.()
	}

	const handleConfirm = () => {
		vscode.postMessage({ type: `create-${type}`, name })
		reset()
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

			<TextField
				autoFocus
				label={`${type === 'file' ? 'File' : 'Folder'} name`}
				fullWidth
				variant="outlined"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
		</PupilDialog>
	)
}

export default CreateDialog
