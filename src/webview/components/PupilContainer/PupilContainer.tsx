import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import usePupilEditorContainer from './hooks/usePupilContainer.js'
import { createTheme, IconButton, ThemeProvider } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import Toolbar from '../Toolbar/Toolbar.js'
import { useEffect, useMemo } from 'react'
import RadialKeyboard from '../RadialKeyboard/RadialKeyboard.js'
import SimpleBrowserDialog from '../Toolbar/components/SimpleBrowserDialog.js'
import CreateFileFolderDialog from '../Toolbar/components/CreateFileFolderDialog.js'
import TranscriptDialog from '../Toolbar/components/TranscriptDialog/TranscriptDialog.js'
import SettingsDialog from '../Toolbar/components/SettingsDialog.js'
import BlinkDialog from '../Toolbar/components/BlinkDialog.js'
import useDialog from './hooks/useDialog.js'
import useRadialPreference from './hooks/useRadialPreference.js'
import useKeyMappings from './hooks/useKeyMappings.js'

const useColorSchemeSync = (colorScheme: string) => {
	useEffect(() => {
		if (colorScheme === 'vs') {
			document.documentElement.classList.remove('dark')
		} else {
			document.documentElement.classList.add('dark')
		}
	}, [colorScheme])
}

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
		connectionStatus,
		openSimpleBrowser,
		handleStartServer,
		handleStopServer,
		isKeyboardHighlighting,
		setKeyboardHighlighting,
		isKeyboardSectionHighlighted,
		setKeyboardSectionHighlighted,
		highlightDelayMs,
		highlightGapMs,
		setHighlightDelayMs,
		sectionGuideMode,
		setSectionGuideMode
	} = usePupilEditorContainer()

	const { radialEnabled, toggleRadial } = useRadialPreference()
	const { keyMappings, handleKeyMappingChange } = useKeyMappings()

	const {
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog,
		openSettingsDialog,
		openBlinkDialog,
		setOpenSimpleBrowserDialog,
		setOpenFileFolderDialog,
		setOpenTranscriptDialog,
		setOpenSettingsDialog,
		setOpenBlinkDialog
	} = useDialog()

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: colorScheme === 'vs' ? 'light' : 'dark'
				}
			}),
		[colorScheme]
	)

	useColorSchemeSync(colorScheme)

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
			<div className="flex flex-col h-screen relative" data-testid="pupil-container">
				<PupilEditor
					ref={editorRef}
					keyboardVisible={keyboardVisible}
					visible={focus === 'editor'}
					theme={colorScheme}
				/>
				<Toolbar
					highlightConfirmKey={keyMappings.highlightSequence}
					editorRef={editorRef}
					keyboardVisible={keyboardVisible}
					toggleKeyboard={toggleKeyboard}
					focus={focus}
					switchFocus={switchFocus}
					handleButtonClick={handleKeyboardInput}
					keyboardHighlighting={isKeyboardHighlighting}
					setKeyboardHighlighting={setKeyboardHighlighting}
					setKeyboardSectionHighlighted={setKeyboardSectionHighlighted}
					highlightDelayMs={highlightDelayMs}
					highlightGapMs={highlightGapMs}
					sectionGuideMode={sectionGuideMode}
					openSimpleBrowserDialog={() => setOpenSimpleBrowserDialog(true)}
					openFileFolderDialog={() => setOpenFileFolderDialog(true)}
					openTranscriptDialog={() => setOpenTranscriptDialog(true)}
					openSettingsDialog={() => setOpenSettingsDialog(true)}
					openBlinkDialog={() => setOpenBlinkDialog(true)}
				/>
				<PupilKeyboard
					onInput={handleKeyboardInput}
					visible={keyboardVisible}
					highlightingEnabled={isKeyboardHighlighting}
					sectionHighlighting={isKeyboardSectionHighlighted}
					highlightDelayMs={highlightDelayMs}
					highlightGapMs={highlightGapMs}
					data-testid="pupil-keyboard"
				/>
				<RadialKeyboard
					onInput={handleKeyboardInput}
					openSimpleBrowserDialog={() => setOpenSimpleBrowserDialog(true)}
					openFileFolderDialog={() => setOpenFileFolderDialog(true)}
					openTranscriptDialog={() => setOpenTranscriptDialog(true)}
					openSettingsDialog={() => setOpenSettingsDialog(true)}
					enabled={radialEnabled}
					activationButton={keyMappings.radialToggle.button}
				/>
				<SimpleBrowserDialog
					isOpen={openSimpleBrowserDialog}
					onClick={openSimpleBrowser}
					onClose={() => setOpenSimpleBrowserDialog(false)}
				/>
				<CreateFileFolderDialog
					externalOpen={openFileFolderDialog}
					onExternalClose={() => setOpenFileFolderDialog(false)}
				/>
				<TranscriptDialog
					isOpen={openTranscriptDialog}
					editorRef={editorRef}
					onClose={() => setOpenTranscriptDialog(false)}
					connectionStatus={connectionStatus}
				/>
				<SettingsDialog
					open={openSettingsDialog}
					onClose={() => setOpenSettingsDialog(false)}
					onStartServer={handleStartServer}
					onStopServer={handleStopServer}
					connectionStatus={connectionStatus}
					radialEnabled={radialEnabled}
					onToggleRadial={toggleRadial}
					highlightDelayMs={highlightDelayMs}
					onHighlightDelayChange={setHighlightDelayMs}
					sectionGuideMode={sectionGuideMode}
					onSectionGuideModeChange={setSectionGuideMode}
					keyMappings={keyMappings}
					onKeyMappingChange={handleKeyMappingChange}
				/>
				<BlinkDialog open={openBlinkDialog} onClose={() => setOpenBlinkDialog(false)} />
			</div>
		</ThemeProvider>
	)
}

export default PupilContainer
