import BackspaceIcon from '@mui/icons-material/Backspace'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'
import { Layout } from '../types/layout.js'
import { useState } from 'react'

const usePupilKeyboard = () => {
	const [isShifted, setIsShifted] = useState(false)
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

	const defaultLayout: Layout = {
		default: [
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

	const shiftedLayout: Layout = {
		default: [
			{ value: '~', label: '~' },
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
			{ value: '{bksp}', icon: BackspaceIcon, col: 4 },

			{ value: '{tab}', label: 'Tab', icon: KeyboardTabIcon, col: 3 },
			{ value: 'Q', label: 'Q' },
			{ value: 'W', label: 'W' },
			{ value: 'E', label: 'E' },
			{ value: 'R', label: 'R' },
			{ value: 'T', label: 'T' },
			{ value: 'Y', label: 'Y' },
			{ value: 'U', label: 'U' },
			{ value: 'I', label: 'I' },
			{ value: 'O', label: 'O' },
			{ value: 'P', label: 'P' },
			{ value: '{', label: '{' },
			{ value: '}', label: '}' },
			{ value: '|', label: '|', col: 3 },

			{ value: '{caps}', label: 'Caps', icon: KeyboardCapslockIcon, col: 4 },
			{ value: 'A', label: 'A' },
			{ value: 'S', label: 'S' },
			{ value: 'D', label: 'D' },
			{ value: 'F', label: 'F' },
			{ value: 'G', label: 'G' },
			{ value: 'H', label: 'H' },
			{ value: 'J', label: 'J' },
			{ value: 'K', label: 'K' },
			{ value: 'L', label: 'L' },
			{ value: ':', label: ':' },
			{ value: '"', label: '"' },
			{ value: '{enter}', label: '< enter', icon: KeyboardReturnIcon, col: 4 },

			{ value: '{shift}', label: 'Shift', col: 4 },
			{ value: 'Z', label: 'Z' },
			{ value: 'X', label: 'X' },
			{ value: 'C', label: 'C' },
			{ value: 'V', label: 'V' },
			{ value: 'B', label: 'B' },
			{ value: 'N', label: 'N' },
			{ value: 'M', label: 'M' },
			{ value: '<', label: '<' },
			{ value: '>', label: '>' },
			{ value: '?', label: '?' },
			{ value: '{space}', label: 'Space', icon: SpaceBarIcon, col: 6 }
		]
	}

	const layout = isShifted ? shiftedLayout : defaultLayout

	const toggleShift = () => {
		setIsShifted(!isShifted)
	}

	return {
		layout,
		isShifted,
		toggleShift
	}
}


export default usePupilKeyboard
