import { KeyboardReact } from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
	setVisible: (v: boolean) => void
}

const PupilKeyboard = ({ onInput, visible, setVisible }: PupilKeyboardProps) => {
	const { layout, display } = usePupilKeyboard()

	return (
		<div>
			<button onClick={() => setVisible(!visible)}>
				{visible ? 'Hide Keyboard' : 'Show Keyboard'}
			</button>
			{visible && <KeyboardReact onKeyPress={onInput} layout={layout} display={display} />}
		</div>
	)
}

export default PupilKeyboard
