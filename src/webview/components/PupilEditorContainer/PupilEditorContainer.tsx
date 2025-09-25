import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilEditorContainer.js'
import { Button, createTheme, IconButton, ThemeProvider } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import CreateButton from '../PupilKeyboard/CreateButton.js'
import SimpleBrowser from '../SimpleBrowser/SimpleBrowser.js'

const PupilEditorContainer = () => {
	const isDev = window.location.hostname === 'localhost'
	const {
		editorRef,
		keyboardVisible,
		toggle,
		handleKeyboardInput,
		colorScheme,
		focus,
		switchFocus,
		switchColorScheme,
		openWeb,
		stopProcess
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
				<section className="flex flex-wrap">
					<Snippets editorRef={editorRef} />
					<Button onClick={toggle}>{keyboardVisible ? 'Hide Keyboard' : 'Show Keyboard'}</Button>
					<Button onClick={switchFocus}>{focus}</Button>
					<SimpleBrowser onClick={openWeb} />
					<Button onClick={stopProcess}>Stop Process</Button>
					<TerminalsDialog />
					<CreateButton />
					{/* { value: '{comment}', label: '//', col: 4 }, */}
					{/* { value: '{open-terminal}', label: '>_', icon: TerminalIcon, col: 4 }, */}
					{/* { value: '{create-terminal}', label: '+>_', col: 4 }, */}
					{/* { value: '{cls}', label: 'CLS', col: 4 }, */}
					{/* { value: '{copy}', label: 'Copy', col: 4 }, */}
					{/* { value: '{paste}', label: 'Paste', col: 4 }, */}
					{/* { value: '{cut}', label: 'Cut', col: 4 }, */}
					{/* { value: '{save}', label: 'Save', col: 4 }, */}
				</section>
				<PupilKeyboard onInput={handleKeyboardInput} visible={keyboardVisible} />
			</div>
		</ThemeProvider>
	)
}

export default PupilEditorContainer
