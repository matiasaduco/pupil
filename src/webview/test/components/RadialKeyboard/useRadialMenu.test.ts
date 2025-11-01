import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useRadialMenu from '@components/RadialKeyboard/hooks/useRadialMenu.js'

describe('useRadialMenu', () => {
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

	it('should initialize with menu hidden', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		expect(result.current.show).toBe(false)
	})

	it('should show menu on middle mouse click', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		act(() => {
			const event = new MouseEvent('mouseup', {
				button: 1,
				clientX: 100,
				clientY: 200
			})
			window.dispatchEvent(event)
		})

		expect(result.current.show).toBe(true)
		expect(result.current.position).toEqual({ x: 100, y: 200 })
	})

	it('should have correct layout structure', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		expect(result.current.layout).toHaveLength(2) // Keyboard and Toolbar

		// Check Keyboard section
		const keyboardSection = result.current.layout[0]
		expect(keyboardSection.label).toBe('Keyboard')
		expect(keyboardSection.childrens).toHaveLength(4) // Numbers, Alphabet, Symbols, Special Keys

		// Check Toolbar section
		const toolbarSection = result.current.layout[1]
		expect(toolbarSection.label).toBe('Toolbar')
		expect(toolbarSection.childrens).toHaveLength(3) // General, Editor, Terminal
	})

	it('should have Numbers submenu with correct items', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const keyboardSection = result.current.layout[0]
		const numbersSubmenu = keyboardSection.childrens?.find((child) => child.label === 'Numbers')

		expect(numbersSubmenu).toBeDefined()
		expect(numbersSubmenu?.childrens).toHaveLength(10) // 0-9
		expect(numbersSubmenu?.childrens?.[0].value).toBe('1')
		expect(numbersSubmenu?.childrens?.[9].value).toBe('0')
	})

	it('should have Alphabet submenu with 26 letters', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const keyboardSection = result.current.layout[0]
		const alphabetSubmenu = keyboardSection.childrens?.find((child) => child.label === 'Alphabet')

		expect(alphabetSubmenu).toBeDefined()
		expect(alphabetSubmenu?.childrens).toHaveLength(26)
		expect(alphabetSubmenu?.childrens?.[0].value).toBe('a')
		expect(alphabetSubmenu?.childrens?.[25].value).toBe('z')
	})

	it('should have Symbols submenu', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const keyboardSection = result.current.layout[0]
		const symbolsSubmenu = keyboardSection.childrens?.find((child) => child.label === 'Symbols')

		expect(symbolsSubmenu).toBeDefined()
		expect(symbolsSubmenu?.childrens!.length).toBeGreaterThan(0)

		// Check for some common symbols
		const symbolValues = symbolsSubmenu?.childrens?.map((s) => s.value)
		expect(symbolValues).toContain('!')
		expect(symbolValues).toContain('@')
		expect(symbolValues).toContain('#')
		expect(symbolValues).toContain('(')
		expect(symbolValues).toContain(')')
	})

	it('should have Special Keys submenu with correct items', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const keyboardSection = result.current.layout[0]
		const specialKeysSubmenu = keyboardSection.childrens?.find(
			(child) => child.label === 'Special Keys'
		)

		expect(specialKeysSubmenu).toBeDefined()

		const specialKeyValues = specialKeysSubmenu?.childrens?.map((s) => s.value)
		expect(specialKeyValues).toContain('{bksp}')
		expect(specialKeyValues).toContain('{tab}')
		expect(specialKeyValues).toContain('{caps}')
		expect(specialKeyValues).toContain('{enter}')
		expect(specialKeyValues).toContain('{shift}')
		expect(specialKeyValues).toContain('{space}')
	})

	it('should have General toolbar with callback functions', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const toolbarSection = result.current.layout[1]
		const generalSubmenu = toolbarSection.childrens?.find((child) => child.label === 'General')

		expect(generalSubmenu).toBeDefined()
		expect(generalSubmenu?.childrens).toBeDefined()

		// Check that items have onClick callbacks
		const openBrowserItem = generalSubmenu?.childrens?.find((item) => item.label === 'Open Browser')
		expect(openBrowserItem).toBeDefined()
		expect(openBrowserItem?.onClick).toBeDefined()

		// Test the callback
		if (openBrowserItem?.onClick) {
			openBrowserItem.onClick()
			expect(mockOpenSimpleBrowserDialog).toHaveBeenCalledTimes(1)
		}
	})

	it('should have Editor toolbar with correct commands', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const toolbarSection = result.current.layout[1]
		const editorSubmenu = toolbarSection.childrens?.find((child) => child.label === 'Editor')

		expect(editorSubmenu).toBeDefined()

		const editorValues = editorSubmenu?.childrens?.map((s) => s.value)
		expect(editorValues).toContain('{comment}')
		expect(editorValues).toContain('{copy}')
		expect(editorValues).toContain('{paste}')
		expect(editorValues).toContain('{cut}')
		expect(editorValues).toContain('{undo}')
		expect(editorValues).toContain('{redo}')
	})

	it('should have Terminal toolbar with correct commands', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const toolbarSection = result.current.layout[1]
		const terminalSubmenu = toolbarSection.childrens?.find((child) => child.label === 'Terminal')

		expect(terminalSubmenu).toBeDefined()

		const terminalValues = terminalSubmenu?.childrens?.map((s) => s.value)
		expect(terminalValues).toContain('{cls}')
		expect(terminalValues).toContain('{stop-process}')
	})

	it('should call handleItemClick with correct data', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const mockEvent = {} as React.MouseEvent<SVGGElement, MouseEvent>

		act(() => {
			result.current.handleItemClick(mockEvent, 0, 'a')
		})

		expect(mockOnInput).toHaveBeenCalledWith('a')
	})

	it('should not call handleButtonClick when data is undefined', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		const mockEvent = {} as React.MouseEvent<SVGGElement, MouseEvent>

		act(() => {
			result.current.handleItemClick(mockEvent, 0, undefined)
		})

		expect(mockOnInput).not.toHaveBeenCalled()
	})

	it('should hide menu when setShow is called with false', () => {
		const { result } = renderHook(() =>
			useRadialMenu(
				mockOnInput,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog,
				mockOpenSettingsDialog
			)
		)

		// First show the menu
		act(() => {
			const event = new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 200 })
			window.dispatchEvent(event)
		})

		expect(result.current.show).toBe(true)

		// Then hide it
		act(() => {
			result.current.setShow(false)
		})

		expect(result.current.show).toBe(false)
	})
})
