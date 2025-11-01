import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import * as React from 'react'
import usePupilContainer from '@components/PupilContainer/hooks/usePupilContainer.js'
import PupilContainer from '@components/PupilContainer/PupilContainer.js'
import { VsCodeApiProvider } from '@webview/contexts/VsCodeApiContext.js'
import { KeyboardFocusProvider } from '@webview/contexts/KeyboardFocusContext.js'
import { ConnectionStatus } from '../../../../constants.js'
import '@testing-library/jest-dom'

const mockPostMessage = vi.fn()
const mockVsCodeApi = {
	postMessage: mockPostMessage,
	getState: () => ({}),
	setState: vi.fn()
}

vi.mock('@webview/mocks/MockVsCodeApi.js', () => ({
	default: () => mockVsCodeApi
}))

vi.mock('@monaco-editor/react', () => ({
	default: () => <div>Mock Editor</div>,
	useMonaco: () => ({
		editor: {},
		languages: {}
	})
}))

vi.mock('@components/PupilEditor/PupilEditor.js', () => ({
	default: () => <div data-testid="pupil-editor">Mock Pupil Editor</div>
}))

vi.mock('@components/PupilKeyboard/PupilKeyboard.js', () => ({
	default: () => <div data-testid="pupil-keyboard">Mock Pupil Keyboard</div>
}))

vi.mock('@components/RadialKeyboard/RadialKeyboard.js', () => ({
	default: () => <div data-testid="radial-keyboard">Mock Radial Keyboard</div>
}))

vi.mock('@components/Toolbar/Toolbar.js', () => ({
	default: () => <div data-testid="toolbar">Mock Toolbar</div>
}))

vi.mock('@components/Toolbar/components/SimpleBrowserDialog.js', () => ({
	default: () => <div data-testid="simple-browser-dialog">Mock Simple Browser Dialog</div>
}))

vi.mock('@components/Toolbar/components/CreateFileFolderDialog.js', () => ({
	default: () => <div data-testid="create-file-folder-dialog">Mock Create File Folder Dialog</div>
}))

vi.mock('@components/Toolbar/components/TranscriptDialog/TranscriptDialog.js', () => ({
	default: () => <div data-testid="transcript-dialog">Mock Transcript Dialog</div>
}))

vi.mock('@components/Toolbar/components/SettingsDialog.js', () => ({
	default: () => <div data-testid="settings-dialog">Mock Settings Dialog</div>
}))

describe('PupilContainer Integration Tests', () => {
	beforeEach(() => {
		mockPostMessage.mockClear()
	})

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<VsCodeApiProvider>
			<KeyboardFocusProvider>{children}</KeyboardFocusProvider>
		</VsCodeApiProvider>
	)

	it('should initialize with correct default state', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.keyboardVisible).toBe(true)
		expect(result.current.focus).toBe('editor')
		expect(result.current.colorScheme).toBe('vs-dark')
	})

	it('should toggle keyboard visibility', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.keyboardVisible).toBe(true)

		act(() => {
			result.current.toggleKeyboard()
		})

		expect(result.current.keyboardVisible).toBe(false)

		act(() => {
			result.current.toggleKeyboard()
		})

		expect(result.current.keyboardVisible).toBe(true)
	})

	it('should switch focus between editor and terminal', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.focus).toBe('editor')

		act(() => {
			result.current.switchFocus('editor')
		})

		expect(result.current.focus).toBe('terminal')
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-open' })

		mockPostMessage.mockClear()

		act(() => {
			result.current.switchFocus('terminal')
		})

		expect(result.current.focus).toBe('editor')
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-hide' })
	})

	it('should handle keyboard input for editor', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.handleKeyboardInput('a')
		})

		act(() => {
			result.current.handleKeyboardInput('{save}')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'save-file' })
	})

	it('should handle keyboard input for terminal', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.switchFocus('editor')
		})

		mockPostMessage.mockClear()

		act(() => {
			result.current.handleKeyboardInput('ls')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-input', content: 'ls' })

		act(() => {
			result.current.handleKeyboardInput('{enter}')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-enter' })
	})

	it('should handle theme changes from backend', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.colorScheme).toBe('vs-dark')

		act(() => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'set-theme',
						theme: 'vs'
					}
				})
			)
		})

		expect(result.current.colorScheme).toBe('vs')
	})

	it('should handle focus changes from backend', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.focus).toBe('editor')

		act(() => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'set-focus',
						focus: 'terminal'
					}
				})
			)
		})

		expect(result.current.focus).toBe('terminal')
	})

	it('should handle connection status updates from backend', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.connectionStatus.value).toBe('disconnected')

		act(() => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'connection-status',
						status: ConnectionStatus.CONNECTED
					}
				})
			)
		})

		expect(result.current.connectionStatus.value).toBe('connected')
	})

	it('should send create terminal message', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.handleKeyboardInput('{create-terminal}')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-create' })
		expect(result.current.focus).toBe('terminal')
	})

	it('should send open terminal message', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.handleKeyboardInput('{open-terminal}')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-open' })
		expect(result.current.focus).toBe('terminal')
	})

	it('should handle openSimpleBrowser correctly', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.openSimpleBrowser('http://localhost', '3000')
		})

		expect(mockPostMessage).toHaveBeenCalledWith({
			type: 'openSimpleBrowser',
			url: 'http://localhost:3000'
		})
	})

	it('should handle server start/stop commands', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.handleStartServer()
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'start-speech-server' })

		mockPostMessage.mockClear()

		act(() => {
			result.current.handleStopServer()
		})

		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'stop-speech-server' })
	})

	it('should switch color scheme', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		expect(result.current.colorScheme).toBe('vs-dark')

		act(() => {
			result.current.switchColorScheme()
		})

		expect(result.current.colorScheme).toBe('vs')

		act(() => {
			result.current.switchColorScheme()
		})

		expect(result.current.colorScheme).toBe('vs-dark')
	})

	it('should handle terminal commands correctly when in terminal mode', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.switchFocus('editor')
		})

		mockPostMessage.mockClear()

		act(() => {
			result.current.handleKeyboardInput('{cls}')
		})
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-clear' })

		act(() => {
			result.current.handleKeyboardInput('{stop-process}')
		})
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'stop-process' })

		act(() => {
			result.current.handleKeyboardInput('{paste}')
		})
		expect(mockPostMessage).toHaveBeenCalledWith({ type: 'terminal-paste' })
	})

	it('should maintain state consistency across multiple operations', () => {
		const { result } = renderHook(() => usePupilContainer(), { wrapper })

		act(() => {
			result.current.toggleKeyboard()
		})
		expect(result.current.keyboardVisible).toBe(false)

		act(() => {
			result.current.switchFocus('editor')
		})
		expect(result.current.focus).toBe('terminal')

		expect(result.current.keyboardVisible).toBe(false)

		act(() => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: { type: 'set-theme', theme: 'vs' }
				})
			)
		})

		expect(result.current.colorScheme).toBe('vs')
		expect(result.current.focus).toBe('terminal')
		expect(result.current.keyboardVisible).toBe(false)
	})
})

describe('PupilContainer Component Tests', () => {
	beforeEach(() => {
		mockPostMessage.mockClear()
		Object.defineProperty(window, 'location', {
			writable: true,
			value: { hostname: 'vscode-webview' }
		})
	})

	const renderComponent = () => {
		return render(
			<VsCodeApiProvider>
				<KeyboardFocusProvider>
					<PupilContainer />
				</KeyboardFocusProvider>
			</VsCodeApiProvider>
		)
	}

	it('should render PupilContainer with all child components', () => {
		const { getByTestId } = renderComponent()

		expect(getByTestId('pupil-editor')).toBeInTheDocument()
		expect(getByTestId('pupil-keyboard')).toBeInTheDocument()
		expect(getByTestId('radial-keyboard')).toBeInTheDocument()
		expect(getByTestId('toolbar')).toBeInTheDocument()
	})

	it('should render dialog components', () => {
		const { getByTestId } = renderComponent()

		expect(getByTestId('simple-browser-dialog')).toBeInTheDocument()
		expect(getByTestId('create-file-folder-dialog')).toBeInTheDocument()
		expect(getByTestId('transcript-dialog')).toBeInTheDocument()
		expect(getByTestId('settings-dialog')).toBeInTheDocument()
	})

	it('should apply dark theme class by default', () => {
		renderComponent()

		expect(document.documentElement.classList.contains('dark')).toBe(true)
	})

	it('should switch to light theme when colorScheme changes to vs', () => {
		renderComponent()

		expect(document.documentElement.classList.contains('dark')).toBe(true)

		act(() => {
			window.dispatchEvent(
				new MessageEvent('message', {
					data: {
						type: 'set-theme',
						theme: 'vs'
					}
				})
			)
		})

		expect(document.documentElement.classList.contains('dark')).toBe(false)
	})
})
