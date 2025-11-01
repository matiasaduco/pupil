import BackspaceIcon from '@mui/icons-material/Backspace'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'
import CopyIcon from '@mui/icons-material/ContentCopy'
import CutIcon from '@mui/icons-material/ContentCut'
import PasteIcon from '@mui/icons-material/ContentPaste'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import ClearIcon from '@mui/icons-material/Clear'
import TerminalIcon from '@mui/icons-material/Terminal'
import SaveIcon from '@mui/icons-material/Save'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import WebIcon from '@mui/icons-material/Language'
import CommentIcon from '@mui/icons-material/Comment'
import { SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { useEffect, useState } from 'react'

type Shortcut = {
	value?: string
	label?: string
	tooltipTitle?: string
	icon?: OverridableComponent<SvgIconTypeMap>
	divider?: boolean
	onClick?: () => void
	closeOnClick?: boolean
}

type Layout = {
	label?: string
	value?: string
	icon?: React.ElementType
	col?: number
	childrens?: Layout[]
	onClick?: () => void
}

const useRadialMenu = (
	handleButtonClick: (action: string) => void,
	openSimpleBrowserDialog: () => void,
	openFileFolderDialog: () => void,
	openTranscriptDialog: () => void,
	openSettingsDialog: () => void
) => {
	const generalShortcuts: Shortcut[] = [
		{
			tooltipTitle: 'Open Simple Browser',
			icon: WebIcon,
			label: 'Open Browser',
			onClick: openSimpleBrowserDialog,
			closeOnClick: true
		},
		{
			tooltipTitle: 'Create New File/Folder',
			icon: CreateNewFolderIcon,
			label: 'Create',
			onClick: openFileFolderDialog,
			closeOnClick: true
		},
		{
			tooltipTitle: 'Open Terminal',
			icon: TerminalIcon,
			label: 'Open Terminal',
			onClick: () => handleButtonClick('{open-terminal}'),
			closeOnClick: true
		},
		{
			tooltipTitle: 'Save current document',
			icon: SaveIcon,
			label: 'Save Document',
			onClick: () => handleButtonClick('{save}'),
			closeOnClick: true
		},
		{
			tooltipTitle: 'Start Speech to Text',
			icon: CommentIcon,
			label: 'Speech to Text',
			onClick: openTranscriptDialog,
			closeOnClick: true
		},
		{
			tooltipTitle: 'Open Settings',
			icon: SaveIcon,
			label: 'Settings',
			onClick: openSettingsDialog,
			closeOnClick: true
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

	const layout: Layout[] = [
		{
			label: 'Keyboard',
			childrens: [
				{
					label: 'Numbers',
					childrens: [
						{ value: '1', label: '1' },
						{ value: '2', label: '2' },
						{ value: '3', label: '3' },
						{ value: '4', label: '4' },
						{ value: '5', label: '5' },
						{ value: '6', label: '6' },
						{ value: '7', label: '7' },
						{ value: '8', label: '8' },
						{ value: '9', label: '9' },
						{ value: '0', label: '0' }
					]
				},
				{
					label: 'Alphabet',
					childrens: [
						{ value: 'a', label: 'a' },
						{ value: 'b', label: 'b' },
						{ value: 'c', label: 'c' },
						{ value: 'd', label: 'd' },
						{ value: 'e', label: 'e' },
						{ value: 'f', label: 'f' },
						{ value: 'g', label: 'g' },
						{ value: 'h', label: 'h' },
						{ value: 'i', label: 'i' },
						{ value: 'j', label: 'j' },
						{ value: 'k', label: 'k' },
						{ value: 'l', label: 'l' },
						{ value: 'm', label: 'm' },
						{ value: 'n', label: 'n' },
						{ value: 'o', label: 'o' },
						{ value: 'p', label: 'p' },
						{ value: 'q', label: 'q' },
						{ value: 'r', label: 'r' },
						{ value: 's', label: 's' },
						{ value: 't', label: 't' },
						{ value: 'u', label: 'u' },
						{ value: 'v', label: 'v' },
						{ value: 'w', label: 'w' },
						{ value: 'x', label: 'x' },
						{ value: 'y', label: 'y' },
						{ value: 'z', label: 'z' }
					]
				},
				{
					label: 'Symbols',
					childrens: [
						{ value: '!', label: '!' },
						{ value: '@', label: '@' },
						{ value: '#', label: '#' },
						{ value: '$', label: '$' },
						{ value: '%', label: '%' },
						{ value: '^', label: '^' },
						{ value: '&', label: '&' },
						{ value: '*', label: '*' },
						{ value: '(', label: '(' },
						{ value: ')', label: ')' },
						{ value: '_', label: '_' },
						{ value: '+', label: '+' },
						{ value: '{', label: '{' },
						{ value: '}', label: '}' },
						{ value: '|', label: '|' },
						{ value: ':', label: ':' },
						{ value: '"', label: '"' },
						{ value: '<', label: '<' },
						{ value: '>', label: '>' },
						{ value: '?', label: '?' },
						{ value: '`', label: '`' },
						{ value: '-', label: '-' },
						{ value: '=', label: '=' },
						{ value: '[', label: '[' },
						{ value: ']', label: ']' },
						{ value: ';', label: ';' },
						{ value: "'", label: "'" },
						{ value: ',', label: ',' },
						{ value: '.', label: '.' },
						{ value: '/', label: '/' }
					]
				},
				{
					label: 'Special Keys',
					childrens: [
						{ value: '{bksp}', icon: BackspaceIcon, col: 4 },
						{ value: '{tab}', label: 'Tab', icon: KeyboardTabIcon, col: 3 },
						{ value: '\\', label: '\\', col: 3 },
						{ value: '{caps}', label: 'Caps', icon: KeyboardCapslockIcon, col: 4 },
						{ value: '{enter}', label: '< enter', icon: KeyboardReturnIcon, col: 4 },
						{ value: '{shift}', label: 'Shift', col: 4 },
						{ value: '{space}', label: 'Space', icon: SpaceBarIcon, col: 6 }
					]
				}
			]
		},
		{
			label: 'Toolbar',
			childrens: [
				{
					label: 'General',
					childrens: generalShortcuts.map((shortcut) => ({
						label: shortcut.label,
						icon: shortcut.icon,
						onClick: shortcut.closeOnClick
							? () => {
									shortcut.onClick?.()
									setShow(false)
								}
							: shortcut.onClick
					}))
				},
				{
					label: 'Editor',
					childrens: editorShortcuts
						.filter((s) => !s.divider)
						.map((shortcut) => ({
							label: shortcut.label,
							value: shortcut.value,
							icon: shortcut.icon
						}))
				},
				{
					label: 'Terminal',
					childrens: terminalShortcuts.map((shortcut) => ({
						label: shortcut.label,
						value: shortcut.value,
						icon: shortcut.icon
					}))
				}
			]
		}
	]

	const [show, setShow] = useState(false)
	const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

	useEffect(() => {
		const handleMiddleClick = (e: MouseEvent) => {
			if (e.button === 1) {
				e.preventDefault()
				setShow(true)
				setPosition({ x: e.clientX, y: e.clientY })
			}
		}

		window.addEventListener('mouseup', handleMiddleClick, true)
		return () => window.removeEventListener('mouseup', handleMiddleClick, true)
	}, [])

	const handleItemClick = (
		event: React.MouseEvent<SVGGElement, MouseEvent>,
		index: number,
		data?: string
	) => {
		if (data) {
			handleButtonClick(data)
		}
	}

	return { layout, show, setShow, position, handleItemClick }
}

export default useRadialMenu
