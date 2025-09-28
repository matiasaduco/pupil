import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'
import { createTheme, IconButton, ThemeProvider } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import Toolbar from '../Toolbar/Toolbar.js'

const PupilContainer = () => {
	const isDev = window.location.hostname === 'localhost'
	const {
		editorRef,
		keyboardVisible,
		toggleKeyboard,
		handleKeyboardInput,
		colorScheme,
		focus,
		switchFocus,
		switchColorScheme
	} = usePupilEditorContainer()

	const theme = createTheme({
		palette: {
			mode: colorScheme === 'vs' ? 'light' : 'dark'
		}
	})

	return (
		<ThemeProvider theme={theme}>
			{isDev && (
				<IconButton className="absolute border-2 border-gray-500 top-2 right-2 z-50" size="small">
					{colorScheme === 'vs' ? (
						<LightModeIcon onClick={switchColorScheme} />
					) : (
						<DarkModeIcon onClick={switchColorScheme} />
					)}
				</IconButton>
			)}
			<div className="flex flex-col">
				<PupilEditor
					ref={editorRef}
					keyboardVisible={keyboardVisible}
					visible={focus === 'editor'}
					theme={colorScheme}
				/>
				<Toolbar
					editorRef={editorRef}
					keyboardVisible={keyboardVisible}
					toggleKeyboard={toggleKeyboard}
					focus={focus}
					switchFocus={switchFocus}
					handleButtonClick={handleKeyboardInput}
				/>
				<PupilKeyboard onInput={handleKeyboardInput} visible={keyboardVisible} />
			</div>
		</ThemeProvider>
	)
}

export default PupilContainer
