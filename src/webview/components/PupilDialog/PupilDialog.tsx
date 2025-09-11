import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type PupilDialogProps = {
	open: boolean
	title: string
	children?: React.ReactNode
	onSubmit?: () => void
	onCancel?: () => void
}

const PupilDialog = ({ open, title, children, onSubmit, onCancel }: PupilDialogProps) => {
	const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(
		typeof window !== 'undefined' ? document.getElementById('pupil-dialog-portal') : null
	)

	useEffect(() => {
		if (portalTarget || typeof window === 'undefined') {
			return
		}

		const observer = new MutationObserver(() => {
			const portal = document.getElementById('pupil-dialog-portal')
			if (portal) {
				setPortalTarget(portal)
				observer.disconnect()
			}
		})

		observer.observe(document.body, { childList: true, subtree: true })
		return () => observer.disconnect()
	}, [portalTarget])

	if (!portalTarget) {
		return null
	}

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
		portalTarget
	)
}

export default PupilDialog
