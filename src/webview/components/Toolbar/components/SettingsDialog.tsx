import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'
import { Button, Box } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { ConnectionStatusType } from '../../../../constants.js'

type SettingsDialogProps = {
	open: boolean
	onClose: () => void
	onStartServer: () => void
	onStopServer: () => void
	connectionStatus: ConnectionStatusType
}

const SettingsDialog = ({
	open,
	onClose,
	onStartServer,
	onStopServer,
	connectionStatus
}: SettingsDialogProps) => {
	const isConnected = connectionStatus.value === 'connected'
	const isConnecting = connectionStatus.value === 'connecting'

	return (
		<PupilDialog open={open} onClose={onClose} title="Configuración">
			<div className="settings-content">
				<p>Aquí puedes configurar las opciones de Pupil.</p>
				<p>
					Por ahora está disponible la opción de iniciar y detener el servidor de reconocimiento de
					voz.
				</p>
				<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
					<Button
						variant="contained"
						color="success"
						startIcon={<PlayArrowIcon />}
						onClick={onStartServer}
						disabled={isConnected || isConnecting}
					>
						Iniciar Servidor
					</Button>
					<Button
						variant="contained"
						color="error"
						startIcon={<StopIcon />}
						onClick={onStopServer}
						disabled={!isConnected}
					>
						Detener Servidor
					</Button>
				</Box>
			</div>
		</PupilDialog>
	)
}

export default SettingsDialog
