import PupilEditor from './components/PupilEditor/PupilEditor.js'
import PupilKeyboard from './components/PupilKeyboard/PupilKeyboard.js'
import { useRef, useState } from 'react'
import { PupilEditorHandle } from './types/PupilEditorHandle.js'
import './App.css'

const App = () => {
	const editorRef = useRef<PupilEditorHandle>(null)
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(true)

	const handleKeyboardInput = (input: string) => {
		if (input === '{bksp}') {
			editorRef.current?.deleteAtCursor()
		} else if (input === '{enter}') {
			editorRef.current?.enterAtCursor()
		} else if (input === '{comment}') {
			editorRef.current?.commentAtCursor()
		} else {
			editorRef.current?.insertAtCursor(input)
		}
	}

	return (
		<div className="container">
			<PupilEditor ref={editorRef} keyboardVisible={keyboardVisible} />
			<PupilKeyboard
				onInput={handleKeyboardInput}
				visible={keyboardVisible}
				setVisible={setKeyboardVisible}
			/>
		</div>
	)
}

export default App
