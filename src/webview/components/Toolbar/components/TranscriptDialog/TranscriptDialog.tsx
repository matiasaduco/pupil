import './TranscriptDialog.css'
import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'
import MicrophoneIcon from '@mui/icons-material/Mic'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import SendIcon from '@mui/icons-material/Send'
import { IconButton } from '@mui/material'
import useTranscriptDialog from './hooks/useTranscriptDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'

type TranscriptDialogProps = {
	isOpen: boolean
	editorRef: React.RefObject<PupilEditorHandle | null>
	onClose: () => void
}

const TranscriptDialog = ({ isOpen, editorRef, onClose }: TranscriptDialogProps) => {
	const { handleSpeechToText, listening, handleOnClose, handleOnSubmit, transcriptWithBreaks } =
		useTranscriptDialog({ editorRef, onClose })

	const ActionButton = () => (
		<IconButton onClick={handleSpeechToText}>
			{listening ? (
				<StopCircleIcon color="error" onClick={handleSpeechToText} />
			) : (
				<MicrophoneIcon onClick={handleSpeechToText} />
			)}
		</IconButton>
	)

	return (
		<PupilDialog
			open={isOpen}
			onSubmitIcon={<SendIcon />}
			onClose={handleOnClose}
			onSubmit={handleOnSubmit}
			extraAction={<ActionButton />}
		>
			<div className="transcript-box">
				<span className="transcript-text">
					{transcriptWithBreaks || 'No transcript available.'}
				</span>
			</div>
		</PupilDialog>
	)
}

export default TranscriptDialog
