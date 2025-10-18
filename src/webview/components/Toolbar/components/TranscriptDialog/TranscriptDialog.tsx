import './TranscriptDialog.css'
import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'
import MicrophoneIcon from '@mui/icons-material/Mic'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import SendIcon from '@mui/icons-material/Send'
import { IconButton, Switch } from '@mui/material'
import useTranscriptDialog from './hooks/useTranscriptDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { ConnectionStatusType } from '../../../../../constants.js'

type TranscriptDialogProps = {
	isOpen: boolean
	editorRef: React.RefObject<PupilEditorHandle | null>
	onClose: () => void
	connectionStatus: ConnectionStatusType
}

const TranscriptDialog = ({
	isOpen,
	editorRef,
	onClose,
	connectionStatus
}: TranscriptDialogProps) => {
	const {
		handleSpeechToText,
		listening,
		handleOnClose,
		handleOnSubmit,
		transcriptWithBreaks,
		commentTranscription,
		setCommmentTranscription
	} = useTranscriptDialog({ editorRef, onClose })

	const ActionButton = () => (
		<>
			<IconButton onClick={handleSpeechToText}>
				{listening ? (
					<StopCircleIcon color="error" onClick={handleSpeechToText} />
				) : (
					<MicrophoneIcon onClick={handleSpeechToText} />
				)}
			</IconButton>
			<Switch
				onClick={() => setCommmentTranscription((prev) => !prev)}
				defaultChecked={commentTranscription}
			/>
			<span className="grow-1" />
			<span>Server:</span>
			<span className="ml-[5px]">{connectionStatus.icon}</span>
		</>
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
