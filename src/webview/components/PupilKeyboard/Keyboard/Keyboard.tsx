import { Button } from '@mui/material'
import useKeyboard from './hooks/useKeyboard.js'

type KeyboardProps = {
	onKeyPress?: (input: string) => void
}

const Keyboard = ({ onKeyPress }: KeyboardProps) => {
	const { layout } = useKeyboard()

	return (
		<div className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2">
			{layout.default.map((key) => {
				const Icon = key.icon
				return (
					<Button
						key={key.value}
						onClick={() => onKeyPress?.(key.value)}
						className="rounded bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
						style={{ gridColumn: `span ${key.col || 2} / span ${key.col || 2}` }}
					>
						{Icon ? <Icon /> : key.label || key.value}
					</Button>
				)
			})}
		</div>
	)
}

export default Keyboard
