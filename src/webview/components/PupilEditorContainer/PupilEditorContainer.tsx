import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'

const PupilEditorContainer = () => {
	const {
		editorRef,
		keyboardVisible,
		toggle,
		handleKeyboardInput,
		handleSnippetPress,
		focus,
		switchFocus
	} = usePupilEditorContainer()

	return (
		<div className="flex flex-col">
			<PupilEditor ref={editorRef} keyboardVisible={keyboardVisible} visible={focus === 'editor'} />
			<PupilKeyboard
				onInput={handleKeyboardInput}
				onSnippetInput={handleSnippetPress}
				visible={keyboardVisible}
				toggle={toggle}
				focus={focus}
				switchFocus={switchFocus}
			/>
		</div>
	)
}

export default PupilEditorContainer
