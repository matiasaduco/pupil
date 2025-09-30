import { useState, useEffect } from 'react'
import { RadioGroup, FormControlLabel, Radio, TextField, useTheme } from '@mui/material'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'

type CreateFileFolderDialogProps = {
	externalOpen?: boolean
	onExternalClose?: () => void
}

const CreateFileFolderDialog = ({ externalOpen, onExternalClose }: CreateFileFolderDialogProps) => {
	const vscode = useVsCodeApi()
	const theme = useTheme()
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
			<RadioGroup
				row
				value={type}
				onChange={(e) => setType(e.target.value as 'file' | 'folder')}
				sx={{ color: theme.palette.text.primary }}
			>
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
				sx={{
					mt: 1,
					input: { color: theme.palette.text.primary },
					label: { color: theme.palette.text.secondary },
					fieldset: { borderColor: theme.palette.divider },
				}}
			/>
		</PupilDialog>
	)
}

export default CreateFileFolderDialog
