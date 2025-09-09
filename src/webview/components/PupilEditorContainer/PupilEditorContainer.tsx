import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'
import Snippets from '../Snippets/Snippets.js'
import { createTheme, ThemeProvider } from '@mui/material'

const PupilEditorContainer = () => {
	const {
		editorRef,
		keyboardVisible,
		toggle,
		handleKeyboardInput,
		handleSnippetPress,
		colorScheme,
		focus,
		switchFocus
	} = usePupilEditorContainer()

	const theme = createTheme({
		palette: {
			mode: colorScheme === 'vs' ? 'light' : 'dark'
		}
	})

	return (
		<ThemeProvider theme={theme}>
			<div className="flex flex-col">
				<PupilEditor
					ref={editorRef}
					keyboardVisible={keyboardVisible}
					visible={focus === 'editor'}
					theme={colorScheme}
				/>
				<Snippets onSnippetPress={handleSnippetPress} />
				<PupilKeyboard
					onInput={handleKeyboardInput}
					visible={keyboardVisible}
					toggle={toggle}
					focus={focus}
					switchFocus={switchFocus}
				/>
			</div>
		</ThemeProvider>
	)
}

export default PupilEditorContainer
