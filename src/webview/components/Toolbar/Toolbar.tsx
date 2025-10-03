import { Button, Divider } from '@mui/material'
import './Toolbar.css'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import useToolbar from './hooks/useToolbar.js'
import ToolbarButton from './components/ToolbarButton.js'
import CreateFileFolderDialog from './components/CreateFileFolderDialog.js'
import SimpleBrowserDialog from './components/SimpleBrowserDialog.js'

type ToolbarProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	keyboardVisible: boolean
	toggleKeyboard: () => void
	focus: 'editor' | 'terminal'
	switchFocus: () => void
	handleButtonClick: (action: string) => void
}

const Toolbar = ({
	editorRef,
	keyboardVisible,
	toggleKeyboard,
	focus,
	switchFocus,
	handleButtonClick
}: ToolbarProps) => {
	const {
		generalShortcuts,
		editorShortcuts,
		terminalShortcuts,
		openFileFolderDialog,
		openSimpleBrowserDialog,
		setOpenFileFolderDialog,
		setOpenSimpleBrowserDialog,
		openWeb
	} = useToolbar(handleButtonClick)

	return (
		<>
			<nav className={'toolbar-nav flex items-center gap-2'}>
				<Button onClick={switchFocus} className="w-35">
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
						onButtonClick={shortcut.onClick!}
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
			</nav>

			<SimpleBrowserDialog
				isOpen={openSimpleBrowserDialog}
				onClick={openWeb}
				onClose={() => setOpenSimpleBrowserDialog(false)}
			/>

			<CreateFileFolderDialog
				externalOpen={openFileFolderDialog}
				onExternalClose={() => setOpenFileFolderDialog(false)}
			/>
		</>
	)
}

export default Toolbar
