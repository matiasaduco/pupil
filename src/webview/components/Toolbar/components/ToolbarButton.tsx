import { IconButton, SvgIconTypeMap, Tooltip, Typography, useTheme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { createElement } from 'react'

type ToolbarButtonProps = {
  tooltipTitle: string
  icon?: OverridableComponent<SvgIconTypeMap>
  label?: string
  onButtonClick: () => void
}

const ToolbarButton = ({ tooltipTitle, icon, label, onButtonClick }: ToolbarButtonProps) => {
	const theme = useTheme()

	return (
		<Tooltip title={tooltipTitle}>
			<IconButton
				onClick={onButtonClick}
				sx={{
					width: 35,
					height: 35,
					fontSize: 14,
					color: theme.palette.text.primary
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
