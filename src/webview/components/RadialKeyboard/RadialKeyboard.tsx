import { useEffect, useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@spaceymonk/react-radial-menu'
import BackspaceIcon from '@mui/icons-material/Backspace'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock'
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'

type RadialKeyboardProps = {
	onInput: (input: string) => void
}

type Layout = {
	label?: string
	value?: string
	icon?: React.ElementType
	col?: number
	childrens?: Layout[]
}

const RadialKeyboard = ({ onInput }: RadialKeyboardProps) => {
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
		onInput(data || '')
		// setShow(false)
	}

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
						{ value: ',' },
						{ value: '.' },
						{ value: '/' }
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
	]

	return (
		<>
			<div
				className="absolute inset-0 z-10"
				style={{ backgroundColor: 'transparent', display: show ? 'block' : 'none' }}
				onClick={() => setShow(false)}
			/>
			<Menu
				centerX={position.x}
				centerY={position.y}
				innerRadius={75}
				outerRadius={150}
				show={show}
				animation={['fade', 'scale']}
				animationTimeout={150}
				drawBackground
			>
				{/* Renderiza el layout dinámicamente */}
				{layout.map((item, idx) => (
					<SubMenu
						key={`${item.label} - ${idx}`}
						itemView={item.label}
						data={item.label}
						displayPosition="bottom"
					>
						{item.childrens?.map((child, cidx) =>
							child.childrens ? (
								<SubMenu
									key={`${child.label || child.value} - ${cidx}`}
									itemView={child.label || child.value}
									data={child.value}
									displayPosition="bottom"
								>
									{/* Renderiza los hijos recursivamente */}
									{child.childrens.map((subChild, scidx) => (
										<MenuItem
											key={`${subChild.label || subChild.value} - ${scidx}`}
											onItemClick={handleItemClick}
											data={subChild.value}
										>
											{subChild.label || subChild.value}
										</MenuItem>
									))}
								</SubMenu>
							) : (
								<MenuItem
									key={child.label || child.value}
									onItemClick={handleItemClick}
									data={child.value}
								>
									{child.label || child.value}
								</MenuItem>
							)
						)}
					</SubMenu>
				))}
			</Menu>
		</>
	)
}

export default RadialKeyboard
