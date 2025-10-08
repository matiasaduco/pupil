import React, { createContext, useContext, useRef, useCallback } from 'react'

type KeyboardFocusContextType = {
	activeInput: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>
	setActiveInput: (input: HTMLInputElement | HTMLTextAreaElement | null) => void
	insertIntoActiveInput: (text: string) => void
	deleteFromActiveInput: () => void
	setEditorRef: (el: HTMLElement | null) => void
}

const KeyboardFocusContext = createContext<KeyboardFocusContextType | null>(null)

export const KeyboardFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
	const editorRef = useRef<HTMLElement | null>(null)

	const setEditorRef = useCallback((el: HTMLElement | null) => {
		editorRef.current = el
	}, [])

	const setActiveInput = useCallback((input: HTMLInputElement | HTMLTextAreaElement | null) => {
		console.log('Setting active input:', input)
		activeInputRef.current = input

		if (!input && editorRef.current) {
			// restore editor focus
			editorRef.current.focus()
		}
	}, [])

	const insertIntoActiveInput = useCallback((text: string) => {
		const input = activeInputRef.current
		if (!input) {
			return
		}

		const start = input.selectionStart || 0
		const end = input.selectionEnd || 0
		const currentValue = input.value
		const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
		input.value = newValue

		const inputEvent = new Event('input', { bubbles: true })
		input.dispatchEvent(inputEvent)

		const newPosition = start + text.length
		input.setSelectionRange(newPosition, newPosition)
		input.focus()
	}, [])

	const deleteFromActiveInput = useCallback(() => {
		const input = activeInputRef.current
		if (!input) {
			return
		}

		const start = input.selectionStart || 0
		const end = input.selectionEnd || 0
		const currentValue = input.value

		let newValue: string
		let newPosition: number

		if (start !== end) {
			newValue = currentValue.substring(0, start) + currentValue.substring(end)
			newPosition = start
		} else if (start > 0) {
			newValue = currentValue.substring(0, start - 1) + currentValue.substring(start)
			newPosition = start - 1
		} else {
			return
		}

		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			'value'
		)?.set

		if (nativeInputValueSetter) {
			nativeInputValueSetter.call(input, newValue)
		} else {
			input.value = newValue
		}

		const inputEvent = new Event('input', { bubbles: true })
		input.dispatchEvent(inputEvent)

		input.setSelectionRange(newPosition, newPosition)
		input.focus()
	}, [])

	return (
		<KeyboardFocusContext.Provider
			value={{
				activeInput: activeInputRef,
				setActiveInput,
				insertIntoActiveInput,
				deleteFromActiveInput,
				setEditorRef
			}}
		>
			{children}
		</KeyboardFocusContext.Provider>
	)
}

export const useKeyboardFocus = () => {
	const context = useContext(KeyboardFocusContext)
	if (!context) {
		throw new Error(
			'useKeyboardFocus must be used within a KeyboardFocusProvider. Make sure KeyboardFocusProvider wraps your component tree.'
		)
	}
	return context
}
