import { Button } from '@mui/material'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
}

const PupilKeyboard = ({ onInput, visible }: PupilKeyboardProps) => {
	const { layout } = usePupilKeyboard()

	return (
		visible && (
			<div className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2 h-[30vh]">
				{layout.default.map((key) => {
					const Icon = key.icon
					return (
						<Button
							key={key.value}
							onClick={() => onInput?.(key.value)}
							className="rounded bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
							style={{ gridColumn: `span ${key.col || 2} / span ${key.col || 2}` }}
						>
							{Icon ? <Icon /> : key.label || key.value}
						</Button>
					)
				})}
			</div>
		)
	)
}

export default PupilKeyboard
