import Keyboard from './Keyboard/Keyboard.js'
import { Button } from '@mui/material'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
	toggle: () => void
	focus: 'editor' | 'terminal'
	switchFocus: () => void
}

const PupilKeyboard = ({ onInput, visible, toggle, focus, switchFocus }: PupilKeyboardProps) => {
	return (
		<div className="flex flex-col">
			<div>
				<Button onClick={toggle}>{visible ? 'Hide Keyboard' : 'Show Keyboard'}</Button>
				<Button onClick={switchFocus}>{focus}</Button>
			</div>
			{visible && <Keyboard onKeyPress={onInput} />}
		</div>
	)
}

export default PupilKeyboard
