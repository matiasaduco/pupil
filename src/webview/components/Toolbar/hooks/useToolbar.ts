import CopyIcon from '@mui/icons-material/ContentCopy'
import CutIcon from '@mui/icons-material/ContentCut'
import PasteIcon from '@mui/icons-material/ContentPaste'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import ClearIcon from '@mui/icons-material/Clear'
import { SvgIconTypeMap, useTheme } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import TerminalIcon from '@mui/icons-material/Terminal'
import SaveIcon from '@mui/icons-material/Save'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import WebIcon from '@mui/icons-material/Language'
import { useState } from 'react'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import CommentIcon from '@mui/icons-material/Comment'

type Shortcut = {
	value?: string
	label?: string
	tooltipTitle?: string
	icon?: OverridableComponent<SvgIconTypeMap>
	divider?: boolean
}

const useToolbar = (handleButtonClick: (action: string) => void) => {
	const vscode = useVsCodeApi()
	const [openSimpleBrowserDialog, setOpenSimpleBrowserDialog] = useState<boolean>(false)
	const [openFileFolderDialog, setOpenFileFolderDialog] = useState<boolean>(false)
	const [transcriptDialogOpen, setTranscriptDialogOpen] = useState<boolean>(false)

	const generalShortcuts = [
		{
			tooltipTitle: 'Open Simple Browser',
			icon: WebIcon,
			label: 'Open Browser',
			onClick: () => setOpenSimpleBrowserDialog(true)
		},
		{
			tooltipTitle: 'Create New File/Folder',
			icon: CreateNewFolderIcon,
			label: 'Create',
			onClick: () => setOpenFileFolderDialog(true)
		},
		{
			tooltipTitle: 'Open Terminal',
			icon: TerminalIcon,
			label: 'Open Terminal',
			onClick: () => handleButtonClick('{open-terminal}')
		},
		{
			tooltipTitle: 'Save current document',
			icon: SaveIcon,
			label: 'Save Document',
			onClick: () => handleButtonClick('{save}')
		},
		{
			tooltipTitle: 'Start Speech to Text',
			icon: CommentIcon,
			label: 'Speech to Text',
			onClick: () => setTranscriptDialogOpen(true)
		}
	]

	const editorShortcuts: Shortcut[] = [
		{ value: '{comment}', label: '//', tooltipTitle: 'Comment selected line/s' },
		{ value: '{copy}', label: 'Copy', tooltipTitle: 'Copy selection', icon: CopyIcon },
		{ value: '{paste}', label: 'Paste', tooltipTitle: 'Paste from clipboard', icon: PasteIcon },
		{ value: '{cut}', label: 'Cut', tooltipTitle: 'Cut selection', icon: CutIcon },
		{ divider: true },
		{ value: '{undo}', label: 'Undo', tooltipTitle: 'Undo last action', icon: UndoIcon },
		{ value: '{redo}', label: 'Redo', tooltipTitle: 'Redo last action', icon: RedoIcon }
	]

	const terminalShortcuts: Shortcut[] = [
		{ value: '{cls}', label: 'Clear', tooltipTitle: 'Clear terminal screen', icon: ClearIcon },
		{
			value: '{stop-process}',
			label: 'Stop Process',
			tooltipTitle: 'Stop running process',
			icon: StopCircleIcon
		}
	]

	const openSimpleBrowser = (url: string, port: string) => {
		vscode.postMessage({ type: 'openSimpleBrowser', url: `${url}:${port}` })
	}

	return {
		generalShortcuts,
		editorShortcuts,
		terminalShortcuts,
		openSimpleBrowserDialog,
		setOpenSimpleBrowserDialog,
		openFileFolderDialog,
		setOpenFileFolderDialog,
		openSimpleBrowser,
		transcriptDialogOpen,
		setTranscriptDialogOpen
	}
}

export default useToolbar
