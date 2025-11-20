import { Button, Tooltip, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
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
			className="toolbar-highlightable-button"
			startIcon={icon}
			aria-label={hideLabel ? label : undefined}
			aria-pressed={highlightedButtonId === id}
			variant="outlined"
			size="small"
			sx={{
				textTransform: 'none',
				fontWeight: 600,
				justifyContent: 'flex-start',
				borderWidth: 1,
				borderStyle: 'solid',
				borderColor: highlightedButtonId === id ? highlightColor : 'transparent',
				minWidth: hideLabel ? 40 : 112,
				paddingInline: hideLabel ? 0.75 : 1.25,
				color: theme.palette.text.primary,
				backgroundColor: highlightedButtonId === id
					? alpha(highlightColor, 0.1)
					: theme.palette.mode === 'dark'
						? alpha('#ffffff', 0.04)
						: alpha('#000000', 0.02)
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
