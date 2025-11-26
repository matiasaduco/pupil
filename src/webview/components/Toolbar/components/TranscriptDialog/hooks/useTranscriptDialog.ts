import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useState, useEffect, useRef, useLayoutEffect } from 'react'
import useSpeechRecognition from './useSpeechRecognition.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'

type TranscriptDialogProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onClose: () => void
	isOpen: boolean
}

const useTranscriptDialog = ({ editorRef, onClose, isOpen }: TranscriptDialogProps) => {
	const { transcript, listening, resetTranscript, startListening, stopListening } =
		useSpeechRecognition()
	const [commentTranscription, setCommmentTranscription] = useState<boolean>(true)
	const [editableTranscript, setEditableTranscript] = useState<string>('')
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const { setActiveInput } = useKeyboardFocus()
	const shouldMaintainFocusRef = useRef(false)
	const cursorPositionRef = useRef<number | null>(null)

	useLayoutEffect(() => {
		if (shouldMaintainFocusRef.current && textareaRef.current) {
			const cursorPos = cursorPositionRef.current
			textareaRef.current.focus()
			if (cursorPos !== null) {
				textareaRef.current.setSelectionRange(cursorPos, cursorPos)
			}
			shouldMaintainFocusRef.current = false
			cursorPositionRef.current = null
		}
	}, [editableTranscript])

	useEffect(() => {
		if (!isOpen) {
			setActiveInput(null)
		}
	}, [isOpen, setActiveInput])

	// Previously we inserted artificial line breaks to fit a TextField width.
	// Instead, keep the raw transcript and let the editor handle wrapping when
	// inserting. This avoids duplicate or incorrect line breaks.
	useEffect(() => {
		setEditableTranscript(transcript)
	}, [transcript])

	const handleSpeechToText = () => {
		if (listening) {
			stopListening()
		} else {
			startListening({ continuous: true })
		}
	}

	const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
		const nativeInput = e.target as HTMLTextAreaElement
		textareaRef.current = nativeInput
		setActiveInput(nativeInput)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const input = e.target as HTMLTextAreaElement
		const cursorPos = input.selectionStart
		textareaRef.current = input
		setActiveInput(input)
		setEditableTranscript(e.target.value)
		cursorPositionRef.current = cursorPos
		shouldMaintainFocusRef.current = true
	}

	const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
		const input = e.target as HTMLTextAreaElement
		const cursorPos = input.selectionStart
		textareaRef.current = input
		setEditableTranscript(input.value)
		cursorPositionRef.current = cursorPos
		shouldMaintainFocusRef.current = true
	}

	const handleOnSubmit = () => {
		if (listening) {
			stopListening()
		}
		onSubmit(editableTranscript)
		resetTranscript()
		setEditableTranscript('')
		setActiveInput(null)
		onClose()
	}

	const onSubmit = (transcript: string) => {
		// If the transcript already contains newline characters, keep them as
		// logical breaks. Otherwise, when the user expects the dialog wrapping
		// to be preserved (for comment blocks we usually want line arrays),
		// compute a measured wrapping based on the textarea's rendered width and
		// the computed font.
		const hasNewlines = transcript.includes('\n')

		const measureAndWrap = (text: string, maxWidth: number) => {
			// Create a canvas context for measureText
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')
			if (!ctx) {
				return [text]
			}

			// Try to obtain computed font from the textarea element
			const font = textareaRef?.current
				? getComputedStyle(textareaRef.current).font
				: '14px monospace'
			ctx.font = font

			const words = text.split(/(\s+)/) // keep spaces so we can measure
			const lines: string[] = []
			let current = ''
			for (const token of words) {
				const trial = current + token
				const width = ctx.measureText(trial).width
				if (width > maxWidth && current.length > 0) {
					lines.push(current.trimEnd())
					// start new line with token (trim leading spaces)
					current = token.replace(/^\s+/, '')
				} else {
					current = trial
				}
			}
			if (current.length > 0) {
				lines.push(current.trimEnd())
			}
			return lines
		}

		if (commentTranscription) {
			const textLines = hasNewlines
				? transcript.split('\n')
				: // if we have a textareaRef, measure and wrap to match visual layout
					textareaRef?.current
					? measureAndWrap(transcript, textareaRef.current.clientWidth)
					: [transcript]
			editorRef.current?.insertCommentBlockAtCursor(textLines)
		} else {
			if (hasNewlines) {
				editorRef.current?.insertMultipleAtCursor(transcript.split('\n'))
			} else if (textareaRef?.current) {
				// keep visual wrap by inserting as multiple lines based on measured
				// width so the pasted content resembles what the user saw in the dialog
				const lines = measureAndWrap(transcript, textareaRef.current.clientWidth)
				// If only one line, insert normally; otherwise insert multiple lines
				if (lines.length === 1) {
					editorRef.current?.insertAtCursor(lines[0])
				} else {
					editorRef.current?.insertMultipleAtCursor(lines)
				}
			} else {
				// Fallback: insert raw text and let editor wrap
				editorRef.current?.insertAtCursor(transcript)
			}
		}
	}

	const handleOnClose = () => {
		if (listening) {
			stopListening()
		}
		resetTranscript()
		setEditableTranscript('')
		setActiveInput(null)
		onClose()
	}

	return {
		listening,
		resetTranscript,
		handleSpeechToText,
		handleOnSubmit,
		handleOnClose,
		commentTranscription,
		setCommmentTranscription,
		editableTranscript,
		setEditableTranscript,
		textareaRef,
		handleInputFocus,
		handleInputChange,
		handleInput
	}
}

export default useTranscriptDialog
