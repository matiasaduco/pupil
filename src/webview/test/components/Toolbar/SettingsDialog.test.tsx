import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SettingsDialog from '../../../components/Toolbar/components/SettingsDialog.js'
import { ConnectionStatus } from '../../../../constants.js'

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

// Mock MUI components
vi.mock('@mui/material', () => ({
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
			{startIcon}
			{children}
		</button>
	),
	Box: ({ children, sx }: { children?: React.ReactNode; sx?: React.CSSProperties }) => (
		<div data-testid="mui-box" style={sx}>
			{children}
		</div>
	),
	Switch: ({ checked, onChange, color }: { checked?: boolean; onChange?: () => void; color?: string }) => (
		<input
			type="checkbox"
			data-testid="mui-switch"
			checked={checked}
			onChange={onChange}
			data-color={color}
		/>
	),
	FormControlLabel: ({ control, label }: { control: React.ReactNode; label: string }) => (
		<label data-testid="form-control-label">
			{control}
			<span>{label}</span>
		</label>
	)
}))

// Mock MUI icons
vi.mock('@mui/icons-material/PlayArrow', () => ({
	default: () => <div data-testid="play-arrow-icon">PlayArrow</div>
}))
vi.mock('@mui/icons-material/Stop', () => ({
	default: () => <div data-testid="stop-icon">Stop</div>
}))

describe('SettingsDialog', () => {
	const mockOnStartServer = vi.fn()
	const mockOnStopServer = vi.fn()
	const mockOnClose = vi.fn()

	const renderSettingsDialog = (props: {
		open: boolean
		onStartServer: () => void
		onStopServer: () => void
		connectionStatus:
			| typeof ConnectionStatus.CONNECTED
			| typeof ConnectionStatus.CONNECTING
			| typeof ConnectionStatus.DISCONNECTED
	}) => {
		return render(
			<SettingsDialog
				open={props.open}
				onClose={mockOnClose}
				onStartServer={props.onStartServer}
				onStopServer={props.onStopServer}
				connectionStatus={props.connectionStatus}
			/>
		)
	}

	beforeEach(() => {
		mockOnStartServer.mockClear()
		mockOnStopServer.mockClear()
		mockOnClose.mockClear()
	})

	it('renders dialog when open is true', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		expect(screen.getByTestId('pupil-dialog')).toBeInTheDocument()
		expect(screen.getByText('Configuración')).toBeInTheDocument()
	})

	it('does not render dialog when open is false', () => {
		renderSettingsDialog({
			open: false,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		expect(screen.queryByTestId('pupil-dialog')).not.toBeInTheDocument()
	})

	it('displays configuration text', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		expect(screen.getByText('Aquí puedes configurar las opciones de Pupil.')).toBeInTheDocument()
		expect(
			screen.getByText(
				'Por ahora está disponible la opción de iniciar y detener el servidor de reconocimiento de voz.'
			)
		).toBeInTheDocument()
	})

	it('renders start server button when disconnected', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeInTheDocument()
		expect(startButton).not.toBeDisabled()
	})

	it('renders start server button when connecting', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTING
		})

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeInTheDocument()
		expect(startButton).toBeDisabled()
	})

	it('renders stop server button when connected', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTED
		})

		const stopButton = screen.getByText('Detener Servidor')
		expect(stopButton).toBeInTheDocument()
		expect(stopButton).not.toBeDisabled()
	})

	it('does not render start server button when connected', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTED
		})

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeDisabled()
	})

	it('does not render stop server button when not connected', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		const stopButton = screen.getByText('Detener Servidor')
		expect(stopButton).toBeDisabled()
	})

	it('calls onStartServer when start button is clicked', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		const startButton = screen.getByText('Iniciar Servidor')
		fireEvent.click(startButton)

		expect(mockOnStartServer).toHaveBeenCalledTimes(1)
	})

	it('calls onStopServer when stop button is clicked', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTED
		})

		const stopButton = screen.getByText('Detener Servidor')
		fireEvent.click(stopButton)

		expect(mockOnStopServer).toHaveBeenCalledTimes(1)
	})

	it('renders start button with success color', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		const buttons = screen.getAllByTestId('mui-button')
		const startButton = buttons.find((button) => button.textContent?.includes('Iniciar Servidor'))
		expect(startButton).toHaveAttribute('data-color', 'success')
	})

	it('renders stop button with error color', () => {
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTED
		})

		const buttons = screen.getAllByTestId('mui-button')
		const stopButton = buttons.find((button) => button.textContent?.includes('Detener Servidor'))
		expect(stopButton).toHaveAttribute('data-color', 'error')
	})

	it('renders buttons with correct icons', () => {
		const { unmount } = renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.DISCONNECTED
		})

		expect(screen.getByTestId('play-arrow-icon')).toBeInTheDocument()

		// Clean up first render
		unmount()

		// Re-render with connected status to check stop icon
		renderSettingsDialog({
			open: true,
			onStartServer: mockOnStartServer,
			onStopServer: mockOnStopServer,
			connectionStatus: ConnectionStatus.CONNECTED
		})

		expect(screen.getByTestId('stop-icon')).toBeInTheDocument()
	})
})
