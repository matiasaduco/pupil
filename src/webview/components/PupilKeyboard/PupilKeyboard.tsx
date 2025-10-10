import { Button } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
}

const PupilKeyboard = ({ onInput, visible }: PupilKeyboardProps) => {
	const { layout, toggleShift, isShifted } = usePupilKeyboard()
	const { activeInput, insertIntoActiveInput, deleteFromActiveInput } = useKeyboardFocus()

	const handleKeyPress = (key: { value: string; label?: string }) => {
		if (key.value === '{caps}' || key.value === '{shift}') {
			toggleShift()
			return
		}
		if (activeInput.current) {
			if (key.value === '{bksp}') {
				deleteFromActiveInput()
			} else if (key.value === '{space}') {
				insertIntoActiveInput(' ')
			} else if (key.value === '{enter}') {
				insertIntoActiveInput('\n')
			} else if (key.value === '{tab}') {
				insertIntoActiveInput('\t')
			} else if (key.value.startsWith('{')) {
				onInput?.(key.value)
			} else {
				insertIntoActiveInput(key.value)
			}
		} else {
			onInput?.(key.value)
		}
	}
	if (!visible) {
		return null
	}

	return (
		<div
			className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2"
			style={{ height: 'min(30vh, 220px)' }}
		>
			{layout.default.map((key, index) => {
				const Icon = key.icon
				const isActive = (key.value === '{caps}' || key.value === '{shift}') && isShifted
				return (
					<Button
						key={`${key.value}-${index}`}
						onClick={() => handleKeyPress(key)}
						className={`pupil-keyboard-btn ${isActive ? 'active' : ''}`}
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
