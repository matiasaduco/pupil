import { Menu, MenuItem, SubMenu } from '@spaceymonk/react-radial-menu'
import useRadialMenu from './hooks/useRadialMenu.js'
import './RadialKeyboard.css'
import { useEffect } from 'react'
import { useTheme } from '@mui/material'

type RadialKeyboardProps = {
	onInput: (input: string) => void
	openSimpleBrowserDialog: () => void
	openFileFolderDialog: () => void
	openTranscriptDialog: () => void
	openSettingsDialog: () => void
	enabled?: boolean
	activationButton?: number
}

const RadialKeyboard = ({
	onInput,
	openSimpleBrowserDialog,
	openFileFolderDialog,
	openTranscriptDialog,
	openSettingsDialog,
	enabled = true,
	activationButton = 1
}: RadialKeyboardProps) => {
	const { layout, show, setShow, position, handleItemClick } = useRadialMenu(
		onInput,
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog,
		openSettingsDialog,
		enabled,
		activationButton
	)

	const theme = useTheme()
	const isDark = theme.palette.mode === 'dark'

	// Apply theme-based styling to radial menu SVG elements after render
	useEffect(() => {
		if (show) {
			// Add theme class to wrapper
			const wrapperEl = document.querySelector('.radial-menu-wrapper')
			if (wrapperEl) {
				if (isDark) {
					wrapperEl.classList.remove('light-theme')
				} else {
					wrapperEl.classList.add('light-theme')
				}
			}

			let observer: MutationObserver | null = null

			const applyTheme = () => {
				const wrapper = document.querySelector('.radial-menu-wrapper')
				if (!wrapper) {
					return
				}

				const svg = wrapper.querySelector('svg')
				if (!svg) {
					return
				}

				// Theme-based colors
				const textColor = isDark ? '#ffffff' : '#000000'
				const bgColor = isDark ? '#2a2a2a' : '#ffffff'
				const strokeColor = isDark ? '#3a3f4b' : '#cccccc'

				// The library uses foreignObject with div elements for text, not SVG text elements
				const contentDivs = svg.querySelectorAll('foreignObject div.__rrm-content')
				contentDivs.forEach((div) => {
					;(div as HTMLElement).style.setProperty('color', textColor, 'important')
				})

				// Apply to all shape elements
				const shapes = svg.querySelectorAll('path, circle, rect, polygon')
				shapes.forEach((shape) => {
					;(shape as SVGElement).style.setProperty('fill', bgColor, 'important')
					;(shape as SVGElement).style.setProperty('stroke', strokeColor, 'important')
				})
			}

			// Set up mutation observer to watch for new elements only (not attribute changes)
			const wrapper = document.querySelector('.radial-menu-wrapper')
			if (wrapper) {
				let debounceTimer: NodeJS.Timeout | null = null
				observer = new MutationObserver((mutations) => {
					// Check if new elements were added
					let hasNewElements = false
					mutations.forEach((mutation) => {
						if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
							hasNewElements = true
						}
					})

					if (hasNewElements) {
						// Debounce to prevent infinite loops
						if (debounceTimer) {
							clearTimeout(debounceTimer)
						}
						debounceTimer = setTimeout(() => {
							applyTheme()
						}, 50)
					}
				})

				observer.observe(wrapper, {
					childList: true,
					subtree: true
				})
			}

			// Apply with immediate and progressive timing to catch various render stages
			const timer0 = setTimeout(applyTheme, 0)
			const timer1 = setTimeout(applyTheme, 10)
			const timer2 = setTimeout(applyTheme, 50)
			const timer3 = setTimeout(applyTheme, 100)
			const timer4 = setTimeout(applyTheme, 150)
			const timer5 = setTimeout(applyTheme, 200)
			const timer6 = setTimeout(applyTheme, 300)
			const timer7 = setTimeout(applyTheme, 500)
			const timer8 = setTimeout(applyTheme, 1000)
			const timer9 = setTimeout(applyTheme, 1500)
			return () => {
				if (observer) {
					observer.disconnect()
				}
				clearTimeout(timer0)
				clearTimeout(timer1)
				clearTimeout(timer2)
				clearTimeout(timer3)
				clearTimeout(timer4)
				clearTimeout(timer5)
				clearTimeout(timer6)
				clearTimeout(timer7)
				clearTimeout(timer8)
				clearTimeout(timer9)
			}
		}
	}, [show, position, isDark])

	return (
		<>
			<div
				className="absolute inset-0 z-10"
				style={{ backgroundColor: 'transparent', display: show ? 'block' : 'none' }}
				onClick={() => setShow(false)}
			/>
			<div className="radial-menu-wrapper">
				<Menu
					centerX={position.x}
					centerY={position.y}
					innerRadius={40}
					outerRadius={140}
					show={show}
					animation={['fade', 'scale']}
					animationTimeout={100}
					drawBackground
					style={{
						backgroundColor: 'transparent',
						color: isDark ? '#ffffff' : '#000000'
					}}
				>
					{/* Renderiza el layout dinámicamente */}
					{layout.map((item, idx) => (
						<SubMenu
							key={`${item.label} - ${idx}`}
							itemView={item.label}
							data={item.label}
							displayPosition="center"
						>
							{item.childrens?.map((child, cidx) =>
								child.childrens ? (
									<SubMenu
										key={`${child.label || child.value} - ${cidx}`}
										itemView={child.label || child.value}
										data={child.value}
										displayPosition="center"
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
			</div>
		</>
	)
}

export default RadialKeyboard
