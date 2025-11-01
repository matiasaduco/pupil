import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { useState } from 'react'
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

const ParentComponent = () => {
	const [inputHistory, setInputHistory] = useState<string[]>([])
	const [dialogsOpened, setDialogsOpened] = useState<string[]>([])

	const handleInput = (input: string) => {
		setInputHistory((prev) => [...prev, input])
	}

	const openSimpleBrowserDialog = () => {
		setDialogsOpened((prev) => [...prev, 'simple-browser'])
	}

	const openFileFolderDialog = () => {
		setDialogsOpened((prev) => [...prev, 'file-folder'])
	}

	const openTranscriptDialog = () => {
		setDialogsOpened((prev) => [...prev, 'transcript'])
	}

	const openSettingsDialog = () => {
		setDialogsOpened((prev) => [...prev, 'settings'])
	}

	return (
		<div>
			<RadialKeyboard
				onInput={handleInput}
				openSimpleBrowserDialog={openSimpleBrowserDialog}
				openFileFolderDialog={openFileFolderDialog}
				openTranscriptDialog={openTranscriptDialog}
				openSettingsDialog={openSettingsDialog}
			/>
			<div data-testid="input-history">{inputHistory.join(',')}</div>
			<div data-testid="dialogs-opened">{dialogsOpened.join(',')}</div>
		</div>
	)
}

describe('RadialKeyboard Integration Tests', () => {
	it('should pass keyboard input to parent component state', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const characterItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent === 'a')

		if (characterItem) {
			fireEvent.click(characterItem)
		}

		const inputHistory = screen.getByTestId('input-history')
		expect(inputHistory.textContent).toBe('a')
	})

	it('should accumulate multiple keyboard inputs', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const characters = ['h', 'e', 'l', 'l', 'o']
		characters.forEach((char) => {
			const item = screen.getAllByTestId('menu-item').find((item) => item.textContent === char)
			if (item) {
				fireEvent.click(item)
			}
		})

		const inputHistory = screen.getByTestId('input-history')
		expect(inputHistory.textContent).toBe('h,e,l,l,o')
	})

	it('should trigger dialog opening in parent component', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const openBrowserItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Open Browser'))

		if (openBrowserItem) {
			fireEvent.click(openBrowserItem)
		}

		const dialogsOpened = screen.getByTestId('dialogs-opened')
		expect(dialogsOpened.textContent).toBe('simple-browser')
	})

	it('should trigger multiple different dialogs', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const openBrowserItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Open Browser'))
		if (openBrowserItem) {
			fireEvent.click(openBrowserItem)
		}

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const transcriptItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Speech to Text'))
		if (transcriptItem) {
			fireEvent.click(transcriptItem)
		}

		const dialogsOpened = screen.getByTestId('dialogs-opened')
		expect(dialogsOpened.textContent).toBe('simple-browser,transcript')
	})

	it('should send editor commands through parent handler', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const copyItem = screen.getAllByTestId('menu-item').find((item) => item.textContent === 'Copy')
		if (copyItem) {
			fireEvent.click(copyItem)
		}

		const inputHistory = screen.getByTestId('input-history')
		expect(inputHistory.textContent).toBe('{copy}')
	})

	it('should handle both keyboard input and dialog actions in same session', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const aItem = screen.getAllByTestId('menu-item').find((item) => item.textContent === 'a')
		if (aItem) {
			fireEvent.click(aItem)
		}

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))

		const createItem = screen
			.getAllByTestId('menu-item')
			.find((item) => item.textContent?.includes('Create'))
		if (createItem) {
			fireEvent.click(createItem)
		}

		const inputHistory = screen.getByTestId('input-history')
		const dialogsOpened = screen.getByTestId('dialogs-opened')

		expect(inputHistory.textContent).toBe('a')
		expect(dialogsOpened.textContent).toBe('file-folder')
	})

	it('should maintain state across multiple menu open/close cycles', () => {
		render(<ParentComponent />)

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }))
		const firstItem = screen.getAllByTestId('menu-item').find((item) => item.textContent === 'a')
		if (firstItem) {
			fireEvent.click(firstItem)
		}

		const backdrop = document.querySelector('.absolute.inset-0.z-10')
		if (backdrop) {
			fireEvent.click(backdrop)
		}

		fireEvent(window, new MouseEvent('mouseup', { button: 1, clientX: 150, clientY: 150 }))
		const secondItem = screen.getAllByTestId('menu-item').find((item) => item.textContent === 'b')
		if (secondItem) {
			fireEvent.click(secondItem)
		}

		const inputHistory = screen.getByTestId('input-history')
		expect(inputHistory.textContent).toBe('a,b')
	})
})
