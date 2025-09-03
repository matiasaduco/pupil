import { KeyboardReact } from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import Snippets from './Snippets/Snippets.js'
import './PupilKeyboard.css'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	onSnippetInput?: (input: string | string[]) => void
	visible: boolean
	setVisible: (v: boolean) => void
}

const PupilKeyboard = ({ onInput, onSnippetInput, visible, setVisible }: PupilKeyboardProps) => {
	const { layout, display } = usePupilKeyboard()

	return (
		<div className="keyboard-container">
			<button onClick={() => setVisible(!visible)}>
				{visible ? 'Hide Keyboard' : 'Show Keyboard'}
			</button>
			{visible && (
				<>
					<Snippets onSnippetPress={onSnippetInput} />
					<KeyboardReact onKeyPress={onInput} layout={layout} display={display} />
				</>
			)}
		</div>
	)
}

export default PupilKeyboard
