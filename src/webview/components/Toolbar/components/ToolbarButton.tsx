import { IconButton, SvgIconTypeMap, Tooltip } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { createElement } from 'react'

type ToolbarButtonProps = {
	tooltipTitle: string
	icon?: OverridableComponent<SvgIconTypeMap>
	label?: string
	onButtonClick: () => void
}

const ToolbarButton = ({ tooltipTitle, icon, label, onButtonClick }: ToolbarButtonProps) => (
	<Tooltip title={tooltipTitle}>
		<IconButton onClick={onButtonClick} sx={{ width: 35, height: 35, fontSize: 14 }}>
			{icon ? createElement(icon, { sx: { width: 20, height: 20 } }) : label}
		</IconButton>
	</Tooltip>
)

export default ToolbarButton
