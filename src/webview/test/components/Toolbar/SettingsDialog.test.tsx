import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
vi.mock('@mui/material', () => {
	return {
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
		Switch: ({
			checked,
			onChange,
			color
		}: {
			checked?: boolean
			onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
			color?: string
		}) => (
			<input
				data-testid="mui-switch"
				type="checkbox"
				checked={checked}
				data-color={color}
				onChange={(event) => onChange?.(event, event.target.checked)}
			/>
		),
		FormControlLabel: ({
			control,
			label,
			value,
			checked,
			onChange
		}: {
			control: React.ReactElement
			label: string
			value?: string
			checked?: boolean
			onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
		}) => {
			const element = control as React.ReactElement<Record<string, unknown>>
			const controlWithLabel = React.cloneElement(element, {
				value,
				checked,
				onChange: onChange ?? element.props?.onChange
			})
			return (
				<label data-testid="form-control-label">
					{controlWithLabel}
					<span>{label}</span>
				</label>
			)
		},
		Slider: (props: {
			value: number
			onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: number) => void
			min?: number
			max?: number
			step?: number
			['data-testid']?: string
			valueLabelDisplay?: string
		}) => {
			const { value, onChange, min, max, step } = props
			const dataTestId = props['data-testid']
			return (
				<input
					data-testid={dataTestId}
					type="range"
					value={value}
					min={min}
					max={max}
					step={step}
					onChange={(event) => onChange?.(event, Number(event.target.value))}
				/>
			)
		},
		Typography: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
		FormControl: ({ children }: { children?: React.ReactNode }) => (
			<div data-testid="mui-form-control">{children}</div>
		),
		FormLabel: ({ children }: { children?: React.ReactNode }) => <h4>{children}</h4>,
		RadioGroup: ({
			children,
			value,
			onChange,
			row
		}: {
			children?: React.ReactNode
			value: string
			onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void
			row?: boolean
		}) => {
			const name = 'mui-radio-group'
			const enhancedChildren = React.Children.map(children, (child) => {
				if (!React.isValidElement(child)) {
					return child
				}
				const element = child as React.ReactElement<Record<string, unknown>>
				return React.cloneElement(element, {
					name,
					checked: element.props?.value === value,
					onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
						onChange?.(event, event.target.value)
				})
			})
			return (
				<div data-testid="mui-radio-group" data-row={row ? 'true' : 'false'}>
					{enhancedChildren}
				</div>
			)
		},
		Radio: ({
			value,
			checked,
			onChange
		}: {
			value: string
			checked?: boolean
			onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
		}) => (
			<input type="radio" value={value} checked={checked} onChange={onChange} aria-label={value} />
		)
	}
})

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
	const mockOnToggleRadial = vi.fn()
	const mockOnHighlightDelayChange = vi.fn()
	const mockOnSectionGuideModeChange = vi.fn()

	type TestSettingsDialogProps = {
		open: boolean
		onClose: () => void
		onStartServer: () => void
		onStopServer: () => void
		connectionStatus:
			| typeof ConnectionStatus.CONNECTED
			| typeof ConnectionStatus.CONNECTING
			| typeof ConnectionStatus.DISCONNECTED
		radialEnabled: boolean
		onToggleRadial: () => void
		highlightDelayMs: number
		onHighlightDelayChange: (value: number) => void
		sectionGuideMode: 'toolbar' | 'keyboard' | 'both'
		onSectionGuideModeChange: (mode: 'toolbar' | 'keyboard' | 'both') => void
	}

	const defaultProps: TestSettingsDialogProps = {
		open: true,
		onClose: mockOnClose,
		onStartServer: mockOnStartServer,
		onStopServer: mockOnStopServer,
		connectionStatus: ConnectionStatus.DISCONNECTED,
		radialEnabled: false,
		onToggleRadial: mockOnToggleRadial,
		highlightDelayMs: 600,
		onHighlightDelayChange: mockOnHighlightDelayChange,
		sectionGuideMode: 'both',
		onSectionGuideModeChange: mockOnSectionGuideModeChange
	}

	const renderSettingsDialog = (props: Partial<TestSettingsDialogProps> = {}) => {
		return render(<SettingsDialog {...defaultProps} {...props} />)
	}

	beforeEach(() => {
		mockOnStartServer.mockClear()
		mockOnStopServer.mockClear()
		mockOnClose.mockClear()
		mockOnToggleRadial.mockClear()
		mockOnHighlightDelayChange.mockClear()
		mockOnSectionGuideModeChange.mockClear()
	})

	it('renders dialog when open is true', () => {
		renderSettingsDialog()

		expect(screen.getByTestId('pupil-dialog')).toBeInTheDocument()
		expect(screen.getByText('Configuración')).toBeInTheDocument()
	})

	it('does not render dialog when open is false', () => {
		renderSettingsDialog({ open: false })

		expect(screen.queryByTestId('pupil-dialog')).not.toBeInTheDocument()
	})

	it('displays configuration text', () => {
		renderSettingsDialog()

		expect(screen.getByText('Aquí puedes configurar las opciones de Pupil.')).toBeInTheDocument()
		expect(
			screen.getByText(
				'Por ahora está disponible la opción de iniciar y detener el servidor de reconocimiento de voz.'
			)
		).toBeInTheDocument()
	})

	it('renders start server button when disconnected', () => {
		renderSettingsDialog()

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeInTheDocument()
		expect(startButton).not.toBeDisabled()
	})

	it('renders start server button when connecting', () => {
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTING })

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeInTheDocument()
		expect(startButton).toBeDisabled()
	})

	it('renders stop server button when connected', () => {
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTED })

		const stopButton = screen.getByText('Detener Servidor')
		expect(stopButton).toBeInTheDocument()
		expect(stopButton).not.toBeDisabled()
	})

	it('does not render start server button when connected', () => {
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTED })

		const startButton = screen.getByText('Iniciar Servidor')
		expect(startButton).toBeDisabled()
	})

	it('does not render stop server button when not connected', () => {
		renderSettingsDialog()

		const stopButton = screen.getByText('Detener Servidor')
		expect(stopButton).toBeDisabled()
	})

	it('toggles radial keyboard option', () => {
		renderSettingsDialog({ radialEnabled: false })

		const toggle = screen.getByLabelText('Activar Teclado Radial')
		fireEvent.click(toggle)

		expect(mockOnToggleRadial).toHaveBeenCalledTimes(1)
	})

	it('updates highlight delay when slider changes', () => {
		renderSettingsDialog({ highlightDelayMs: 600 })

		const slider = screen.getByTestId('highlight-speed-slider')
		fireEvent.change(slider, { target: { value: '800' } })

		expect(mockOnHighlightDelayChange).toHaveBeenCalledWith(800)
	})

	it('changes section guide mode via radio group', () => {
		renderSettingsDialog({ sectionGuideMode: 'toolbar' })

		const keyboardOption = screen.getByLabelText('Teclado')
		fireEvent.click(keyboardOption)

		expect(mockOnSectionGuideModeChange).toHaveBeenCalledWith('keyboard')
	})

	it('calls onStartServer when start button is clicked', () => {
		renderSettingsDialog()

		const startButton = screen.getByText('Iniciar Servidor')
		fireEvent.click(startButton)

		expect(mockOnStartServer).toHaveBeenCalledTimes(1)
	})

	it('calls onStopServer when stop button is clicked', () => {
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTED })

		const stopButton = screen.getByText('Detener Servidor')
		fireEvent.click(stopButton)

		expect(mockOnStopServer).toHaveBeenCalledTimes(1)
	})

	it('renders start button with success color', () => {
		renderSettingsDialog()

		const buttons = screen.getAllByTestId('mui-button')
		const startButton = buttons.find((button) => button.textContent?.includes('Iniciar Servidor'))
		expect(startButton).toHaveAttribute('data-color', 'success')
	})

	it('renders stop button with error color', () => {
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTED })

		const buttons = screen.getAllByTestId('mui-button')
		const stopButton = buttons.find((button) => button.textContent?.includes('Detener Servidor'))
		expect(stopButton).toHaveAttribute('data-color', 'error')
	})

	it('renders buttons with correct icons', () => {
		const { unmount } = renderSettingsDialog({ connectionStatus: ConnectionStatus.DISCONNECTED })

		expect(screen.getByTestId('play-arrow-icon')).toBeInTheDocument()

		// Clean up first render
		unmount()

		// Re-render with connected status to check stop icon
		renderSettingsDialog({ connectionStatus: ConnectionStatus.CONNECTED })

		expect(screen.getByTestId('stop-icon')).toBeInTheDocument()
	})
})
