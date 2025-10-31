import { renderHook } from '@testing-library/react'
import { it, expect, vi } from 'vitest'
import useToolbar from '../../../components/Toolbar/hooks/useToolbar.js'

describe('useToolbar', () => {
	const mockHandleButtonClick = vi.fn()
	const mockOpenSimpleBrowserDialog = vi.fn()
	const mockOpenFileFolderDialog = vi.fn()
	const mockOpenTranscriptDialog = vi.fn()

	const setup = () => {
		return renderHook(() =>
			useToolbar(
				mockHandleButtonClick,
				mockOpenSimpleBrowserDialog,
				mockOpenFileFolderDialog,
				mockOpenTranscriptDialog
			)
		)
	}

	it('returns general shortcuts with correct structure', () => {
		const { result } = setup()

		expect(result.current.generalShortcuts).toHaveLength(5)
		expect(result.current.generalShortcuts[0]).toEqual({
			tooltipTitle: 'Open Simple Browser',
			icon: expect.any(Object),
			label: 'Open Browser',
			onClick: mockOpenSimpleBrowserDialog
		})
		expect(result.current.generalShortcuts[1]).toEqual({
			tooltipTitle: 'Create New File/Folder',
			icon: expect.any(Object),
			label: 'Create',
			onClick: mockOpenFileFolderDialog
		})
		expect(result.current.generalShortcuts[2]).toEqual({
			tooltipTitle: 'Open Terminal',
			icon: expect.any(Object),
			label: 'Open Terminal',
			onClick: expect.any(Function)
		})
		expect(result.current.generalShortcuts[3]).toEqual({
			tooltipTitle: 'Save current document',
			icon: expect.any(Object),
			label: 'Save Document',
			onClick: expect.any(Function)
		})
		expect(result.current.generalShortcuts[4]).toEqual({
			tooltipTitle: 'Start Speech to Text',
			icon: expect.any(Object),
			label: 'Speech to Text',
			onClick: mockOpenTranscriptDialog
		})
	})

	it('returns editor shortcuts with correct structure', () => {
		const { result } = setup()

		expect(result.current.editorShortcuts).toHaveLength(7)
		expect(result.current.editorShortcuts[0]).toEqual({
			value: '{comment}',
			label: '//',
			tooltipTitle: 'Comment selected line/s'
		})
		expect(result.current.editorShortcuts[1]).toEqual({
			value: '{copy}',
			label: 'Copy',
			tooltipTitle: 'Copy selection',
			icon: expect.any(Object)
		})
		expect(result.current.editorShortcuts[2]).toEqual({
			value: '{paste}',
			label: 'Paste',
			tooltipTitle: 'Paste from clipboard',
			icon: expect.any(Object)
		})
		expect(result.current.editorShortcuts[3]).toEqual({
			value: '{cut}',
			label: 'Cut',
			tooltipTitle: 'Cut selection',
			icon: expect.any(Object)
		})
		expect(result.current.editorShortcuts[4]).toEqual({
			divider: true
		})
		expect(result.current.editorShortcuts[5]).toEqual({
			value: '{undo}',
			label: 'Undo',
			tooltipTitle: 'Undo last action',
			icon: expect.any(Object)
		})
		expect(result.current.editorShortcuts[6]).toEqual({
			value: '{redo}',
			label: 'Redo',
			tooltipTitle: 'Redo last action',
			icon: expect.any(Object)
		})
	})

	it('returns terminal shortcuts with correct structure', () => {
		const { result } = setup()

		expect(result.current.terminalShortcuts).toHaveLength(2)
		expect(result.current.terminalShortcuts[0]).toEqual({
			value: '{cls}',
			label: 'Clear',
			tooltipTitle: 'Clear terminal screen',
			icon: expect.any(Object)
		})
		expect(result.current.terminalShortcuts[1]).toEqual({
			value: '{stop-process}',
			label: 'Stop Process',
			tooltipTitle: 'Stop running process',
			icon: expect.any(Object)
		})
	})

	it('calls handleButtonClick for terminal shortcut onClick', () => {
		const { result } = setup()

		const terminalShortcut = result.current.generalShortcuts[2]
		terminalShortcut.onClick!()

		expect(mockHandleButtonClick).toHaveBeenCalledWith('{open-terminal}')
	})

	it('calls handleButtonClick for save shortcut onClick', () => {
		const { result } = setup()

		const saveShortcut = result.current.generalShortcuts[3]
		saveShortcut.onClick!()

		expect(mockHandleButtonClick).toHaveBeenCalledWith('{save}')
	})

	it('calls openSimpleBrowserDialog when provided', () => {
		const { result } = setup()

		const browserShortcut = result.current.generalShortcuts[0]
		browserShortcut.onClick!()

		expect(mockOpenSimpleBrowserDialog).toHaveBeenCalled()
	})

	it('calls openFileFolderDialog when provided', () => {
		const { result } = setup()

		const createShortcut = result.current.generalShortcuts[1]
		createShortcut.onClick!()

		expect(mockOpenFileFolderDialog).toHaveBeenCalled()
	})

	it('calls openTranscriptDialog when provided', () => {
		const { result } = setup()

		const speechShortcut = result.current.generalShortcuts[4]
		speechShortcut.onClick!()

		expect(mockOpenTranscriptDialog).toHaveBeenCalled()
	})

	it('handles undefined optional callbacks gracefully', () => {
		const { result } = renderHook(() => useToolbar(mockHandleButtonClick))

		expect(result.current.generalShortcuts[0].onClick).toBeUndefined()
		expect(result.current.generalShortcuts[1].onClick).toBeUndefined()
		expect(result.current.generalShortcuts[4].onClick).toBeUndefined()
	})
})
