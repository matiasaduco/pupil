import { useState } from 'react'

const useDialog = () => {
	const [openSimpleBrowserDialog, setOpenSimpleBrowserDialog] = useState(false)
	const [openFileFolderDialog, setOpenFileFolderDialog] = useState(false)
	const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false)
	const [openSettingsDialog, setOpenSettingsDialog] = useState(false)
	const [openBlinkDialog, setOpenBlinkDialog] = useState(false)

	return {
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog,
		openSettingsDialog,
		openBlinkDialog,
		setOpenSimpleBrowserDialog,
		setOpenFileFolderDialog,
		setOpenTranscriptDialog,
		setOpenSettingsDialog,
		setOpenBlinkDialog
	}
}

export default useDialog
