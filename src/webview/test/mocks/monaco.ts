import { vi } from 'vitest'
import * as React from 'react'

vi.mock('@monaco-editor/react', () => {
	const monacoMock = {
		editor: {
			create: vi.fn(),
			createModel: vi.fn(),
			defineTheme: vi.fn(),
			setTheme: vi.fn(),
			IStandaloneCodeEditor: vi.fn(),
			EditorOption: {
				readOnly: 1,
				fontSize: 2
			},
			addCommand: vi.fn(),
			addKeybindingRule: vi.fn(),
			addAction: vi.fn(),
			setModelLanguage: vi.fn()
		}
	}

	type EditorProps = {
		value?: string
		theme?: string
		language?: string
	}

	const MockEditor = ({ value, theme, language }: EditorProps) => {
		return React.createElement('div', {
			'data-testid': 'mock-editor',
			'data-value': value,
			'data-theme': theme,
			'data-language': language
		})
	}

	return {
		useMonaco: vi.fn().mockReturnValue(monacoMock),
		Editor: MockEditor,
		loader: {
			init: vi.fn()
		}
	}
})

export {}
