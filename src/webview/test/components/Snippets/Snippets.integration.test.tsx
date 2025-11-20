import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import * as React from 'react'
import Snippets from '@components/Snippets/Snippets.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { VsCodeApiProvider } from '@webview/contexts/VsCodeApiContext.js'
import '@testing-library/jest-dom'

const mockEditorRef = {
	current: {
		getCursorPosition: vi.fn(),
		insertAtCursor: vi.fn(),
		insertMultipleAtCursor: vi.fn(),
		insertCommentBlockAtCursor: vi.fn(),
		deleteAtCursor: vi.fn(),
		enterAtCursor: vi.fn(),
		commentAtCursor: vi.fn(),
		copySelection: vi.fn(),
		pasteClipboard: vi.fn(),
		cutSelection: vi.fn(),
		focus: vi.fn(),
		undo: vi.fn(),
		redo: vi.fn()
	} as PupilEditorHandle
}

const mockPostMessage = vi.fn()
const mockVsCodeApi = {
	postMessage: mockPostMessage,
	getState: () => ({}),
	setState: vi.fn()
}

vi.mock('@webview/mocks/MockVsCodeApi.js', () => ({
	default: () => mockVsCodeApi
}))

// Create portal target for dialogs
const portalTarget = document.createElement('div')
portalTarget.id = 'pupil-dialog-portal'
document.body.appendChild(portalTarget)

describe('Snippets Integration', () => {
	beforeEach(() => {
		mockPostMessage.mockClear()
	})

	it('should render the Snippets button and request snippets on mount', () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		expect(screen.getByLabelText('Snippets')).toBeInTheDocument()
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'get-snippets' })
	})

	it('should open dialog when Snippets button is clicked', async () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		const button = screen.getByLabelText('Snippets')
		fireEvent.click(button)

		await waitFor(() => {
			const portal = document.getElementById('pupil-dialog-portal')
			const titleInPortal = portal?.querySelector('.MuiCardHeader-title')
			expect(titleInPortal?.textContent).toBe('Snippets')
		})
	})

	it('should render snippets when received via message', async () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		const button = screen.getByLabelText('Snippets')
		fireEvent.click(button)

		const mockSnippets = {
			user: [],
			extension: [],
			builtin: [],
			all: [
				{
					extension: 'test',
					file: 'test.js',
					snippets: {
						'console.log': {
							body: 'console.log($1)',
							description: 'Log to console'
						},
						'if-else': {
							body: ['if ($1) {', '\t$2', '} else {', '\t$3', '}'],
							description: 'If-else statement'
						}
					}
				}
			]
		}

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'snippets',
						snippets: mockSnippets
					}
				})
			)
		})

		await waitFor(() => {
			expect(screen.getByText('console.log')).toBeInTheDocument()
			expect(screen.getByText('if-else')).toBeInTheDocument()
		})
	})

	it('should call insertAtCursor for single-line snippet when clicked', async () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		const button = screen.getByLabelText('Snippets')
		fireEvent.click(button)

		const mockSnippets = {
			user: [],
			extension: [],
			builtin: [],
			all: [
				{
					extension: 'test',
					file: 'test.js',
					snippets: {
						'console.log': {
							body: 'console.log($1)',
							description: 'Log to console'
						}
					}
				}
			]
		}

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'snippets',
						snippets: mockSnippets
					}
				})
			)
		})

		await waitFor(() => {
			expect(screen.getByText('console.log')).toBeInTheDocument()
		})

		const snippetButton = screen.getByText('console.log')
		fireEvent.click(snippetButton)

		expect(mockEditorRef.current.insertAtCursor).toHaveBeenCalledWith('console.log($1)')
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: 'Snippets' })).not.toBeInTheDocument()
		})
	})

	it('should call insertMultipleAtCursor for multi-line snippet when clicked', async () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		const button = screen.getByLabelText('Snippets')
		fireEvent.click(button)

		const mockSnippets = {
			user: [],
			extension: [],
			builtin: [],
			all: [
				{
					extension: 'test',
					file: 'test.js',
					snippets: {
						'if-else': {
							body: ['if ($1) {', '\t$2', '} else {', '\t$3', '}'],
							description: 'If-else statement'
						}
					}
				}
			]
		}

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'snippets',
						snippets: mockSnippets
					}
				})
			)
		})

		await waitFor(() => {
			expect(screen.getByText('if-else')).toBeInTheDocument()
		})

		const snippetButton = screen.getByText('if-else')
		fireEvent.click(snippetButton)

		expect(mockEditorRef.current.insertMultipleAtCursor).toHaveBeenCalledWith([
			'if ($1) {',
			'\t$2',
			'} else {',
			'\t$3',
			'}'
		])
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: 'Snippets' })).not.toBeInTheDocument()
		})
	})

	it('should close dialog when clicking outside', async () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} id="snippets-button" highlightedButtonId={null} />
			</VsCodeApiProvider>
		)

		const button = screen.getByLabelText('Snippets')
		fireEvent.click(button)

		await waitFor(() => {
			const portal = document.getElementById('pupil-dialog-portal')
			const titleInPortal = portal?.querySelector('.MuiCardHeader-title')
			expect(titleInPortal?.textContent).toBe('Snippets')
		})

		const backdrop = portalTarget.querySelector('.absolute.inset-0.z-10')
		if (backdrop) {
			fireEvent.click(backdrop)
		}

		await waitFor(() => {
			const portal = document.getElementById('pupil-dialog-portal')
			const titleInPortal = portal?.querySelector('.MuiCardHeader-title')
			expect(titleInPortal).toBeNull()
		})
	})
})
