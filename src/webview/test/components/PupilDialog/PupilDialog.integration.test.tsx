import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import * as React from 'react'
import PupilDialog from '@components/PupilDialog/PupilDialog.js'
import '@testing-library/jest-dom'

// Create portal target for dialogs
const portalTarget = document.createElement('div')
portalTarget.id = 'pupil-dialog-portal'
document.body.appendChild(portalTarget)

vi.mock('@components/PupilDialog/hooks/usePupilDialog.js', () => ({
	default: () => ({ portalTarget })
}))

describe('PupilDialog Integration', () => {
	const mockOnClose = vi.fn()
	const mockOnSubmit = vi.fn()
	const mockOnCancel = vi.fn()

	beforeEach(() => {
		mockOnClose.mockClear()
		mockOnSubmit.mockClear()
		mockOnCancel.mockClear()
	})

	it('should render dialog content in portal when open is true', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		// Check that content is rendered in the portal
		const portal = document.getElementById('pupil-dialog-portal')
		expect(portal).toBeInTheDocument()

		// The dialog should be rendered inside the portal
		const cardInPortal = portal?.querySelector('.MuiCard-root')
		expect(cardInPortal).toBeInTheDocument()

		// Check backdrop is present
		const backdropInPortal = portal?.querySelector('.absolute.inset-0.z-10')
		expect(backdropInPortal).toBeInTheDocument()

		// Check content is rendered
		const contentInPortal = portal?.querySelector('.MuiCardContent-root')
		expect(contentInPortal?.textContent).toBe('Test Content')
	})

	it('should not render when open is false', () => {
		render(
			<PupilDialog open={false} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		// Portal should be empty when dialog is closed
		expect(portal?.children.length).toBe(0)
	})

	it('should render title when provided', () => {
		render(
			<PupilDialog open={true} title="Test Title" onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const titleInPortal = portal?.querySelector('.MuiCardHeader-title')
		expect(titleInPortal?.textContent).toBe('Test Title')
	})

	it('should not render title when not provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const titleInPortal = portal?.querySelector('.MuiCardHeader-title')
		expect(titleInPortal).toBeNull()
	})

	it('should call onClose when backdrop is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const backdrop = portal?.querySelector('.absolute.inset-0.z-10')

		if (backdrop) {
			fireEvent.click(backdrop)
			expect(mockOnClose).toHaveBeenCalledTimes(1)
		}
	})

	it('should render submit button when onSubmit is provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onSubmit={mockOnSubmit}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const submitButton = portal?.querySelector('button')
		expect(submitButton).toBeInTheDocument()
		expect(submitButton?.textContent).toBe('Submit')
	})

	it('should render cancel button when onCancel is provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onCancel={mockOnCancel}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const cancelButton = portal?.querySelector('button')
		expect(cancelButton).toBeInTheDocument()
		expect(cancelButton?.textContent).toBe('Cancel')
	})

	it('should call onSubmit when submit button is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onSubmit={mockOnSubmit}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const submitButton = portal?.querySelector('button')

		if (submitButton) {
			fireEvent.click(submitButton)
			expect(mockOnSubmit).toHaveBeenCalledTimes(1)
		}
	})

	it('should call onCancel when cancel button is clicked', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose} onCancel={mockOnCancel}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const cancelButton = portal?.querySelector('button')

		if (cancelButton) {
			fireEvent.click(cancelButton)
			expect(mockOnCancel).toHaveBeenCalledTimes(1)
		}
	})

	it('should hide card actions when no actions provided', () => {
		render(
			<PupilDialog open={true} onClose={mockOnClose}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const cardActions = portal?.querySelector('.MuiCardActions-root')
		expect(cardActions).toHaveClass('hidden')
	})

	it('should render extra action when provided', () => {
		const extraAction = <button data-testid="extra-action">Extra</button>

		render(
			<PupilDialog open={true} onClose={mockOnClose} extraAction={extraAction}>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const extraActionInPortal = portal?.querySelector('[data-testid="extra-action"]')
		expect(extraActionInPortal).toBeInTheDocument()
	})

	it('should apply custom onSubmit icon', () => {
		const submitIcon = <span data-testid="submit-icon">✓</span>

		render(
			<PupilDialog
				open={true}
				onClose={mockOnClose}
				onSubmit={mockOnSubmit}
				onSubmitIcon={submitIcon}
			>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const iconInPortal = portal?.querySelector('[data-testid="submit-icon"]')
		expect(iconInPortal).toBeInTheDocument()
	})

	it('should apply custom onCancel icon', () => {
		const cancelIcon = <span data-testid="cancel-icon">✗</span>

		render(
			<PupilDialog
				open={true}
				onClose={mockOnClose}
				onCancel={mockOnCancel}
				onCancelIcon={cancelIcon}
			>
				<div>Test Content</div>
			</PupilDialog>
		)

		const portal = document.getElementById('pupil-dialog-portal')
		const iconInPortal = portal?.querySelector('[data-testid="cancel-icon"]')
		expect(iconInPortal).toBeInTheDocument()
	})
})
