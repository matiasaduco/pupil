import BackspaceIcon from '@mui/icons-material/Backspace'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import TerminalIcon from '@mui/icons-material/Terminal'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'
import { Layout } from '../types/layout.js'

const usePupilKeyboard = () => {
	// const layout = {
	// 	shift: [
	// 		shortcuts,
	// 		'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
	// 		'{tab} Q W E R T Y U I O P { } |',
	// 		'{lock} A S D F G H J K L : " {enter}',
	// 		'{shift} Z X C V B N M < > ? {shift}',
	// 		'.com @ {space}'
	// 	]
	// }

	const layout: Layout = {
		default: [
			{ value: '{comment}', label: '//', col: 4 },
			{ value: '{open-terminal}', label: '>_', icon: TerminalIcon, col: 4 },
			{ value: '{create-terminal}', label: '+>_', col: 4 },
			{ value: '{cls}', label: 'CLS', col: 4 },
			{ value: '{copy}', label: 'Copy', col: 4 },
			{ value: '{paste}', label: 'Paste', col: 4 },
			{ value: '{cut}', label: 'Cut', col: 4 },
			{ value: '{save}', label: 'Save', col: 4 },

			{ value: '`', label: '`' },
			{ value: '1', label: '1' },
			{ value: '2', label: '2' },
			{ value: '3', label: '3' },
			{ value: '4', label: '4' },
			{ value: '5', label: '5' },
			{ value: '6', label: '6' },
			{ value: '7', label: '7' },
			{ value: '8', label: '8' },
			{ value: '9', label: '9' },
			{ value: '0', label: '0' },
			{ value: '-', label: '-' },
			{ value: '=', label: '=' },
			{ value: '{bksp}', icon: BackspaceIcon, col: 4 },

			{ value: '{tab}', label: 'Tab', icon: KeyboardTabIcon, col: 3 },
			{ value: 'q', label: 'q' },
			{ value: 'w', label: 'w' },
			{ value: 'e', label: 'e' },
			{ value: 'r', label: 'r' },
			{ value: 't', label: 't' },
			{ value: 'y', label: 'y' },
			{ value: 'u', label: 'u' },
			{ value: 'i', label: 'i' },
			{ value: 'o', label: 'o' },
			{ value: 'p', label: 'p' },
			{ value: '[', label: '[' },
			{ value: ']', label: ']' },
			{ value: '\\', label: '\\', col: 3 },

			{ value: '{caps}', label: 'Caps', icon: KeyboardCapslockIcon, col: 4 },
			{ value: 'a', label: 'a' },
			{ value: 's', label: 's' },
			{ value: 'd', label: 'd' },
			{ value: 'f', label: 'f' },
			{ value: 'g', label: 'g' },
			{ value: 'h', label: 'h' },
			{ value: 'j', label: 'j' },
			{ value: 'k', label: 'k' },
			{ value: 'l', label: 'l' },
			{ value: ';', label: ';' },
			{ value: "'", label: "'" },
			{ value: '{enter}', label: '< enter', icon: KeyboardReturnIcon, col: 4 },

			{ value: '{shift}', label: 'Shift', col: 4 },
			{ value: 'z', label: 'z' },
			{ value: 'x', label: 'x' },
			{ value: 'c', label: 'c' },
			{ value: 'v', label: 'v' },
			{ value: 'b', label: 'b' },
			{ value: 'n', label: 'n' },
			{ value: 'm', label: 'm' },
			{ value: ',' },
			{ value: '.' },
			{ value: '/' },
			{ value: '{space}', label: 'Space', icon: SpaceBarIcon, col: 6 }
		]
	}

	return { layout }
}

export default usePupilKeyboard
