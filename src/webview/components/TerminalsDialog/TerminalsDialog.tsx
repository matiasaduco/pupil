import { Button } from '@mui/material'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import useActionBar from './hooks/useActionBar.js'

const TerminalsDialog = () => {
	const { getTerminals, terminals, open, handleOnClose } = useActionBar()

	return (
		<>
			<Button onClick={getTerminals}>Terminales</Button>
			<PupilDialog open={open} onClose={handleOnClose} title="Terminales abiertas">
				{terminals.map((terminal, index) => (
					<div
						key={`${terminal}-${index}`}
						className="p-2 border-b last:border-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
					>
						{terminal.name}
					</div>
				))}
			</PupilDialog>
		</>
	)
}

export default TerminalsDialog
