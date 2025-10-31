import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import ToolbarButton from '../../../components/Toolbar/components/ToolbarButton.js'

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
	useTheme: () => ({
		palette: {
			text: {
				primary: '#000000'
			}
		}
	})
}))

describe('ToolbarButton', () => {
	const mockOnButtonClick = vi.fn()

	const renderToolbarButton = (props: {
		tooltipTitle: string
		icon?: OverridableComponent<SvgIconTypeMap>
		label?: string
		onButtonClick: () => void
	}) => {
		return render(<ToolbarButton {...props} />)
	}

	beforeEach(() => {
		mockOnButtonClick.mockClear()
	})

	it('renders button with icon when icon is provided', () => {
		const MockIcon = () => <div data-testid="mock-icon">Icon</div>

		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			icon: MockIcon,
			onButtonClick: mockOnButtonClick
		})

		expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
		expect(screen.queryByTestId('typography')).not.toBeInTheDocument()
	})

	it('renders button with label when no icon is provided', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test Label',
			onButtonClick: mockOnButtonClick
		})

		expect(screen.getByTestId('typography')).toHaveTextContent('Test Label')
		expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
	})

	it('renders tooltip with correct title', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test',
			onButtonClick: mockOnButtonClick
		})

		const tooltip = screen.getByTestId('tooltip')
		expect(tooltip).toHaveAttribute('title', 'Test tooltip')
	})

	it('calls onButtonClick when button is clicked', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test',
			onButtonClick: mockOnButtonClick
		})

		const button = screen.getByTestId('icon-button')
		fireEvent.click(button)

		expect(mockOnButtonClick).toHaveBeenCalledTimes(1)
	})

	it('applies correct styling to the button', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test',
			onButtonClick: mockOnButtonClick
		})

		const button = screen.getByTestId('icon-button')
		const styles = button.style

		expect(styles.width).toBe('35px')
		expect(styles.height).toBe('35px')
		expect(styles.fontSize).toBe('14px')
	})

	it('passes through additional props to IconButton', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test',
			onButtonClick: mockOnButtonClick
		})

		const button = screen.getByTestId('icon-button')
		expect(button).toBeInTheDocument()
	})

	it('renders icon with correct props when provided', () => {
		let capturedProps: Record<string, unknown> | null = null
		const MockIcon = vi.fn((props: Record<string, unknown>) => {
			capturedProps = props
			return <div data-testid="mock-icon">Icon</div>
		}) as unknown as OverridableComponent<SvgIconTypeMap>

		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			icon: MockIcon,
			onButtonClick: mockOnButtonClick
		})

		expect(capturedProps).toEqual({
			sx: {
				width: 20,
				height: 20,
				color: expect.any(String) // theme color
			}
		})
	})

	it('renders label with correct styling when provided', () => {
		renderToolbarButton({
			tooltipTitle: 'Test tooltip',
			label: 'Test Label',
			onButtonClick: mockOnButtonClick
		})

		const typography = screen.getByTestId('typography')
		expect(typography).toHaveAttribute('data-variant', 'body2')
		const styles = typography.style
		expect(styles.fontSize).toBe('0.75rem')
	})
})
