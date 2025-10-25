import { Menu, MenuItem, SubMenu } from '@spaceymonk/react-radial-menu'
import useRadialMenu from './hooks/useRadialMenu.js'

type RadialKeyboardProps = {
	onInput: (input: string) => void
	openSimpleBrowserDialog: () => void
	openFileFolderDialog: () => void
	openTranscriptDialog: () => void
	openSettingsDialog: () => void
}

const RadialKeyboard = ({
	onInput,
	openSimpleBrowserDialog,
	openFileFolderDialog,
	openTranscriptDialog,
	openSettingsDialog
}: RadialKeyboardProps) => {
	const { layout, show, setShow, position, handleItemClick } = useRadialMenu(
		onInput,
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog,
		openSettingsDialog
	)

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
											onItemClick={subChild.onClick ? () => subChild.onClick!() : handleItemClick}
											data={subChild.onClick ? undefined : subChild.value}
										>
											{subChild.label || subChild.value}
										</MenuItem>
									))}
								</SubMenu>
							) : (
								<MenuItem
									key={child.label || child.value}
									onItemClick={child.onClick ? () => child.onClick!() : handleItemClick}
									data={child.onClick ? undefined : child.value}
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
