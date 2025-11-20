import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TranscriptDialog from '../../../components/Toolbar/components/TranscriptDialog/TranscriptDialog.js'

// Mock PupilDialog
vi.mock('../../../components/PupilDialog/PupilDialog.js', () => ({
	default: ({
		children,
		onClose,
		onSubmit,
		open,
		extraAction,
		onSubmitIcon
	}: {
		children?: React.ReactNode
		onClose?: () => void
		onSubmit?: () => void
		open: boolean
		extraAction?: React.ReactNode
		onSubmitIcon?: React.ReactNode
	}) =>
		open ? (
			<div data-testid="pupil-dialog">
				<div data-testid="dialog-content">{children}</div>
				<div data-testid="extra-action">{extraAction}</div>
				<div data-testid="submit-icon">{onSubmitIcon}</div>
				<button data-testid="dialog-close" onClick={onClose}>
					Close
				</button>
				<button data-testid="dialog-submit" onClick={onSubmit}>
					Submit
				</button>
			</div>
		) : null
}))

// Mock MUI components
vi.mock('@mui/material', () => ({
	IconButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button data-testid="icon-button" onClick={onClick}>
			{children}
		</button>
	),
	Switch: ({ onClick, defaultChecked }: { onClick?: () => void; defaultChecked?: boolean }) => (
		<input type="checkbox" data-testid="switch" defaultChecked={defaultChecked} onClick={onClick} />
	),
	TextField: ({
		inputRef,
		multiline,
		rows,
		value,
		placeholder,
		variant,
		fullWidth,
		InputProps
	}: {
		inputRef?: React.Ref<HTMLTextAreaElement>
		multiline?: boolean
		rows?: number
		value?: string
		placeholder?: string
		variant?: string
		fullWidth?: boolean
		InputProps?: { readOnly?: boolean }
	}) => (
		<textarea
			data-testid="text-field"
			ref={inputRef}
			rows={rows}
			value={value}
			placeholder={placeholder}
			readOnly={InputProps?.readOnly}
		/>
	)
}))

vi.mock('@mui/icons-material/Mic', () => ({
	default: () => <span data-testid="mic-icon">Mic</span>
}))

vi.mock('@mui/icons-material/StopCircle', () => ({
	default: () => <span data-testid="stop-icon">Stop</span>
}))

vi.mock('@mui/icons-material/Send', () => ({
	default: () => <span data-testid="send-icon">Send</span>
}))

// Mock KeyboardFocusContext
vi.mock('../../../contexts/KeyboardFocusContext.js', () => ({
	useKeyboardFocus: () => ({
		setActiveInput: vi.fn()
	})
}))

// Mock logger
vi.mock('../../../../utils/logger.js', () => ({
	default: {
		info: vi.fn()
	}
}))

// Mock useSpeechRecognition hook
const mockUseSpeechRecognition = vi.fn()
vi.mock(
	'../../../components/Toolbar/components/TranscriptDialog/hooks/useSpeechRecognition.js',
	() => ({
		default: (...args: unknown[]) => mockUseSpeechRecognition(...args)
	})
)

// Mock VS Code API
const mockPostMessage = vi.fn()
vi.mock('../../../contexts/VsCodeApiContext.js', () => ({
	useVsCodeApi: () => ({
		postMessage: mockPostMessage
	})
}))

describe('TranscriptDialog', () => {
	const mockOnClose = vi.fn()
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
		}
	}

	const connectionStatus = {
		value: 'connected',
		label: 'Connected',
		icon: '🟢'
	}

	const renderTranscriptDialog = (props: {
		isOpen: boolean
		onClose: () => void
		connectionStatus: typeof connectionStatus
	}) => {
		return render(
			<TranscriptDialog
				isOpen={props.isOpen}
				editorRef={mockEditorRef}
				onClose={props.onClose}
				connectionStatus={props.connectionStatus}
			/>
		)
	}

	beforeEach(() => {
		mockOnClose.mockClear()
		mockPostMessage.mockClear()
		mockEditorRef.current.insertCommentBlockAtCursor.mockClear()
		mockEditorRef.current.insertMultipleAtCursor.mockClear()
		// Default mock implementation
		mockUseSpeechRecognition.mockReturnValue({
			transcript: '',
			listening: false,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: vi.fn()
		})
	})

	it('renders dialog when isOpen is true', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.getByTestId('pupil-dialog')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('No transcript available.')).toBeInTheDocument()
	})

	it('does not render dialog when isOpen is false', () => {
		renderTranscriptDialog({
			isOpen: false,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.queryByTestId('pupil-dialog')).not.toBeInTheDocument()
	})

	it('renders microphone icon when not listening', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.getByTestId('mic-icon')).toBeInTheDocument()
		expect(screen.queryByTestId('stop-icon')).not.toBeInTheDocument()
	})

	it('renders stop icon when listening', () => {
		mockUseSpeechRecognition.mockReturnValue({
			transcript: '',
			listening: true,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: vi.fn()
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.getByTestId('stop-icon')).toBeInTheDocument()
		expect(screen.queryByTestId('mic-icon')).not.toBeInTheDocument()
	})

	it('renders switch for comment transcription', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		const switchElement = screen.getByTestId('switch')
		expect(switchElement).toBeInTheDocument()
		expect(switchElement).toBeChecked()
	})

	it('renders connection status', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.getByText('Server:')).toBeInTheDocument()
		expect(screen.getByText('🟢')).toBeInTheDocument()
	})

	it('starts listening when microphone button is clicked', () => {
		const mockStartListening = vi.fn()
		mockUseSpeechRecognition.mockReturnValue({
			transcript: '',
			listening: false,
			resetTranscript: vi.fn(),
			startListening: mockStartListening,
			stopListening: vi.fn()
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		fireEvent.click(screen.getByTestId('icon-button'))

		expect(mockStartListening).toHaveBeenCalledWith({ continuous: true })
	})

	it('stops listening when stop button is clicked', () => {
		const mockStopListening = vi.fn()
		mockUseSpeechRecognition.mockReturnValue({
			transcript: '',
			listening: true,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: mockStopListening
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		fireEvent.click(screen.getByTestId('icon-button'))

		expect(mockStopListening).toHaveBeenCalledTimes(1)
	})

	it('toggles comment transcription mode when switch is clicked', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		const switchElement = screen.getByTestId('switch')
		fireEvent.click(switchElement)

		expect(switchElement).not.toBeChecked()
	})

	it('displays transcript with line breaks', () => {
		mockUseSpeechRecognition.mockReturnValue({
			transcript:
				'This is a long transcript that should be broken into multiple lines for better readability',
			listening: false,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: vi.fn()
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		expect(screen.getByText(/This is a long transcript/)).toBeInTheDocument()
	})

	it('calls onClose when dialog close button is clicked', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		fireEvent.click(screen.getByTestId('dialog-close'))

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('inserts comment block when submitting in comment mode', () => {
		mockUseSpeechRecognition.mockReturnValue({
			transcript: 'Test transcript',
			listening: false,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: vi.fn()
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		fireEvent.click(screen.getByTestId('dialog-submit'))

		expect(mockEditorRef.current.insertCommentBlockAtCursor).toHaveBeenCalledWith([
			'Test transcript'
		])
		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('inserts multiple lines when submitting in non-comment mode', () => {
		mockUseSpeechRecognition.mockReturnValue({
			transcript: 'Line 1\nLine 2',
			listening: false,
			resetTranscript: vi.fn(),
			startListening: vi.fn(),
			stopListening: vi.fn()
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		// Switch to non-comment mode
		const switchElement = screen.getByTestId('switch')
		fireEvent.click(switchElement)

		fireEvent.click(screen.getByTestId('dialog-submit'))

		expect(mockEditorRef.current.insertMultipleAtCursor).toHaveBeenCalledWith(['Line 1', 'Line 2'])
		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('stops listening and resets transcript when closing dialog', () => {
		const mockStopListening = vi.fn()
		const mockResetTranscript = vi.fn()
		mockUseSpeechRecognition.mockReturnValue({
			transcript: 'Test transcript',
			listening: true,
			resetTranscript: mockResetTranscript,
			startListening: vi.fn(),
			stopListening: mockStopListening
		})

		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		fireEvent.click(screen.getByTestId('dialog-close'))

		expect(mockStopListening).toHaveBeenCalledTimes(1)
		expect(mockResetTranscript).toHaveBeenCalledTimes(1)
		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('renders transcript box with correct styling', () => {
		renderTranscriptDialog({
			isOpen: true,
			onClose: mockOnClose,
			connectionStatus
		})

		const transcriptBox = screen
			.getByPlaceholderText('No transcript available.')
			.closest('.transcript-box')
		expect(transcriptBox).toBeInTheDocument()
		expect(transcriptBox).toHaveClass('transcript-box')
	})
})
