import { Button } from '@mui/material'

type ActionButtonProps = {
	text?: string
	icon?: React.ReactNode
	color?: string
	onClick: () => void
}

const ActionButton = ({ text, icon, color, onClick }: ActionButtonProps) => (
	<Button
		onClick={onClick}
		sx={{
			color: color || 'text.primary',
			...(icon && {
				minWidth: 40,
				width: 40,
				height: 40,
				borderRadius: '50%',
				padding: 0
			})
		}}
		className={icon ? 'rounded-icon-btn' : ''}
	>
		{icon || text}
	</Button>
)

export default ActionButton
