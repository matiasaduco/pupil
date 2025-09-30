import { Button } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
}

const PupilKeyboard = ({ onInput, visible }: PupilKeyboardProps) => {
	const { layout } = usePupilKeyboard()
	const { activeInput, insertIntoActiveInput, deleteFromActiveInput } = useKeyboardFocus()

	const handleKeyPress = (key: { value: string; label?: string }) => {
		if (activeInput) {
			if (key.value === '{bksp}') {
				deleteFromActiveInput()
			} else if (key.value === '{space}') {
				insertIntoActiveInput(' ')
			} else if (key.value === '{enter}') {
				insertIntoActiveInput('\n')
			} else if (key.value === '{tab}') {
				insertIntoActiveInput('\t')
			} else if (!key.value.startsWith('{')) {
				insertIntoActiveInput(key.value)
			}
		} else {
			onInput?.(key.value)
		}
	}

	if (!visible) return null


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
						onClick={() => handleKeyPress(key)}
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
