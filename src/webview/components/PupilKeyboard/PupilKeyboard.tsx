import { KeyboardReact } from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
}

const PupilKeyboard = ({ onInput }: PupilKeyboardProps) => {
	const { layout, display } = usePupilKeyboard();

	return <KeyboardReact onKeyPress={onInput} layout={layout} display={display} />
}

export default PupilKeyboard
