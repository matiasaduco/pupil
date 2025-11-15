import { Divider, IconButton } from '@mui/material'
import './Toolbar.css'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import useToolbar from './hooks/useToolbar.js'
import ToolbarButton from './components/ToolbarButton.js'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import HighlightableButton from './components/HighlightableButton.js'
import useTypeWithBlink from '../../../hooks/useTypeWithBlink.js'

type FocusTarget = 'editor' | 'terminal' | 'dialog'

type ToolbarProps = {
	focus: FocusTarget
	switchFocus: (next: FocusTarget) => void
	handleButtonClick: (input: string) => void
	editorRef: RefObject<PupilEditorHandle | null>
	keyboardVisible: boolean
	toggleKeyboard: () => void
	openSimpleBrowserDialog: () => void
	openFileFolderDialog: () => void
	openTranscriptDialog: () => void
	openSettingsDialog: () => void
	openBlinkDialog: () => void
	highlightDelayMs?: number
	highlightGapMs?: number
}

const Toolbar = ({
	editorRef,
	keyboardVisible,
	toggleKeyboard,
	focus,
	switchFocus,
	handleButtonClick,
	openSimpleBrowserDialog,
	openFileFolderDialog,
	openTranscriptDialog,
	openSettingsDialog,
	openBlinkDialog,
	highlightDelayMs,
	highlightGapMs
}: ToolbarProps) => {
	const { generalShortcuts, editorShortcuts, terminalShortcuts } = useToolbar(
		handleButtonClick,
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog
	)

	const { highlightedButtonId, isHighlighting, nextButtonId, toggleHighlightSequence, registerButton } =
		useTypeWithBlink(highlightDelayMs, highlightGapMs)

	return (
		<>
			<nav className={'toolbar-nav flex items-center gap-2'}>
				<HighlightableButton
					id={nextButtonId()}
					registerButton={registerButton}
					highlightedButtonId={highlightedButtonId}
					onClick={() => switchFocus(focus)}
					label={focus}
				/>

				<HighlightableButton
					id={nextButtonId()}
					registerButton={registerButton}
					highlightedButtonId={highlightedButtonId}
					onClick={toggleKeyboard}
					label={`${keyboardVisible ? 'Hide' : 'Show'} Keyboard`}
				/>

				<TerminalsDialog id={nextButtonId()} highlightedButtonId={highlightedButtonId} registerButton={registerButton} />

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* GENERAL SHORTCUTS */}
				{generalShortcuts.map((shortcut) => {
					const id = nextButtonId(shortcut.label)
					return (
						<ToolbarButton
							key={shortcut.label}
							tooltipTitle={shortcut.tooltipTitle!}
							icon={shortcut.icon}
							label={shortcut.label}
							onButtonClick={shortcut.onClick || (() => {})}
							id={id}
							active={highlightedButtonId === id}
						/>
					)
				})}

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* EDITOR SHORTCUTS */}
				{focus === 'editor' && (
					<>
						<Snippets
							id={nextButtonId()}
							highlightedButtonId={highlightedButtonId}
							editorRef={editorRef}
							registerButton={registerButton}
						/>
						{editorShortcuts.map((shortcut) =>
							shortcut.divider ? (
								<Divider
									key="divider"
									orientation="vertical"
									variant="middle"
									flexItem
									sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
								/>
							) : (
								(() => {
									const id = nextButtonId(shortcut.value ?? shortcut.label)
									return (
										<ToolbarButton
											key={shortcut.value}
											tooltipTitle={shortcut.tooltipTitle!}
											icon={shortcut.icon}
											label={shortcut.label}
											onButtonClick={() => handleButtonClick(shortcut.value!)}
											id={id}
											active={highlightedButtonId === id}
											registerButton={registerButton}
										/>
									)
								})()
							)
						)}
					</>
				)}

				{/* TERMINAL SHORTCUTS */}
				{focus === 'terminal' &&
					terminalShortcuts.map((shortcut) =>
						shortcut.divider ? (
							<Divider
								key="divider"
								orientation="vertical"
								variant="middle"
								flexItem
								sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
							/>
						) : (
							(() => {
								const id = nextButtonId(shortcut.value ?? shortcut.label)
								return (
										<ToolbarButton
										key={shortcut.value}
										tooltipTitle={shortcut.tooltipTitle!}
										icon={shortcut.icon}
										label={shortcut.label}
										onButtonClick={() => handleButtonClick(shortcut.value!)}
										id={id}
										active={highlightedButtonId === id}
											registerButton={registerButton}
									/>
								)
							})()
						)
					)}

				<span className="grow-1" />

				{(() => {
					const id = nextButtonId('settings')
					return (
						<ToolbarButton
							key="settings"
							tooltipTitle="Settings"
							icon={SettingsIcon}
							label="Settings"
							onButtonClick={openSettingsDialog}
							id={id}
							active={highlightedButtonId === id}
							registerButton={registerButton}
						/>
					)
				})()}
				{(() => {
					const id = nextButtonId('eye-tracking')
					return (
						<ToolbarButton
							key="blink"
							tooltipTitle="Eye Tracking"
							icon={VisibilityIcon}
							label="Eye Tracking"
							onButtonClick={openBlinkDialog}
							id={id}
							active={highlightedButtonId === id}
							registerButton={registerButton}
						/>
					)
				})()}

				<IconButton data-testid="start-highlight-sequence" onClick={toggleHighlightSequence}>
					{isHighlighting ? <StopIcon /> : <PlayArrowIcon />}
				</IconButton>
			</nav>
		</>
	)
}

export default Toolbar
