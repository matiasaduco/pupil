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
import { useEffect, useMemo, useState } from 'react'
import {
	KeyMappings,
	KeyMappingId,
	KeyMappingValue,
	RadialMouseBinding
} from '@webview/types/KeyMapping.js'

const KEY_MAPPING_META: Array<{
	id: KeyMappingId
	action: string
	description: string
	type: 'keyboard' | 'mouse'
}> = [
	{
		id: 'highlightSequence',
		action: 'Confirmar botón resaltado',
		description:
			'Cuando el modo de resaltado está activo, esta tecla confirma la opción actualmente iluminada.',
		type: 'keyboard'
	},
	{
		id: 'radialToggle',
		action: 'Abrir teclado radial',
		description: 'Selecciona el botón del mouse que desplegará el menú radial.',
		type: 'mouse'
	}
]

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
	keyMappings: KeyMappings
	onKeyMappingChange: (id: KeyMappingId, value: KeyMappingValue) => void
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
	onSectionGuideModeChange,
	keyMappings,
	onKeyMappingChange
}: SettingsDialogProps) => {
	const isConnected = connectionStatus.value === 'connected'
	const isConnecting = connectionStatus.value === 'connecting'
	const [listeningFor, setListeningFor] = useState<KeyMappingId | null>(null)

	const listeningLabel = useMemo(() => {
		if (!listeningFor) {
			return null
		}
		const meta = KEY_MAPPING_META.find((item) => item.id === listeningFor)
		if (!meta) {
			return null
		}
		return meta.type === 'keyboard'
			? 'Presiona la tecla que quieras usar'
			: 'Haz clic con el botón del mouse que quieras usar'
	}, [listeningFor])

	const formatKeyboardLabel = (key: string, code: string) => {
		if (code === 'Space' || key === ' ') {
			return 'Barra espaciadora'
		}
		if (code.startsWith('Key')) {
			return code.replace('Key', '').toUpperCase()
		}
		if (code.startsWith('Digit')) {
			return code.replace('Digit', '')
		}
		if (key.length === 1) {
			return key.toUpperCase()
		}
		return key
	}

	const formatMouseLabel = (button: number) => {
		switch (button) {
			case 0:
				return 'Botón izquierdo del mouse'
			case 1:
				return 'Botón central del mouse'
			case 2:
				return 'Botón derecho del mouse'
			default:
				return `Botón ${button}`
		}
	}

	useEffect(() => {
		if (listeningFor !== 'highlightSequence') {
			return
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setListeningFor(null)
				return
			}
			event.preventDefault()
			onKeyMappingChange('highlightSequence', {
				key: event.key,
				code: event.code,
				label: formatKeyboardLabel(event.key, event.code)
			})
			setListeningFor(null)
		}

		window.addEventListener('keydown', handleKeyDown, true)
		return () => window.removeEventListener('keydown', handleKeyDown, true)
	}, [listeningFor, onKeyMappingChange])

	useEffect(() => {
		if (listeningFor !== 'radialToggle') {
			return
		}

		const handleMouseUp = (event: MouseEvent) => {
			event.preventDefault()
			onKeyMappingChange('radialToggle', {
				button: event.button,
				label: formatMouseLabel(event.button)
			} as RadialMouseBinding)
			setListeningFor(null)
		}

		window.addEventListener('mouseup', handleMouseUp, true)
		return () => window.removeEventListener('mouseup', handleMouseUp, true)
	}, [listeningFor, onKeyMappingChange])

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
					<Box
						component="section"
						aria-label="Mapeo de teclas"
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 2,
							p: 2,
							display: 'flex',
							flexDirection: 'column',
							gap: 1.5
						}}
					>
						<Typography variant="subtitle1">Mapeo de teclas</Typography>
						<Typography variant="body2" color="text.secondary">
							Personaliza los atajos principales para usar Pupil de la forma que te resulte más
							cómoda.
						</Typography>
						{listeningLabel && (
							<Typography variant="caption" color="primary" role="status">
								{listeningLabel}
							</Typography>
						)}
						<Box
							component="ul"
							sx={{
								listStyle: 'none',
								p: 0,
								m: 0,
								display: 'flex',
								flexDirection: 'column',
								gap: 1.5
							}}
						>
							{KEY_MAPPING_META.map((mapping) => {
								const currentValue = keyMappings[mapping.id]
								const isListening = listeningFor === mapping.id
								return (
									<Box
										component="li"
										key={mapping.id}
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											gap: 2,
											alignItems: 'flex-start'
										}}
									>
										<Box sx={{ flex: 1 }}>
											<Typography variant="subtitle2">{mapping.action}</Typography>
											<Typography variant="body2" color="text.secondary">
												{mapping.description}
											</Typography>
										</Box>
										<Button
											variant={isListening ? 'contained' : 'outlined'}
											color={isListening ? 'primary' : 'inherit'}
											size="small"
											onClick={() => setListeningFor(mapping.id)}
											aria-label={mapping.action}
											aria-pressed={isListening}
										>
											{isListening
												? mapping.type === 'keyboard'
													? 'Presiona una tecla'
													: 'Haz clic en un botón'
												: currentValue.label}
										</Button>
									</Box>
								)
							})}
						</Box>
					</Box>
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
