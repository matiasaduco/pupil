import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PupilKeyboard from '@components/PupilKeyboard/PupilKeyboard.js'
import { KeyboardFocusProvider } from '@webview/contexts/KeyboardFocusContext.js'

describe('PupilKeyboard', () => {
	it('should not render when visible is false', () => {
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={false} />
			</KeyboardFocusProvider>
		)

		expect(screen.queryByRole('grid')).not.toBeInTheDocument()
	})

	it('should render when visible is true', () => {
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={true} />
			</KeyboardFocusProvider>
		)

		expect(screen.getByRole('grid')).toBeInTheDocument()
	})

	it('should handle key presses correctly', () => {
		const onInput = vi.fn()
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={true} onInput={onInput} />
			</KeyboardFocusProvider>
		)

		// Find and click a regular key (e.g., 'a')
		const aKey = screen.getByText('a')
		fireEvent.click(aKey)
		expect(onInput).toHaveBeenCalledWith('a')

		// Test special keys (e.g., space)
		const spaceKey = screen.getByText('space')
		fireEvent.click(spaceKey)
		expect(onInput).toHaveBeenCalledWith('{space}')
	})

	it('should toggle shift state', () => {
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={true} />
			</KeyboardFocusProvider>
		)

		const shiftKey = screen.getByText('shift')
		fireEvent.click(shiftKey)

		// After clicking shift, some keys should show uppercase
		expect(screen.getByText('A')).toBeInTheDocument()
	})
})
