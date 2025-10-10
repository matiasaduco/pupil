import { Card, CardActions, CardContent, CardHeader, useTheme } from '@mui/material'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import usePupilDialog from './hooks/usePupilDialog.js'
import ActionButton from './components/ActionButton.js'

type PupilDialogProps = {
	open: boolean
	title?: string
	children?: React.ReactNode
	onSubmit?: () => void
	onCancel?: () => void
	onClose: () => void
	onSubmitIcon?: React.ReactNode
	onCancelIcon?: React.ReactNode
	extraAction?: React.ReactNode
}

const PupilDialog = ({
	open,
	title,
	children,
	onSubmit,
	onCancel,
	onClose,
	onSubmitIcon,
	onCancelIcon,
	extraAction
}: PupilDialogProps) => {
	const { portalTarget } = usePupilDialog()
	const { palette } = useTheme()

	const Dialog = () => {
		return (
			<>
				<div
					className="absolute inset-0 z-10"
					style={{ backgroundColor: palette.action.disabledBackground }}
					onClick={onClose}
				/>
				<Card
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
					sx={{
						backgroundColor: palette.background.default,
						color: palette.text.primary
					}}
				>
					{title && <CardHeader title={title} />}
					<CardContent>{children}</CardContent>
					<CardActions className={clsx({ hidden: !onCancel && !onSubmit && !extraAction })}>
						{onCancel && (
							<ActionButton
								text="Cancel"
								icon={onCancelIcon}
								color={palette.text.primary}
								onClick={onCancel}
							/>
						)}
						{onSubmit && (
							<ActionButton
								text="Submit"
								icon={onSubmitIcon}
								color={palette.text.primary}
								onClick={onSubmit}
							/>
						)}
						{extraAction}
					</CardActions>
				</Card>
			</>
		)
	}

	return portalTarget && open && createPortal(<Dialog />, portalTarget)
}

export default PupilDialog
