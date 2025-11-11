import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useState, useEffect } from 'react'
import useSpeechRecognition from './useSpeechRecognition.js'

type TranscriptDialogProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onClose: () => void
}

const useTranscriptDialog = ({ editorRef, onClose }: TranscriptDialogProps) => {
	const { transcript, listening, resetTranscript, startListening, stopListening } =
		useSpeechRecognition()
	const [commentTranscription, setCommmentTranscription] = useState<boolean>(true)
	const [editableTranscript, setEditableTranscript] = useState<string>('')

	const insertLineBreaks = (text: string, maxLen: number = 50) => {
		if (!text) {
			return ''
		}

		const words = text.split(' ')
		let result = ''
		let line = ''

		for (const word of words) {
			if ((line + (line ? ' ' : '') + word).length > maxLen) {
				result += (result ? '\n' : '') + line
				line = word
			} else {
				line += (line ? ' ' : '') + word
			}
		}

		if (line) {
			result += (result ? '\n' : '') + line
		}

		return result
	}

	const transcriptWithBreaks = insertLineBreaks(transcript, 50)

	useEffect(() => {
		setEditableTranscript(transcriptWithBreaks)
	}, [transcriptWithBreaks])

	const handleSpeechToText = () => {
		if (listening) {
			stopListening()
		} else {
			startListening({ continuous: true })
		}
	}

	const handleOnSubmit = () => {
		if (listening) {
			stopListening()
		}
		onSubmit(editableTranscript)
		resetTranscript()
		setEditableTranscript('')
		onClose()
	}

	const onSubmit = (transcript: string) => {
		const text = transcript.split('\n')

		if (commentTranscription) {
			editorRef.current?.insertCommentBlockAtCursor(text)
		} else {
			editorRef.current?.insertMultipleAtCursor(text)
		}
	}

	const handleOnClose = () => {
		if (listening) {
			stopListening()
		}
		resetTranscript()
		setEditableTranscript('')
		onClose()
	}

	return {
		listening,
		resetTranscript,
		transcriptWithBreaks,
		handleSpeechToText,
		handleOnSubmit,
		handleOnClose,
		commentTranscription,
		setCommmentTranscription,
		editableTranscript,
		setEditableTranscript
	}
}

export default useTranscriptDialog
