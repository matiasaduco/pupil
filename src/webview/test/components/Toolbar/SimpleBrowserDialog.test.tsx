import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SimpleBrowserDialog from '../../../components/Toolbar/components/SimpleBrowserDialog.js'

// Mock PupilDialog
vi.mock('../../../components/PupilDialog/PupilDialog.js', () => ({
	default: ({
		children,
		onClose,
		title,
		open
	}: {
		children?: React.ReactNode
		onClose?: () => void
		title?: string
		open: boolean
	}) =>
		open ? (
			<div data-testid="pupil-dialog" data-title={title}>
				<div data-testid="dialog-title">{title}</div>
				<div data-testid="dialog-content">{children}</div>
				<button data-testid="dialog-close" onClick={onClose}>
					Close
				</button>
			</div>
		) : null
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

describe('SimpleBrowserDialog', () => {
	const mockOnClose = vi.fn()
	const mockOnClick = vi.fn()

	const renderSimpleBrowserDialog = (props: {
		isOpen: boolean
		onClose: () => void
		onClick: (url: string, port: string) => void
	}) => {
		return render(
			<SimpleBrowserDialog isOpen={props.isOpen} onClose={props.onClose} onClick={props.onClick} />
		)
	}

	beforeEach(() => {
		mockOnClose.mockClear()
		mockOnClick.mockClear()
	})

	it('renders dialog when isOpen is true', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		expect(screen.getByTestId('pupil-dialog')).toBeInTheDocument()
		expect(screen.getByText('Simple Browser')).toBeInTheDocument()
	})

	it('does not render dialog when isOpen is false', () => {
		renderSimpleBrowserDialog({
			isOpen: false,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		expect(screen.queryByTestId('pupil-dialog')).not.toBeInTheDocument()
	})

	it('renders URL input field with default value', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlInput = screen.getByLabelText('URL')
		expect(urlInput).toBeInTheDocument()
		expect(urlInput).toHaveValue('http://localhost')
		expect(urlInput).toHaveAttribute('placeholder', 'http://localhost')
	})

	it('renders Port input field with default value', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const portInput = screen.getByLabelText('Port')
		expect(portInput).toBeInTheDocument()
		expect(portInput).toHaveValue('3000')
		expect(portInput).toHaveAttribute('placeholder', '3000')
	})

	it('renders Open Browser button', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		expect(screen.getByText('Open Browser')).toBeInTheDocument()
	})

	it('updates URL input value when typing', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlInput = screen.getByLabelText('URL')
		fireEvent.change(urlInput, { target: { value: 'http://example.com' } })

		expect(urlInput).toHaveValue('http://example.com')
	})

	it('updates Port input value when typing', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const portInput = screen.getByLabelText('Port')
		fireEvent.change(portInput, { target: { value: '8080' } })

		expect(portInput).toHaveValue('8080')
	})

	it('calls onClick with correct URL and port when Open Browser button is clicked', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlInput = screen.getByLabelText('URL')
		const portInput = screen.getByLabelText('Port')
		const openButton = screen.getByText('Open Browser')

		fireEvent.change(urlInput, { target: { value: 'http://example.com' } })
		fireEvent.change(portInput, { target: { value: '8080' } })
		fireEvent.click(openButton)

		expect(mockOnClick).toHaveBeenCalledWith('http://example.com', '8080')
		expect(mockOnClick).toHaveBeenCalledTimes(1)
	})

	it('calls onClick with default values when Open Browser button is clicked without changes', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const openButton = screen.getByText('Open Browser')
		fireEvent.click(openButton)

		expect(mockOnClick).toHaveBeenCalledWith('http://localhost', '3000')
		expect(mockOnClick).toHaveBeenCalledTimes(1)
	})

	it('calls onClose when dialog close button is clicked', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const closeButton = screen.getByTestId('dialog-close')
		fireEvent.click(closeButton)

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('calls onClose when Open Browser button is clicked', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const openButton = screen.getByText('Open Browser')
		fireEvent.click(openButton)

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('maintains input values when dialog is reopened', () => {
		const { rerender } = renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlInput = screen.getByLabelText('URL')
		const portInput = screen.getByLabelText('Port')

		fireEvent.change(urlInput, { target: { value: 'http://test.com' } })
		fireEvent.change(portInput, { target: { value: '9090' } })

		// Close dialog
		rerender(<SimpleBrowserDialog isOpen={false} onClose={mockOnClose} onClick={mockOnClick} />)

		// Reopen dialog
		rerender(<SimpleBrowserDialog isOpen={true} onClose={mockOnClose} onClick={mockOnClick} />)

		expect(screen.getByLabelText('URL')).toHaveValue('http://test.com')
		expect(screen.getByLabelText('Port')).toHaveValue('9090')
	})

	it('renders inputs with correct styling classes', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlInput = screen.getByLabelText('URL')
		const portInput = screen.getByLabelText('Port')

		expect(urlInput).toHaveClass('border', 'border-gray-300', 'rounded', 'p-2')
		expect(portInput).toHaveClass('border', 'border-gray-300', 'rounded', 'p-2')
	})

	it('renders labels with correct styling', () => {
		renderSimpleBrowserDialog({
			isOpen: true,
			onClose: mockOnClose,
			onClick: mockOnClick
		})

		const urlLabel = screen.getByText('URL')
		const portLabel = screen.getByText('Port')

		expect(urlLabel).toHaveClass('font-medium')
		expect(portLabel).toHaveClass('font-medium')
	})
})
