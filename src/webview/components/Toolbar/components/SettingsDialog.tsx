import PupilDialog from '@webview/components/PupilDialog/PupilDialog.js'
import {
	Button,
	Box,
	Switch,
	FormControlLabel,
	Slider,
	Typography,
	FormControl,
	FormLabel,
	RadioGroup,
	Radio
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { ConnectionStatusType } from '../../../../constants.js'
import { HighlightMode } from '@webview/types/HighlightSettings.js'

type SettingsDialogProps = {
	open: boolean
	onClose: () => void
	onStartServer: () => void
	onStopServer: () => void
	connectionStatus: ConnectionStatusType
	radialEnabled: boolean
	onToggleRadial: () => void
	highlightDelayMs: number
	onHighlightDelayChange: (value: number) => void
	sectionGuideMode: HighlightMode
	onSectionGuideModeChange: (mode: HighlightMode) => void
}

const SettingsDialog = ({
	open,
	onClose,
	onStartServer,
	onStopServer,
	connectionStatus,
	radialEnabled,
	onToggleRadial,
	highlightDelayMs,
	onHighlightDelayChange,
	sectionGuideMode,
	onSectionGuideModeChange
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
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
					<FormControlLabel
						control={<Switch checked={radialEnabled} onChange={onToggleRadial} color="primary" />}
						label="Activar Teclado Radial"
					/>
					<FormControl component="fieldset">
						<FormLabel component="legend">Velocidad de iluminación</FormLabel>
						<Slider
							data-testid="highlight-speed-slider"
							min={200}
							max={1500}
							step={50}
							value={highlightDelayMs}
							valueLabelDisplay="auto"
							onChange={(_, value) =>
								onHighlightDelayChange(Array.isArray(value) ? value[0] : value)
							}
						/>
						<Typography variant="caption" color="text.secondary">
							Intervalo actual: {highlightDelayMs} ms (pausa {Math.round(highlightDelayMs * 0.25)}{' '}
							ms)
						</Typography>
					</FormControl>
					<FormControl component="fieldset">
						<FormLabel component="legend">Secciones que se iluminan</FormLabel>
						<RadioGroup
							row
							value={sectionGuideMode}
							onChange={(event) => onSectionGuideModeChange(event.target.value as HighlightMode)}
						>
							<FormControlLabel value="toolbar" control={<Radio />} label="Toolbar" />
							<FormControlLabel value="keyboard" control={<Radio />} label="Teclado" />
							<FormControlLabel value="both" control={<Radio />} label="Ambas" />
						</RadioGroup>
					</FormControl>
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
