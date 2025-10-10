import { Button } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import clsx from 'clsx'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
}

const PupilKeyboard = ({ onInput, visible }: PupilKeyboardProps) => {
	const { layout, handleKeyPress, clickedKey } = usePupilKeyboard(onInput)
  const { activeInput, insertIntoActiveInput, deleteFromActiveInput } = useKeyboardFocus()

	if (!visible) {
		return null
	}

	return (
		<div
			className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2"
			style={{ height: 'min(30vh, 220px)' }}
		>
			{layout.map((key, index) => (
				<Button
					key={`${key.value}-${index}`}
					onClick={() => handleKeyPress(key)}
					className={clsx('pupil-keyboard-btn border-2 border-transparent', {
						'border-amber-500!': key.value === clickedKey
					})}
					sx={{
						gridColumn: `span ${key.col || 2} / span ${key.col || 2}`,
						textTransform: 'unset'
					}}
				>
					{key.icon ? <key.icon /> : key.label || key.value}
				</Button>
			))}
		</div>
	)
}

export default PupilKeyboard
