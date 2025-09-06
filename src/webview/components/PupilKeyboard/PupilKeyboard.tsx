import { KeyboardReact } from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import Snippets from './Snippets/Snippets.js'
import { Button } from '@mui/material'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	onSnippetInput?: (input: string | string[]) => void
	visible: boolean
	toggle: () => void
	focus: 'editor' | 'terminal'
	switchFocus: () => void
}

const PupilKeyboard = ({
	onInput,
	onSnippetInput,
	visible,
	toggle,
	focus,
	switchFocus
}: PupilKeyboardProps) => {
	const { layout, display } = usePupilKeyboard()

	return (
		<div className="flex flex-col">
			<div>
				<Button onClick={toggle}>{visible ? 'Hide Keyboard' : 'Show Keyboard'}</Button>
				<Button onClick={switchFocus}>{focus}</Button>
			</div>
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
