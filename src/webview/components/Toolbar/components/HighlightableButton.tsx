import React, { useEffect } from 'react'
import { Button, useTheme, SxProps } from '@mui/material'

interface HighlightableButtonProps {
	id: string
	onClick: () => void
	highlightedButtonId: string | null
	label: React.ReactNode
	className?: string
	sx?: SxProps
	registerButton?: (id: string, handler: () => void) => () => void
}

const HighlightableButton = ({
	id,
	onClick,
	highlightedButtonId,
	label,
	className,
	sx
	,registerButton
}: HighlightableButtonProps) => {
	const theme = useTheme()
	const highlightColor = theme.palette.primary?.main ?? '#1976d2'

	useEffect(() => {
		if (!registerButton) return
		const unregister = registerButton(id, onClick)
		return () => unregister()
	}, [id, onClick, registerButton])

	return (
		<Button
			id={id}
			data-highlighted={highlightedButtonId === id ? 'true' : 'false'}
			onClick={onClick}
			className={`${className || 'w-35'}`}
			sx={{
				borderWidth: 2,
				borderStyle: 'solid',
				borderColor: highlightedButtonId === id ? highlightColor : 'transparent',
				...sx
			}}
		>
			{label}
		</Button>
	)
}

export default HighlightableButton
