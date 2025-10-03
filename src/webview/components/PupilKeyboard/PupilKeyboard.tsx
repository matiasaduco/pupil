import { Button } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
}

const PupilKeyboard = ({ onInput, visible }: PupilKeyboardProps) => {
	const { layout } = usePupilKeyboard()

	if (!visible) {
		return null
	}

	return (
		<div
			className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2"
			style={{ height: 'min(30vh, 220px)' }}
		>
			{layout.default.map((key) => {
				const Icon = key.icon
				return (
					<Button
						key={key.value}
						onClick={() => onInput?.(key.value)}
						className="pupil-keyboard-btn"
						style={{ gridColumn: `span ${key.col || 2} / span ${key.col || 2}` }}
					>
						{Icon ? <Icon /> : key.label || key.value}
					</Button>
				)
			})}
		</div>
	)
}

export default PupilKeyboard
