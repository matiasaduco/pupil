import PupilEditor from '../PupilEditor/PupilEditor.js'
import PupilKeyboard from '../PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'

const PupilEditorContainer = () => {
	const {
		editorRef,
		keyboardVisible,
		setKeyboardVisible,
		handleKeyboardInput,
		handleSnippetPress
	} = usePupilEditorContainer()

	return (
		<div className="container">
			<PupilEditor ref={editorRef} keyboardVisible={keyboardVisible} />
			<PupilKeyboard
				onInput={handleKeyboardInput}
				onSnippetInput={handleSnippetPress}
				visible={keyboardVisible}
				setVisible={setKeyboardVisible}
			/>
		</div>
	)
}

export default PupilEditorContainer
