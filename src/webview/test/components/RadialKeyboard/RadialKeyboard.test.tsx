import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import RadialKeyboard from '@components/RadialKeyboard/RadialKeyboard.js'
import '@testing-library/jest-dom'

vi.mock('@spaceymonk/react-radial-menu', () => ({
	Menu: ({ children, show }: { children: React.ReactNode; show: boolean }) =>
		show ? <div data-testid="radial-menu">{children}</div> : null,
	MenuItem: ({
		children,
		onItemClick,
		data
	}: {
		children: React.ReactNode
		onItemClick: (
			event: React.MouseEvent<SVGGElement, MouseEvent>,
			index: number,
			data?: string
		) => void
		data?: string
	}) => (
		<div
			data-testid="menu-item"
			onClick={(e) =>
				onItemClick(e as unknown as React.MouseEvent<SVGGElement, MouseEvent>, 0, data)
			}
		>
			{children}
		</div>
	),
	SubMenu: ({ children, itemView }: { children: React.ReactNode; itemView: string }) => (
		<div data-testid="sub-menu">
			<div data-testid="sub-menu-item-view">{itemView}</div>
			{children}
		</div>
	)
}))

vi.mock('@mui/icons-material', () => ({
	BackspaceIcon: () => <span data-testid="backspace-icon">Backspace</span>,
	KeyboardReturnIcon: () => <span data-testid="return-icon">Return</span>,
	KeyboardCapslockIcon: () => <span data-testid="capslock-icon">Capslock</span>,
	KeyboardTabIcon: () => <span data-testid="tab-icon">Tab</span>,
	SpaceBarIcon: () => <span data-testid="space-icon">Space</span>
}))

describe('RadialKeyboard', () => {
	const mockOnInput = vi.fn()

	beforeEach(() => {
		mockOnInput.mockClear()
	})

	it('should not render the menu initially', () => {
		render(<RadialKeyboard onInput={mockOnInput} />)

		expect(screen.queryByTestId('radial-menu')).not.toBeInTheDocument()
	})

	it('should render the menu on middle mouse click', () => {
		render(<RadialKeyboard onInput={mockOnInput} />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		expect(screen.getByTestId('radial-menu')).toBeInTheDocument()
	})

	it('should call onInput when a menu item is clicked', () => {
		render(<RadialKeyboard onInput={mockOnInput} />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const menuItem = screen.getAllByTestId('menu-item')[0]
		fireEvent.click(menuItem)

		expect(mockOnInput).toHaveBeenCalled()
	})

	it('should hide the menu when backdrop is clicked', () => {
		render(<RadialKeyboard onInput={mockOnInput} />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		expect(screen.getByTestId('radial-menu')).toBeInTheDocument()

		const backdrop = document.querySelector('.absolute.inset-0.z-10')
		if (backdrop) {
			fireEvent.click(backdrop)
		}

		expect(screen.queryByTestId('radial-menu')).not.toBeInTheDocument()
	})

	it('should render sub menus', () => {
		render(<RadialKeyboard onInput={mockOnInput} />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		expect(screen.getAllByTestId('sub-menu')).toHaveLength(6) // Keyboard, Numbers, Alphabet, Symbols, Special Keys, Toolbar
	})
})
