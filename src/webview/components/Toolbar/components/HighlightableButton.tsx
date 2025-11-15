import { Button, useTheme } from '@mui/material'

interface HighlightableButtonProps {
	id: string
	onClick: () => void
	highlightedButtonId: string | null
	label: string
}

const HighlightableButton = ({
	id,
	onClick,
	highlightedButtonId,
	label
}: HighlightableButtonProps) => {
	const theme = useTheme()
	const highlightColor = theme.palette.primary?.main ?? '#1976d2'

	return (
		<Button
			id={id}
			onClick={onClick}
			className="w-35"
			sx={{
				borderWidth: 2,
				borderStyle: 'solid',
				borderColor: highlightedButtonId === id ? highlightColor : 'transparent'
			}}
		>
			{label}
		</Button>
	)
}

export default HighlightableButton
