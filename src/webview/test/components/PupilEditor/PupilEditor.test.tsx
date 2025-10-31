import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import * as React from 'react'
import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import type { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { VsCodeApiProvider } from '@webview/contexts/VsCodeApiContext.js'
import '@testing-library/jest-dom'

const mockVsCodeApi = {
	postMessage: vi.fn(),
	getState: () => ({
		editorState: {
			language: 'typescript',
			value: 'test content'
		}
	}),
	setState: vi.fn()
}

vi.mock('@webview/mocks/MockVsCodeApi.js', () => ({
	default: () => mockVsCodeApi
}))

vi.mock('@mui/material', () => ({
	Skeleton: ({ width, height }: { width?: string; height?: string }) => (
		<div data-testid="skeleton" style={{ width, height }}>
			Mock Skeleton
		</div>
	)
}))

describe('PupilEditor', () => {
	it('should render skeleton when initialValue is not provided', () => {
		render(
			<VsCodeApiProvider>
				<PupilEditor visible={true} />
			</VsCodeApiProvider>
		)
		expect(screen.getByTestId('skeleton')).toBeInTheDocument()
	})

	it('should render editor with a ref', async () => {
		const ref = React.createRef<PupilEditorHandle>()

		render(
			<VsCodeApiProvider>
				<PupilEditor ref={ref} visible={true} />
			</VsCodeApiProvider>
		)

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'ts'
					}
				})
			)
		})

		const editor = await screen.findByTestId('mock-editor')
		expect(editor).toBeInTheDocument()

		expect(ref.current).toBeDefined()
		expect(ref.current?.getCursorPosition).toBeDefined()
		expect(ref.current?.insertAtCursor).toBeDefined()
		expect(ref.current?.focus).toBeDefined()
	})

	it('should handle theme changes', async () => {
		render(
			<VsCodeApiProvider>
				<PupilEditor visible={true} theme="vs-dark" />
			</VsCodeApiProvider>
		)

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'init',
						content: 'test content',
						fileExtension: 'ts'
					}
				})
			)
		})

		const editorEl = await screen.findByTestId('mock-editor')
		expect(editorEl.getAttribute('data-theme')).toBe('vs-dark')
	})

	it('should be hidden when visible is false', () => {
		const { container } = render(
			<VsCodeApiProvider>
				<PupilEditor visible={false} />
			</VsCodeApiProvider>
		)
		expect(container.firstChild).toHaveClass('hidden')
	})

	it('should be visible when visible is true', () => {
		const { container } = render(
			<VsCodeApiProvider>
				<PupilEditor visible={true} />
			</VsCodeApiProvider>
		)
		expect(container.firstChild).not.toHaveClass('hidden')
	})
})
