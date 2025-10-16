import { Button, Divider } from '@mui/material'
import './Toolbar.css'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useState } from 'react'
import useToolbar from './hooks/useToolbar.js'
import ToolbarButton from './components/ToolbarButton.js'
import CreateFileFolderDialog from './components/CreateFileFolderDialog.js'
import SimpleBrowserDialog from './components/SimpleBrowserDialog.js'
import TranscriptDialog from './components/TranscriptDialog/TranscriptDialog.js'
import SettingsDialog from './components/SettingsDialog.js'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import SettingsIcon from '@mui/icons-material/Settings'
import { ConnectionStatusType } from '../../../constants.js'

type FocusTarget = 'editor' | 'terminal' | 'dialog'

type ToolbarProps = {
	focus: FocusTarget
	switchFocus: (next: FocusTarget) => void
	handleButtonClick: (input: string) => void
	editorRef: RefObject<PupilEditorHandle | null>
	keyboardVisible: boolean
	toggleKeyboard: () => void
	connectionStatus: ConnectionStatusType
}

const Toolbar = ({
	editorRef,
	keyboardVisible,
	toggleKeyboard,
	focus,
	switchFocus,
	handleButtonClick,
	connectionStatus
}: ToolbarProps) => {
	const vscode = useVsCodeApi()
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

	const handleStartServer = () => {
		vscode.postMessage({ type: 'start-speech-server' })
	}

	const handleStopServer = () => {
		vscode.postMessage({ type: 'stop-speech-server' })
	}

	const handleSettingsClick = () => {
		setSettingsDialogOpen(true)
	}

	const {
		generalShortcuts,
		editorShortcuts,
		terminalShortcuts,
		openFileFolderDialog,
		openSimpleBrowserDialog,
		setOpenFileFolderDialog,
		setOpenSimpleBrowserDialog,
		openSimpleBrowser,
		transcriptDialogOpen,
		setTranscriptDialogOpen
	} = useToolbar(handleButtonClick)

	return (
		<>
			<nav className={'toolbar-nav flex items-center gap-2'}>
				<Button onClick={() => switchFocus(focus)} className="w-35">
					{focus}
				</Button>
				<Button onClick={toggleKeyboard}>{`${keyboardVisible ? 'Hide' : 'Show'}`} Keyboard</Button>
				<TerminalsDialog />

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* GENERAL SHORTCUTS */}
				{generalShortcuts.map((shortcut) => (
					<ToolbarButton
						key={shortcut.label}
						tooltipTitle={shortcut.tooltipTitle!}
						icon={shortcut.icon}
						label={shortcut.label}
						onButtonClick={shortcut.onClick}
					/>
				))}

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* EDITOR SHORTCUTS */}
				{focus === 'editor' && (
					<>
						<Snippets editorRef={editorRef} />
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
								<ToolbarButton
									key={shortcut.value}
									tooltipTitle={shortcut.tooltipTitle!}
									icon={shortcut.icon}
									label={shortcut.label}
									onButtonClick={() => handleButtonClick(shortcut.value!)}
								/>
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
							<ToolbarButton
								key={shortcut.value}
								tooltipTitle={shortcut.tooltipTitle!}
								icon={shortcut.icon}
								label={shortcut.label}
								onButtonClick={() => handleButtonClick(shortcut.value!)}
							/>
						)
					)}

				<span className="grow-1" />

				<ToolbarButton
					key="settings"
					tooltipTitle="Settings"
					icon={SettingsIcon}
					label="Settings"
					onButtonClick={handleSettingsClick}
				/>
			</nav>

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
				isOpen={transcriptDialogOpen}
				editorRef={editorRef}
				onClose={() => setTranscriptDialogOpen(false)}
				connectionStatus={connectionStatus}
			/>

			<SettingsDialog
				open={settingsDialogOpen}
				onClose={() => setSettingsDialogOpen(false)}
				onStartServer={handleStartServer}
				onStopServer={handleStopServer}
				connectionStatus={connectionStatus}
			/>
		</>
	)
}

export default Toolbar
