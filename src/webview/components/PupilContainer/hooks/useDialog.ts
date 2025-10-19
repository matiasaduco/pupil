import { useState } from 'react'

const useDialog = () => {
	const [openSimpleBrowserDialog, setOpenSimpleBrowserDialog] = useState(false)
	const [openFileFolderDialog, setOpenFileFolderDialog] = useState(false)
	const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false)
	const [openSettingsDialog, setOpenSettingsDialog] = useState(false)

	return {
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog,
		openSettingsDialog,
		setOpenSimpleBrowserDialog,
		setOpenFileFolderDialog,
		setOpenTranscriptDialog,
		setOpenSettingsDialog
	}
}

export default useDialog
