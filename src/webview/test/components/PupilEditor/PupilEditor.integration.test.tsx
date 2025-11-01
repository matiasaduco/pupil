import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import PupilEditor from '../../../components/PupilEditor/PupilEditor.js'
import { VsCodeApiProvider } from '../../../contexts/VsCodeApiContext.js'
import { act } from 'react'
import React from 'react'
import type { PupilEditorHandle } from '../../../types/PupilEditorHandle.js'

const mockPostMessage = vi.fn()
const mockVsCodeApi = {
	postMessage: mockPostMessage
}

vi.mock('../../../mocks/MockVsCodeApi.js', () => ({
	default: () => mockVsCodeApi
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
	Editor: ({
		value,
		defaultValue,
		language,
		onMount,
		theme
	}: {
		value?: string
		defaultValue?: string
		language?: string
		onMount?: (editor: unknown) => void
		theme?: string
	}) => {
		// Call onMount immediately to simulate editor mounting
		React.useEffect(() => {
			onMount?.({
				getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
				getSelection: vi.fn(() => ({
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
					isEmpty: vi.fn(() => true)
				})),
				setPosition: vi.fn(),
				setSelection: vi.fn(),
				executeEdits: vi.fn(),
				focus: vi.fn(),
				trigger: vi.fn(),
				getModel: vi.fn(() => ({
					getLineMaxColumn: vi.fn(() => 10),
					getValueInRange: vi.fn(() => 'selected text'),
					getLineContent: vi.fn(() => 'line content')
				}))
			})
		}, [onMount])

		return (
			<div
				data-testid="monaco-editor"
				data-value={value || defaultValue}
				data-language={language}
				data-theme={theme}
			>
				Monaco Editor Mock
			</div>
		)
	},
	useMonaco: () => ({
		Range: vi.fn((startLine, startCol, endLine, endCol) => ({
			startLineNumber: startLine,
			startColumn: startCol,
			endLineNumber: endLine,
			endColumn: endCol
		})),
		Selection: vi.fn((startLine, startCol, endLine, endCol) => ({
			startLineNumber: startLine,
			startColumn: startCol,
			endLineNumber: endLine,
			endColumn: endCol
		}))
	})
}))

// Mock MUI Skeleton
vi.mock('@mui/material', () => ({
	Skeleton: ({ width, height }: { width?: string | number; height?: string | number }) => (
		<div data-testid="skeleton" style={{ width, height }}>
			Skeleton
		</div>
	)
}))

describe('PupilEditor Integration', () => {
	beforeEach(() => {
		mockPostMessage.mockClear()

		// Mock window.addEventListener for message events
		vi.spyOn(window, 'addEventListener')
		vi.spyOn(window, 'removeEventListener')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const renderWithProvider = (props: Record<string, unknown> = {}) => {
		return render(
			<VsCodeApiProvider>
				<PupilEditor {...props} />
			</VsCodeApiProvider>
		)
	}

	it('should render skeleton when no initial content is provided', () => {
		renderWithProvider()

		expect(screen.getByTestId('skeleton')).toBeInTheDocument()
		expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
	})

	it('should render editor when initial content is received via message', async () => {
		renderWithProvider()

		// Initially shows skeleton
		expect(screen.getByTestId('skeleton')).toBeInTheDocument()

		// Simulate receiving init message
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'console.log("hello")',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
			expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
		})

		const editor = screen.getByTestId('monaco-editor')
		expect(editor.getAttribute('data-value')).toBe('console.log("hello")')
		expect(editor.getAttribute('data-language')).toBe('javascript')
	})

	it('should send ready message on mount', async () => {
		renderWithProvider()

		await waitFor(() => {
			expect(mockPostMessage).toHaveBeenCalledWith({ type: 'ready' })
		})
	})

	it('should handle theme changes', async () => {
		const { rerender } = renderWithProvider({ theme: 'vs-dark' })

		// Send init message first
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			const editor = screen.getByTestId('monaco-editor')
			expect(editor.getAttribute('data-theme')).toBe('vs-dark')
		})

		// Change theme by rerendering
		rerender(
			<VsCodeApiProvider>
				<PupilEditor theme="light" />
			</VsCodeApiProvider>
		)

		await waitFor(() => {
			const editor = screen.getByTestId('monaco-editor')
			expect(editor.getAttribute('data-theme')).toBe('light')
		})
	})

	it('should be hidden when visible is false', async () => {
		const { container } = renderWithProvider({ visible: false })

		const editorContainer = container.firstChild as HTMLElement
		expect(editorContainer.className).toContain('hidden')
	})

	it('should be visible when visible is true', async () => {
		const { container } = renderWithProvider({ visible: true })

		const editorContainer = container.firstChild as HTMLElement
		expect(editorContainer.className).not.toContain('hidden')
	})

	it('should handle different file extensions correctly', async () => {
		const testCases = [
			{ extension: 'js', expectedLanguage: 'javascript' },
			{ extension: 'jsx', expectedLanguage: 'javascript' },
			{ extension: 'ts', expectedLanguage: 'typescript' },
			{ extension: 'tsx', expectedLanguage: 'typescript' },
			{ extension: 'json', expectedLanguage: 'json' },
			{ extension: 'md', expectedLanguage: 'markdown' },
			{ extension: 'css', expectedLanguage: 'css' },
			{ extension: 'html', expectedLanguage: 'html' },
			{ extension: 'py', expectedLanguage: 'plaintext' }
		]

		for (const { extension, expectedLanguage } of testCases) {
			mockPostMessage.mockClear()

			const { rerender } = renderWithProvider()

			await act(async () => {
				window.dispatchEvent(
					new MessageEvent('message', {
						data: {
							type: 'init',
							content: 'test content',
							fileExtension: extension
						}
					})
				)
			})

			await waitFor(() => {
				const editor = screen.getByTestId('monaco-editor')
				expect(editor.getAttribute('data-language')).toBe(expectedLanguage)
			})

			// Clean up for next test
			rerender(<div />)
		}
	})

	it('should render portal target for dialogs', () => {
		renderWithProvider()

		const portalTarget = document.getElementById('pupil-dialog-portal')
		expect(portalTarget).toBeInTheDocument()
	})

	it('should expose editor methods through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test that all expected methods are available
		expect(typeof ref.current?.getCursorPosition).toBe('function')
		expect(typeof ref.current?.insertAtCursor).toBe('function')
		expect(typeof ref.current?.insertMultipleAtCursor).toBe('function')
		expect(typeof ref.current?.insertCommentBlockAtCursor).toBe('function')
		expect(typeof ref.current?.deleteAtCursor).toBe('function')
		expect(typeof ref.current?.enterAtCursor).toBe('function')
		expect(typeof ref.current?.commentAtCursor).toBe('function')
		expect(typeof ref.current?.copySelection).toBe('function')
		expect(typeof ref.current?.pasteClipboard).toBe('function')
		expect(typeof ref.current?.cutSelection).toBe('function')
		expect(typeof ref.current?.focus).toBe('function')
		expect(typeof ref.current?.undo).toBe('function')
		expect(typeof ref.current?.redo).toBe('function')
	})

	it('should get cursor position through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test getCursorPosition
		const position = ref.current?.getCursorPosition()
		expect(position).toEqual({ lineNumber: 1, column: 1 })
	})

	it('should call insertAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test insertAtCursor - should not throw
		expect(() => {
			ref.current?.insertAtCursor('test text')
		}).not.toThrow()
	})

	it('should call focus through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test focus - should not throw
		expect(() => {
			ref.current?.focus()
		}).not.toThrow()
	})

	it('should call undo and redo through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test undo and redo - should not throw
		expect(() => {
			ref.current?.undo()
			ref.current?.redo()
		}).not.toThrow()
	})

	it('should call insertMultipleAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test insertMultipleAtCursor - should not throw
		expect(() => {
			ref.current?.insertMultipleAtCursor(['line1', 'line2', 'line3'])
		}).not.toThrow()
	})

	it('should call insertCommentBlockAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test insertCommentBlockAtCursor - should not throw
		expect(() => {
			ref.current?.insertCommentBlockAtCursor(['line1', 'line2'])
		}).not.toThrow()
	})

	it('should call deleteAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test deleteAtCursor - should not throw
		expect(() => {
			ref.current?.deleteAtCursor()
		}).not.toThrow()
	})

	it('should call enterAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test enterAtCursor - should not throw
		expect(() => {
			ref.current?.enterAtCursor()
		}).not.toThrow()
	})

	it('should call commentAtCursor through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Test commentAtCursor - should not throw
		expect(() => {
			ref.current?.commentAtCursor()
		}).not.toThrow()
	})

	it('should call copySelection through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Mock clipboard API
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn()
			}
		})

		// Test copySelection - should not throw
		expect(() => {
			ref.current?.copySelection()
		}).not.toThrow()
	})

	it('should call pasteClipboard through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Mock clipboard API
		Object.assign(navigator, {
			clipboard: {
				readText: vi.fn().mockResolvedValue('pasted text')
			}
		})

		// Test pasteClipboard - should not throw
		await expect(ref.current?.pasteClipboard()).resolves.not.toThrow()
	})

	it('should call cutSelection through ref', async () => {
		const ref = { current: null as PupilEditorHandle | null }
		renderWithProvider({ ref })

		// Send init message to mount the editor
		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'js'
					}
				})
			)
		})

		await waitFor(() => {
			expect(ref.current).toBeDefined()
		})

		// Mock clipboard API
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn()
			}
		})

		// Test cutSelection - should not throw
		expect(() => {
			ref.current?.cutSelection()
		}).not.toThrow()
	})
})
