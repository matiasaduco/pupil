import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Toolbar from '../../../components/Toolbar/Toolbar.js'
import { VsCodeApiProvider } from '../../../contexts/VsCodeApiContext.js'
import { KeyboardFocusProvider } from '../../../contexts/KeyboardFocusContext.js'
import React from 'react'

const mockPostMessage = vi.fn()
const mockVsCodeApi = {
	postMessage: mockPostMessage
}

vi.mock('../../../mocks/MockVsCodeApi.js', () => ({
	default: () => mockVsCodeApi
}))

// Mock MUI components
vi.mock('@mui/material', () => ({
	IconButton: ({
		children,
		onClick,
		sx,
		...props
	}: {
		children?: React.ReactNode
		onClick?: () => void
		sx?: React.CSSProperties
		[key: string]: unknown
	}) => (
		<button data-testid="icon-button" onClick={onClick} style={sx} {...props}>
			{children}
		</button>
	),
	Tooltip: ({ children, title }: { children?: React.ReactNode; title?: string }) => (
		<div data-testid="tooltip" title={title}>
			{children}
		</div>
	),
	Typography: ({
		children,
		variant,
		sx
	}: {
		children?: React.ReactNode
		variant?: string
		sx?: React.CSSProperties
	}) => (
		<span data-testid="typography" data-variant={variant} style={sx}>
			{children}
		</span>
	),
	Divider: ({
		orientation,
		variant,
		flexItem,
		sx
	}: {
		orientation?: string
		variant?: string
		flexItem?: boolean
		sx?: React.CSSProperties
	}) => (
		<div
			data-testid="divider"
			data-orientation={orientation}
			data-variant={variant}
			data-flexitem={flexItem}
			style={sx}
		/>
	),
	Button: ({
		children,
		onClick,
		variant,
		color,
		startIcon,
		disabled
	}: {
		children?: React.ReactNode
		onClick?: () => void
		variant?: string
		color?: string
		startIcon?: React.ReactNode
		disabled?: boolean
	}) => (
		<button
			data-testid="mui-button"
			onClick={onClick}
			data-variant={variant}
			data-color={color}
			data-disabled={disabled}
			disabled={disabled}
		>
			{startIcon && <span data-testid="start-icon">{startIcon}</span>}
			{children}
		</button>
	),
	useTheme: () => ({
		palette: {
			text: {
				primary: '#000000'
			}
		}
	})
}))

// Mock MUI icons individually
vi.mock('@mui/icons-material/Settings', () => ({
	default: () => <div data-testid="settings-icon">Settings</div>
}))
vi.mock('@mui/icons-material/Language', () => ({
	default: () => <div data-testid="web-icon">Web</div>
}))
vi.mock('@mui/icons-material/CreateNewFolder', () => ({
	default: () => <div data-testid="create-new-folder-icon">CreateNewFolder</div>
}))
vi.mock('@mui/icons-material/Terminal', () => ({
	default: () => <div data-testid="terminal-icon">Terminal</div>
}))
vi.mock('@mui/icons-material/Save', () => ({
	default: () => <div data-testid="save-icon">Save</div>
}))
vi.mock('@mui/icons-material/Comment', () => ({
	default: () => <div data-testid="comment-icon">Comment</div>
}))
vi.mock('@mui/icons-material/ContentCopy', () => ({
	default: () => <div data-testid="content-copy-icon">ContentCopy</div>
}))
vi.mock('@mui/icons-material/ContentCut', () => ({
	default: () => <div data-testid="content-cut-icon">ContentCut</div>
}))
vi.mock('@mui/icons-material/ContentPaste', () => ({
	default: () => <div data-testid="content-paste-icon">ContentPaste</div>
}))
vi.mock('@mui/icons-material/Undo', () => ({
	default: () => <div data-testid="undo-icon">Undo</div>
}))
vi.mock('@mui/icons-material/Redo', () => ({
	default: () => <div data-testid="redo-icon">Redo</div>
}))
vi.mock('@mui/icons-material/Clear', () => ({
	default: () => <div data-testid="clear-icon">Clear</div>
}))
vi.mock('@mui/icons-material/StopCircle', () => ({
	default: () => <div data-testid="stop-circle-icon">StopCircle</div>
}))
vi.mock('@mui/icons-material/PlayArrow', () => ({
	default: () => <div data-testid="play-arrow-icon">PlayArrow</div>
}))
vi.mock('@mui/icons-material/Stop', () => ({
	default: () => <div data-testid="stop-icon">Stop</div>
}))

// Mock Snippets component
vi.mock('../../../components/Snippets/Snippets.js', () => ({
	default: ({ editorRef }: { editorRef?: React.RefObject<unknown> }) => (
		<div data-testid="snippets" data-editor-ref={!!editorRef}>
			Snippets Component
		</div>
	)
}))

// Mock TerminalsDialog component
vi.mock('../../../components/TerminalsDialog/TerminalsDialog.js', () => ({
	default: () => <div data-testid="terminals-dialog">TerminalsDialog</div>
}))

// Mock dialog components
vi.mock('../../../components/Toolbar/components/CreateFileFolderDialog.js', () => ({
	default: ({
		externalOpen,
		onExternalClose
	}: {
		externalOpen?: boolean
		onExternalClose?: () => void
	}) => (
		<div data-testid="create-file-folder-dialog" data-open={externalOpen}>
			CreateFileFolderDialog
			{externalOpen && (
				<button data-testid="close-create-dialog" onClick={onExternalClose}>
					Close
				</button>
			)}
		</div>
	)
}))

vi.mock('../../../components/Toolbar/components/SettingsDialog.js', () => ({
	default: ({ open, onClose }: { open?: boolean; onClose?: () => void }) => (
		<div data-testid="settings-dialog" data-open={open}>
			SettingsDialog
			{open && (
				<button data-testid="close-settings-dialog" onClick={onClose}>
					Close
				</button>
			)}
		</div>
	)
}))

vi.mock('../../../components/Toolbar/components/SimpleBrowserDialog.js', () => ({
	default: ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => (
		<div data-testid="simple-browser-dialog" data-open={isOpen}>
			SimpleBrowserDialog
			{isOpen && (
				<button data-testid="close-browser-dialog" onClick={onClose}>
					Close
				</button>
			)}
		</div>
	)
}))

vi.mock('../../../components/Toolbar/components/TranscriptDialog/TranscriptDialog.js', () => ({
	default: ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => (
		<div data-testid="transcript-dialog" data-open={isOpen}>
			TranscriptDialog
			{isOpen && (
				<button data-testid="close-transcript-dialog" onClick={onClose}>
					Close
				</button>
			)}
		</div>
	)
}))

describe('Toolbar Integration', () => {
	const mockHandleButtonClick = vi.fn()
	const mockEditorRef = { current: null }

	const renderToolbar = (focus: 'editor' | 'terminal' = 'editor') => {
		return render(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<Toolbar
						focus={focus}
						switchFocus={vi.fn()}
						handleButtonClick={mockHandleButtonClick}
						editorRef={mockEditorRef}
						keyboardVisible={true}
						toggleKeyboard={vi.fn()}
						openSimpleBrowserDialog={vi.fn()}
						openFileFolderDialog={vi.fn()}
						openTranscriptDialog={vi.fn()}
						openSettingsDialog={vi.fn()}
						openBlinkDialog={vi.fn()}
					/>
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)
	}

	beforeEach(() => {
		mockPostMessage.mockClear()
		mockHandleButtonClick.mockClear()
	})

	it('renders toolbar with general shortcuts', () => {
		renderToolbar()

		expect(screen.getByTestId('terminals-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('web-icon')).toBeInTheDocument()
		expect(screen.getByTestId('create-new-folder-icon')).toBeInTheDocument()
		expect(screen.getByTestId('terminal-icon')).toBeInTheDocument()
		expect(screen.getByTestId('save-icon')).toBeInTheDocument()
		expect(screen.getByTestId('comment-icon')).toBeInTheDocument()
	})

	it('renders editor shortcuts when focus is editor', () => {
		renderToolbar('editor')

		expect(screen.getByTestId('snippets')).toBeInTheDocument()
		expect(screen.getByTestId('content-copy-icon')).toBeInTheDocument()
		expect(screen.getByTestId('content-paste-icon')).toBeInTheDocument()
		expect(screen.getByTestId('content-cut-icon')).toBeInTheDocument()
		expect(screen.getByTestId('undo-icon')).toBeInTheDocument()
		expect(screen.getByTestId('redo-icon')).toBeInTheDocument()
	})

	it('renders terminal shortcuts when focus is terminal', () => {
		renderToolbar('terminal')

		expect(screen.queryByTestId('snippets')).not.toBeInTheDocument()
		expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
		expect(screen.getByTestId('stop-circle-icon')).toBeInTheDocument()
	})

	it('calls handleButtonClick for terminal shortcut', async () => {
		renderToolbar()

		const terminalButton = screen.getByTestId('terminal-icon').closest('button')
		fireEvent.click(terminalButton!)

		await waitFor(() => {
			expect(mockHandleButtonClick).toHaveBeenCalledWith('{open-terminal}')
		})
	})

	it('calls handleButtonClick for save shortcut', async () => {
		renderToolbar()

		const saveButton = screen.getByTestId('save-icon').closest('button')
		fireEvent.click(saveButton!)

		await waitFor(() => {
			expect(mockHandleButtonClick).toHaveBeenCalledWith('{save}')
		})
	})

	it('calls handleButtonClick for editor shortcuts', async () => {
		renderToolbar('editor')

		const copyButton = screen.getByTestId('content-copy-icon').closest('button')
		fireEvent.click(copyButton!)

		await waitFor(() => {
			expect(mockHandleButtonClick).toHaveBeenCalledWith('{copy}')
		})
	})

	it('calls handleButtonClick for terminal shortcuts', async () => {
		renderToolbar('terminal')

		const clearButton = screen.getByTestId('clear-icon').closest('button')
		fireEvent.click(clearButton!)

		await waitFor(() => {
			expect(mockHandleButtonClick).toHaveBeenCalledWith('{cls}')
		})
	})

	it('calls openSettingsDialog when settings button is clicked', async () => {
		const mockOpenSettingsDialog = vi.fn()
		render(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<Toolbar
						focus="editor"
						switchFocus={vi.fn()}
						handleButtonClick={mockHandleButtonClick}
						editorRef={mockEditorRef}
						keyboardVisible={true}
						toggleKeyboard={vi.fn()}
						openSimpleBrowserDialog={vi.fn()}
						openFileFolderDialog={vi.fn()}
						openTranscriptDialog={vi.fn()}
						openSettingsDialog={mockOpenSettingsDialog}
						openBlinkDialog={vi.fn()}
					/>
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)

		const settingsButton = screen.getByTestId('settings-icon').closest('button')
		fireEvent.click(settingsButton!)

		await waitFor(() => {
			expect(mockOpenSettingsDialog).toHaveBeenCalled()
		})
	})

	it('toggles keyboard visibility', async () => {
		const mockToggleKeyboard = vi.fn()
		render(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<Toolbar
						focus="editor"
						switchFocus={vi.fn()}
						handleButtonClick={mockHandleButtonClick}
						editorRef={mockEditorRef}
						keyboardVisible={true}
						toggleKeyboard={mockToggleKeyboard}
						openSimpleBrowserDialog={vi.fn()}
						openFileFolderDialog={vi.fn()}
						openTranscriptDialog={vi.fn()}
						openSettingsDialog={vi.fn()}
						openBlinkDialog={vi.fn()}
					/>
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)

		const keyboardButton = screen.getByText('Hide Keyboard')
		fireEvent.click(keyboardButton)

		await waitFor(() => {
			expect(mockToggleKeyboard).toHaveBeenCalled()
		})
	})

	it('shows correct keyboard toggle text based on visibility', () => {
		const { rerender } = render(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<Toolbar
						focus="editor"
						switchFocus={vi.fn()}
						handleButtonClick={mockHandleButtonClick}
						editorRef={mockEditorRef}
						keyboardVisible={true}
						toggleKeyboard={vi.fn()}
						openSimpleBrowserDialog={vi.fn()}
						openFileFolderDialog={vi.fn()}
						openTranscriptDialog={vi.fn()}
						openSettingsDialog={vi.fn()}
						openBlinkDialog={vi.fn()}
					/>
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)

		expect(screen.getByText('Hide Keyboard')).toBeInTheDocument()

		rerender(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<Toolbar
						focus="editor"
						switchFocus={vi.fn()}
						handleButtonClick={mockHandleButtonClick}
						editorRef={mockEditorRef}
						keyboardVisible={false}
						toggleKeyboard={vi.fn()}
						openSimpleBrowserDialog={vi.fn()}
						openFileFolderDialog={vi.fn()}
						openTranscriptDialog={vi.fn()}
						openSettingsDialog={vi.fn()}
						openBlinkDialog={vi.fn()}
					/>
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)

		expect(screen.getByText('Show Keyboard')).toBeInTheDocument()
	})

	it('renders dividers between shortcut groups', () => {
		renderToolbar('editor')

		const dividers = screen.getAllByTestId('divider')
		expect(dividers).toHaveLength(3)
	})

	it('renders settings button at the end', () => {
		renderToolbar()

		const settingsIcon = screen.getByTestId('settings-icon')
		expect(settingsIcon).toBeInTheDocument()
	})
})
