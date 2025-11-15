import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

		expect(screen.getByText('q')).toBeInTheDocument()
	})

	it('should handle key presses correctly', () => {
		const onInput = vi.fn()
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={true} onInput={onInput} />
			</KeyboardFocusProvider>
		)

		const aKey = screen.getByRole('button', { name: 'a' })
		fireEvent.click(aKey)
		expect(onInput).toHaveBeenCalledWith('a')

		const spaceButton = screen.getByTestId('SpaceBarIcon').closest('button')
		if (!spaceButton) {
			throw new Error('Space button not found')
		}
		fireEvent.click(spaceButton)
		expect(onInput).toHaveBeenCalledWith('{space}')
	})

	it('should toggle shift state', () => {
		render(
			<KeyboardFocusProvider>
				<PupilKeyboard visible={true} />
			</KeyboardFocusProvider>
		)

		const capsKey = screen.getByTestId('KeyboardCapslockIcon')
		const capsButton = capsKey.closest('button')
		if (!capsButton) {
			throw new Error('Caps button not found')
		}
		fireEvent.click(capsButton)
		expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument()
	})

	it('should trigger highlighted button on Space key when highlight sequence is active', async () => {
 		const onInput = vi.fn()
 		render(
 			<KeyboardFocusProvider>
 				<PupilKeyboard visible={true} onInput={onInput} highlightDelayMs={10} highlightGapMs={10} />
 			</KeyboardFocusProvider>
 		)

 		const startBtn = screen.getByTestId('start-highlight-sequence')
 		fireEvent.click(startBtn)

 		// wait for a button to be highlighted via data-highlighted attribute
 		await waitFor(() => {
 			const highlighted = document.querySelector('button[data-highlighted="true"]')
 			if (!highlighted) {
 				throw new Error('no highlighted button yet')
 			}
 		})

 		fireEvent.keyDown(document, { key: ' ', code: 'Space' })

 		expect(onInput).toHaveBeenCalled()
 	})
})
