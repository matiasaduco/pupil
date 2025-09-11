import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'
import Snippets from '../Snippets/Snippets.js'
<<<<<<< Updated upstream
import { createTheme, ThemeProvider } from '@mui/material'

const PupilEditorContainer = () => {
=======
import { createTheme, IconButton, ThemeProvider } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

const PupilEditorContainer = () => {
	const isDev = window.location.hostname === 'localhost'
>>>>>>> Stashed changes
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
