import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilContainer.js'
import { createTheme, IconButton, ThemeProvider } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import Toolbar from '../Toolbar/Toolbar.js'
import { useEffect } from 'react'
import RadialKeyboard from '../RadialKeyboard/RadialKeyboard.js'

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
		switchColorScheme,
		connectionStatus
	} = usePupilEditorContainer()

	const theme = createTheme({
		palette: {
			mode: colorScheme === 'vs' ? 'light' : 'dark'
		}
	})

	useEffect(() => {
		if (colorScheme === 'vs') {
			document.documentElement.classList.remove('dark')
		} else {
			document.documentElement.classList.add('dark')
		}
	}, [colorScheme])

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
			<div className="flex flex-col h-screen relative">
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
					connectionStatus={connectionStatus}
				/>
				<PupilKeyboard onInput={handleKeyboardInput} visible={keyboardVisible} />
				<RadialKeyboard onInput={handleKeyboardInput} />
			</div>
		</ThemeProvider>
	)
}

export default PupilContainer
