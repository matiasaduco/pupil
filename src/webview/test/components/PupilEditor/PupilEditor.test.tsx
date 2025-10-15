import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import PupilEditor from '@components/PupilEditor/PupilEditor.js'
import type { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import '@testing-library/jest-dom'

// Mock MUI components
vi.mock('@mui/material', () => ({
	Skeleton: ({ width, height }: { width?: string; height?: string }) => (
		<div data-testid="skeleton" style={{ width, height }}>
			Mock Skeleton
		</div>
	)
}))

vi.mock('@monaco-editor/react', () => ({
	Editor: vi.fn(({ value, language, theme }) => (
		<div data-testid="mock-editor">
			<div>Monaco Editor Mock</div>
			<div>Language: {language}</div>
			<div>Theme: {theme}</div>
			<div>Value: {value}</div>
		</div>
	))
}))

describe('PupilEditor', () => {
	it('should render skeleton when initialValue is not provided', () => {
		render(<PupilEditor visible={true} />)
		expect(screen.getByTestId('skeleton')).toBeInTheDocument()
	})

	it('should render editor with a ref', () => {
		const ref = React.createRef<PupilEditorHandle>()
		render(<PupilEditor ref={ref} visible={true} />)

		// Verify that the editor renders
		expect(screen.getByTestId('mock-editor')).toBeInTheDocument()

		// Verify that the ref has the expected methods
		expect(ref.current).toBeDefined()
		expect(ref.current?.getCursorPosition).toBeDefined()
		expect(ref.current?.insertAtCursor).toBeDefined()
		expect(ref.current?.focus).toBeDefined()
	})

	it('should handle theme changes', () => {
		render(<PupilEditor visible={true} theme="vs-dark" />)
		expect(screen.getByText('Theme: vs-dark')).toBeInTheDocument()
	})

	it('should be hidden when visible is false', () => {
		const { container } = render(<PupilEditor visible={false} />)
		expect(container.firstChild).toHaveClass('hidden')
	})

	it('should be visible when visible is true', () => {
		const { container } = render(<PupilEditor visible={true} />)
		expect(container.firstChild).not.toHaveClass('hidden')
	})
})
