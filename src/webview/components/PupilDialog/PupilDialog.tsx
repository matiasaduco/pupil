import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'
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

	const Dialog = () => {
		return (
			<>
				<div
					className="absolute inset-0 bg-black/50 bg-opacity-50 z-10 pointer-events-auto"
					onClick={onClose}
				/>
				<Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
					<CardHeader title={title} />
					<CardContent>{children}</CardContent>
					<CardActions>
						{onCancel && <Button onClick={onCancel}>Cancel</Button>}
						{onSubmit && <Button onClick={onSubmit}>Submit</Button>}
					</CardActions>
				</Card>
			</>
		)
	}

	return portalTarget && open && createPortal(<Dialog />, portalTarget)
}

export default PupilDialog
