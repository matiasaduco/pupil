import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

vi.mock('@components/Snippets/hooks/useSnippets.js', () => {
	const mock = vi.fn(() => ({
		snippets: mockSnippets,
		handleSnippetPress: vi.fn(),
		open: false,
		openModal: vi.fn(),
		onClose: vi.fn()
	}))
	return { default: mock }
})

vi.mock('@components/PupilDialog/PupilDialog.js', () => ({
	default: ({
		children,
		open,
		onClose,
		title
	}: {
		children: React.ReactNode
		open: boolean
		onClose: () => void
		title: string
	}) =>
		open ? (
			<div data-testid="pupil-dialog">
				<h2>{title}</h2>
				{children}
				<button onClick={onClose}>Close</button>
			</div>
		) : null
}))

vi.mock('@mui/material', () => ({
	Button: ({
		children,
		onClick,
		className,
		style,
		sx,
		id
	}: {
		children: React.ReactNode
		onClick?: () => void
		className?: string
		style?: Record<string, unknown>
		sx?: Record<string, unknown>
		id?: string
	}) => (
		<button
			data-testid="mui-button"
			id={id}
			onClick={onClick}
			className={className}
			style={{ ...style, ...(sx as Record<string, unknown>) }}
		>
			{children}
		</button>
	),
	Tooltip: ({
		children,
		title,
		key
	}: {
		children: React.ReactNode
		title: React.ReactNode
		key?: string
	}) => (
		<div data-testid="tooltip" key={key}>
			{children}
			<div data-testid="tooltip-title">{title}</div>
		</div>
	),
	useTheme: () => ({
		palette: {
			primary: { main: '#1976d2' }
		}
	})
}))

vi.mock('@components/Snippets/components/TooltipTitle.js', () => ({
	default: ({ body, description }: { body: string | string[]; description?: string }) => (
		<div data-testid="tooltip-title">
			<div>{description}</div>
			<hr />
			<pre>{Array.isArray(body) ? body.join('\n') : body}</pre>
		</div>
	)
}))

describe('Snippets', () => {
	beforeEach(async () => {
		const mockUseSnippets = vi.mocked(
			await import('@components/Snippets/hooks/useSnippets.js')
		).default
		mockUseSnippets.mockReturnValue({
			snippets: mockSnippets,
			handleSnippetPress: vi.fn(),
			open: false,
			openModal: vi.fn(),
			onClose: vi.fn()
		})
	})

	it('should render the Snippets button', () => {
		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} />
			</VsCodeApiProvider>
		)

		expect(screen.getByText('Snippets')).toBeInTheDocument()
	})

	it('should open the dialog when Snippets button is clicked', async () => {
		const mockUseSnippets = vi.mocked(
			await import('@components/Snippets/hooks/useSnippets.js')
		).default
		const mockOpenModal = vi.fn()
		mockUseSnippets.mockReturnValue({
			snippets: mockSnippets,
			handleSnippetPress: vi.fn(),
			open: false,
			openModal: mockOpenModal,
			onClose: vi.fn()
		})

		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} />
			</VsCodeApiProvider>
		)

		const button = screen.getByText('Snippets')
		fireEvent.click(button)

		expect(mockOpenModal).toHaveBeenCalled()
	})

	it('should render snippets in the dialog when open', async () => {
		const mockUseSnippets = vi.mocked(
			await import('@components/Snippets/hooks/useSnippets.js')
		).default
		mockUseSnippets.mockReturnValue({
			snippets: mockSnippets,
			handleSnippetPress: vi.fn(),
			open: true,
			openModal: vi.fn(),
			onClose: vi.fn()
		})

		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} />
			</VsCodeApiProvider>
		)

		expect(screen.getByTestId('pupil-dialog')).toBeInTheDocument()
		expect(screen.getByText('console.log')).toBeInTheDocument()
	})

	it('should call handleSnippetPress when a snippet button is clicked', async () => {
		const mockUseSnippets = vi.mocked(
			await import('@components/Snippets/hooks/useSnippets.js')
		).default
		const mockHandleSnippetPress = vi.fn()
		mockUseSnippets.mockReturnValue({
			snippets: mockSnippets,
			handleSnippetPress: mockHandleSnippetPress,
			open: true,
			openModal: vi.fn(),
			onClose: vi.fn()
		})

		render(
			<VsCodeApiProvider>
				<Snippets editorRef={mockEditorRef} />
			</VsCodeApiProvider>
		)

		const snippetButton = screen.getByText('console.log')
		fireEvent.click(snippetButton)

		expect(mockHandleSnippetPress).toHaveBeenCalledWith('console.log($1)')
	})
})
