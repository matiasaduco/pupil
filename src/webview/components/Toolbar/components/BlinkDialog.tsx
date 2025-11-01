import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'
import Blink from '@webview/components/Blink/Blink.js'

type BlinkDialogProps = {
	open: boolean
	onClose: () => void
}

const BlinkDialog = ({
	open,
	onClose
}: BlinkDialogProps) => {
	return (
		<PupilDialog open={open} onClose={onClose} title="Eye Tracking">
			<div className="blink-dialog-content" style={{ minWidth: '500px', minHeight: '600px' }}>
				<Blink />
			</div>
		</PupilDialog>
	)
}

export default BlinkDialog