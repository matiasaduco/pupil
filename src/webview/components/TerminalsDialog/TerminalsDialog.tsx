import Button from '@mui/material/Button'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import useActionBar from './hooks/useActionBar.js'

const TerminalsDialog = () => {
	const { getTerminals, terminals, open, handleOnClose, openTerminal } = useActionBar()

	return (
		<>
			<Button onClick={getTerminals}>Terminales</Button>
			<PupilDialog open={open} onClose={handleOnClose} title="Terminales abiertas">
				<div className="flex flex-col max-h-96 overflow-y-auto">
					{terminals.map((terminal, index) => (
						<Button
							key={`${terminal.name}-${terminal.processId}-${index}`}
							className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
							onClick={() => openTerminal(terminal.processId)}
						>
							{terminal.name}
						</Button>
					))}
				</div>
			</PupilDialog>
		</>
	)
}

export default TerminalsDialog
