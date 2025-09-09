import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'
import { createPortal } from 'react-dom'

type PupilDialogProps = {
	open: boolean
	title: string
	children?: React.ReactNode
	onSubmit?: () => void
	onCancel?: () => void
}

const PupilDialog = ({ open, title, children, onSubmit, onCancel }: PupilDialogProps) => {
	return createPortal(
		open && (
			<>
				<div className="absolute inset-0 bg-black/50 bg-opacity-50 z-10 pointer-events-auto" />
				<Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
					<CardHeader title={title} />
					<CardContent>{children}</CardContent>
					<CardActions>
						{onCancel && <Button onClick={onCancel}>Cancel</Button>}
						{onSubmit && <Button onClick={onSubmit}>Submit</Button>}
					</CardActions>
				</Card>
			</>
		),

		document.getElementById('pupil-dialog-portal')!
	)
}

export default PupilDialog
