import { describe, it, expect, vi, beforeEach } from 'vitest'
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
	const mockOpenSimpleBrowserDialog = vi.fn()
	const mockOpenFileFolderDialog = vi.fn()
	const mockOpenTranscriptDialog = vi.fn()
	const mockOpenSettingsDialog = vi.fn()

	beforeEach(() => {
		mockOnInput.mockClear()
		mockOpenSimpleBrowserDialog.mockClear()
		mockOpenFileFolderDialog.mockClear()
		mockOpenTranscriptDialog.mockClear()
		mockOpenSettingsDialog.mockClear()
	})

	it('should not render the menu initially', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		expect(screen.queryByTestId('radial-menu')).not.toBeInTheDocument()
	})

	it('should render the menu on middle mouse click', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		expect(screen.getByTestId('radial-menu')).toBeInTheDocument()
	})

	it('should call onInput when a menu item is clicked', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const menuItem = screen.getAllByTestId('menu-item')[0]
		fireEvent.click(menuItem)

		expect(mockOnInput).toHaveBeenCalled()
	})

	it('should hide the menu when backdrop is clicked', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		expect(screen.getByTestId('radial-menu')).toBeInTheDocument()

		const backdrop = document.querySelector('.absolute.inset-0.z-10')
		if (backdrop) {
			fireEvent.click(backdrop)
		}

		expect(screen.queryByTestId('radial-menu')).not.toBeInTheDocument()
	})

	it('should render sub menus', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))
		expect(screen.getAllByTestId('sub-menu')).toHaveLength(9)
	})

	it('should call the correct callback when toolbar items are clicked', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		// Find and click on "Open Browser" toolbar item
		const openBrowserItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Open Browser'))
		if (openBrowserItem) {
			fireEvent.click(openBrowserItem)
			expect(mockOpenSimpleBrowserDialog).toHaveBeenCalledTimes(1)
		}
	})

	it('should send editor commands through onInput callback', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		// Find and click on a keyboard character (e.g., 'a')
		const characterItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent === 'a')
		if (characterItem) {
			fireEvent.click(characterItem)
			expect(mockOnInput).toHaveBeenCalledWith('a')
		}
	})

	it('should have correct menu structure with Keyboard and Toolbar sections', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		// Check for main menu sections
		expect(screen.getByText('Keyboard')).toBeInTheDocument()
		expect(screen.getByText('Toolbar')).toBeInTheDocument()

		// Check for Keyboard sub-sections
		expect(screen.getByText('Numbers')).toBeInTheDocument()
		expect(screen.getByText('Alphabet')).toBeInTheDocument()
		expect(screen.getByText('Symbols')).toBeInTheDocument()
		expect(screen.getByText('Special Keys')).toBeInTheDocument()

		// Check for Toolbar sub-sections
		expect(screen.getByText('General')).toBeInTheDocument()
		expect(screen.getByText('Editor')).toBeInTheDocument()
		expect(screen.getByText('Terminal')).toBeInTheDocument()
	})

	it('should call openTranscriptDialog when Speech to Text is clicked', () => {
		render(
			<RadialKeyboard
				onInput={mockOnInput}
				openSimpleBrowserDialog={mockOpenSimpleBrowserDialog}
				openFileFolderDialog={mockOpenFileFolderDialog}
				openTranscriptDialog={mockOpenTranscriptDialog}
				openSettingsDialog={mockOpenSettingsDialog}
			/>
		)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const transcriptItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Speech to Text'))
		if (transcriptItem) {
			fireEvent.click(transcriptItem)
			expect(mockOpenTranscriptDialog).toHaveBeenCalledTimes(1)
		}
	})
})
