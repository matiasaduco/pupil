import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useState } from 'react'
// @ts-expect-error no types available
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

type TranscriptDialogProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onClose: () => void
}

const useTranscriptDialog = ({ editorRef, onClose }: TranscriptDialogProps) => {
	const { transcript, listening, resetTranscript } = useSpeechRecognition()
	const [commentTranscription, setCommmentTranscription] = useState<boolean>(true)

	const insertLineBreaks = (text: string, maxLen: number = 50) => {
		if (!text) {
			return ''
		}

		const words = text.split(' ')
		let result = ''
		let line = ''

		for (let word of words) {
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

	let transcriptWithBreaks = insertLineBreaks(transcript, 50)

	const handleSpeechToText = () => {
		if (listening) {
			SpeechRecognition.stopListening()
		} else {
			SpeechRecognition.startListening({ continuous: true })
		}
	}

	const handleOnSubmit = () => {
		if (listening) {
			SpeechRecognition.stopListening()
		}
		onSubmit(transcriptWithBreaks)
		resetTranscript()
		transcriptWithBreaks = ''
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
			SpeechRecognition.stopListening()
		}
		resetTranscript()
		transcriptWithBreaks = ''
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
		setCommmentTranscription
	}
}

export default useTranscriptDialog
