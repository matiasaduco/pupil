import { Button, Tooltip, useTheme } from '@mui/material'
import { ReactNode } from 'react'

interface HighlightableButtonProps {
	id: string
	onClick: () => void
	highlightedButtonId: string | null
	label?: string
	icon?: ReactNode
	tooltipTitle?: string
	hideLabel?: boolean
}

const HighlightableButton = ({
	id,
	onClick,
	highlightedButtonId,
	label,
	icon,
	tooltipTitle,
	hideLabel
}: HighlightableButtonProps) => {
	const theme = useTheme()
	const highlightColor = theme.palette.primary?.main ?? '#1976d2'

	const button = (
		<Button
			id={id}
			onClick={onClick}
			className="w-35"
			startIcon={icon}
			aria-label={hideLabel ? label : undefined}
			sx={{
				borderWidth: 2,
				borderStyle: 'solid',
				borderColor: highlightedButtonId === id ? highlightColor : 'transparent',
				minWidth: hideLabel ? 40 : undefined
			}}
		>
			{hideLabel ? null : label}
		</Button>
	)

	if (tooltipTitle || hideLabel) {
		return <Tooltip title={tooltipTitle ?? label}>{button}</Tooltip>
	}

	return button
}

export default HighlightableButton
