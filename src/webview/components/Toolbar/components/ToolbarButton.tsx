import { IconButton, SvgIconTypeMap, Tooltip, Typography, useTheme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { createElement } from 'react'

type ToolbarButtonProps = {
	tooltipTitle: string
	icon?: OverridableComponent<SvgIconTypeMap>
	label?: string
	onButtonClick: () => void
	id?: string
	active?: boolean
}

const ToolbarButton = ({
	tooltipTitle,
	icon,
	label,
	onButtonClick,
	id,
	active
}: ToolbarButtonProps) => {
	const theme = useTheme()
	const highlightColor = theme.palette.primary?.main ?? '#1976d2'

	return (
		<Tooltip title={tooltipTitle}>
			<IconButton
				id={id}
				onClick={onButtonClick}
				sx={{
					width: 35,
					height: 35,
					fontSize: 14,
					color: theme.palette.text.primary,
					borderWidth: active ? 2 : 2,
					borderStyle: 'solid',
					borderColor: active ? highlightColor : 'transparent',
					transition: 'border-color 200ms ease'
				}}
			>
				{icon ? (
					createElement(icon, { sx: { width: 20, height: 20, color: theme.palette.text.primary } })
				) : (
					<Typography
						variant="body2"
						sx={{
							fontSize: '0.75rem',
							color: theme.palette.text.primary
						}}
					>
						{label}
					</Typography>
				)}
			</IconButton>
		</Tooltip>
	)
}

export default ToolbarButton
