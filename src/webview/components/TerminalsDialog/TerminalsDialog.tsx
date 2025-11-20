import Button from '@mui/material/Button'
import { ReactNode } from 'react'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import useActionBar from './hooks/useActionBar.js'
import HighlightableButton from '../Toolbar/components/HighlightableButton.js'

type TerminalsDialogProps = {
	id: string
	highlightedButtonId: string | null
	triggerIcon?: ReactNode
	triggerTooltip?: string
	triggerLabel?: string
}

const TerminalsDialog = ({
	id,
	highlightedButtonId,
	triggerIcon,
	triggerTooltip,
	triggerLabel = 'Terminales'
}: TerminalsDialogProps) => {
	const { getTerminals, terminals, open, handleOnClose, openTerminal } = useActionBar()

	return (
		<>
			<HighlightableButton
				id={id}
				highlightedButtonId={highlightedButtonId}
				onClick={getTerminals}
				label={triggerLabel}
				icon={triggerIcon}
				tooltipTitle={triggerTooltip ?? triggerLabel}
			/>
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
