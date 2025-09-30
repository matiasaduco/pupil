import { Button, Card, CardActions, CardContent, CardHeader, useTheme } from '@mui/material'
import { createPortal } from 'react-dom'
import usePupilDialog from './hooks/usePupilDialog.js'

type PupilDialogProps = {
	open: boolean
	title: string
	children?: React.ReactNode
	onSubmit?: () => void
	onCancel?: () => void
	onClose: () => void
}

const PupilDialog = ({ open, title, children, onSubmit, onCancel, onClose }: PupilDialogProps) => {
	const { portalTarget } = usePupilDialog()
	const theme = useTheme()

	const Dialog = () => {
		return (
			<>
				<div
					className="absolute inset-0 z-10"
					style={{ backgroundColor: theme.palette.action.disabledBackground }}
					onClick={onClose}
				/>
				<Card
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
					sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
				>
					<CardHeader title={title} />
					<CardContent>{children}</CardContent>
					<CardActions>
						{onCancel && <Button onClick={onCancel} sx={{ color: theme.palette.text.primary }}>Cancel</Button>}
						{onSubmit && <Button onClick={onSubmit} sx={{ color: theme.palette.text.primary }}>Submit</Button>}
					</CardActions>
				</Card>
			</>
		)
	}

	return portalTarget && open && createPortal(<Dialog />, portalTarget)
}

export default PupilDialog
