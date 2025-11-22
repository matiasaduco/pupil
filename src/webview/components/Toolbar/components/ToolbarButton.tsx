import { IconButton, SvgIconTypeMap, Tooltip, Typography, useTheme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { ReactElement, createElement, isValidElement } from 'react'

type ToolbarButtonProps = {
	tooltipTitle: string
	icon?: OverridableComponent<SvgIconTypeMap> | ReactElement
	label?: string
	onClick?: () => void
	id?: string
	active?: boolean
	onButtonClick: () => void
	onDragStart?: (e: React.DragEvent) => void
	onDragOver?: (e: React.DragEvent) => void
	onDrop?: (e: React.DragEvent) => void
	onDragEnd?: () => void
}

const ToolbarButton = ({
	tooltipTitle,
	icon,
	label,
	onButtonClick,
	onClick,
	id,
	active,
	onDragStart,
	onDragOver,
	onDrop,
	onDragEnd
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
		<div
			draggable={!!onDragStart}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragEnd={onDragEnd}
			style={{ display: 'inline-flex' }}
		>
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
						transition: 'border-color 200ms ease',
						cursor: onDragStart ? 'grab' : 'pointer',
						'&:active': {
							cursor: onDragStart ? 'grabbing' : 'pointer'
						}
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
		</div>
	)
}

export default ToolbarButton
