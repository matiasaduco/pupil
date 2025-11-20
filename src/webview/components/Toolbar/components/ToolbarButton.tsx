import { IconButton, SvgIconTypeMap, Tooltip, Typography, useTheme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { ReactElement, createElement, isValidElement } from 'react'

type ToolbarButtonProps = {
	tooltipTitle: string
	icon?: OverridableComponent<SvgIconTypeMap> | ReactElement
	label?: string
	onButtonClick?: () => void
	onClick?: () => void
	id?: string
	active?: boolean
}

const ToolbarButton = ({
	tooltipTitle,
	icon,
	label,
	onButtonClick,
	onClick,
	id,
	active
}: ToolbarButtonProps) => {
	const theme = useTheme()
	const highlightColor = theme.palette.primary?.main ?? '#1976d2'
	const handleClick = onButtonClick ?? onClick ?? (() => {})

	const renderIcon = () => {
		if (!icon) {
			return null
		}

		if (isValidElement(icon)) {
			return icon
		}

		return createElement(icon, {
			sx: { width: 20, height: 20, color: theme.palette.text.primary }
		})
	}

	const isIconOnly = !!icon && !label
	const ariaLabel = isIconOnly ? (tooltipTitle ?? label) : undefined

	return (
		<Tooltip title={tooltipTitle}>
			<IconButton
				id={id}
				aria-label={ariaLabel}
				onClick={handleClick}
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
					renderIcon()
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
