import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import PupilDialog from '@components/PupilDialog/PupilDialog.js'
import '@testing-library/jest-dom'

const mockPortalTarget = document.createElement('div')
mockPortalTarget.id = 'pupil-dialog-portal'
document.body.appendChild(mockPortalTarget)

vi.mock('react-dom', () => ({
	createPortal: (children: React.ReactNode) => <div data-testid="portal">{children}</div>
}))

vi.mock('@components/PupilDialog/hooks/usePupilDialog.js', () => ({
	default: () => ({ portalTarget: mockPortalTarget })
}))

vi.mock('@mui/material', () => ({
	Card: ({
		children,
		className,
		sx
	}: {
		children: React.ReactNode
		className?: string
		sx?: Record<string, unknown>
	}) => (
		<div data-testid="card" className={className} style={sx}>
			{children}
		</div>
	),
	CardActions: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="card-actions" className={className}>
			{children}
		</div>
	),
	CardContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="card-content">{children}</div>
	),
	CardHeader: ({ title }: { title: string }) => <div data-testid="card-header">{title}</div>,
	useTheme: () => ({
		palette: {
			action: { disabledBackground: 'rgba(0,0,0,0.5)' },
			background: { default: '#fff' },
			text: { primary: '#000' }
		}
	})
}))

vi.mock('@components/PupilDialog/components/ActionButton.js', () => ({
	default: ({ text, onClick }: { text: string; onClick: () => void }) => (
		<button data-testid={`action-button-${text.toLowerCase()}`} onClick={onClick}>
			{text}
		</button>
	)
}))

describe('PupilDialog', () => {
	const mockOnClose = vi.fn()
	const mockOnSubmit = vi.fn()
	const mockOnCancel = vi.fn()

	it('should render when open is true', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.getByTestId('portal')).toBeInTheDocument()
		expect(screen.getByTestId('card')).toBeInTheDocument()
		expect(screen.getByText('Test Content')).toBeInTheDocument()
	})

	it('should not render when open is false', () => {
		render(
			<PupilDialog open={false} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.queryByTestId('portal')).not.toBeInTheDocument()
	})

	it('should render title when provided', () => {
		render(
			<PupilDialog open={true} title="Test Title" onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.getByTestId('card-header')).toHaveTextContent('Test Title')
	})

	it('should not render title when not provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.queryByTestId('card-header')).not.toBeInTheDocument()
	})

	it('should call onClose when backdrop is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const backdrop = screen.getByTestId('portal').firstChild as HTMLElement
		fireEvent.click(backdrop)

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('should render submit button when onSubmit is provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onSubmit={mockOnSubmit}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.getByTestId('action-button-submit')).toBeInTheDocument()
	})

	it('should render cancel button when onCancel is provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onCancel={mockOnCancel}>
				<div>Test Content</div>
			</PupilDialog>
		)

		expect(screen.getByTestId('action-button-cancel')).toBeInTheDocument()
	})

	it('should call onSubmit when submit button is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onSubmit={mockOnSubmit}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const submitButton = screen.getByTestId('action-button-submit')
		fireEvent.click(submitButton)

		expect(mockOnSubmit).toHaveBeenCalledTimes(1)
	})

	it('should call onCancel when cancel button is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onCancel={mockOnCancel}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const cancelButton = screen.getByTestId('action-button-cancel')
		fireEvent.click(cancelButton)

		expect(mockOnCancel).toHaveBeenCalledTimes(1)
	})

	it('should hide card actions when no actions provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const cardActions = screen.getByTestId('card-actions')
		expect(cardActions).toHaveClass('hidden')
	})
})
