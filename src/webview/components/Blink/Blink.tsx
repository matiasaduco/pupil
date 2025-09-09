import blink from '@webview/lib/blink.js'
import { useRef, useState } from 'react'
import { Button, Typography, Box, Card, CardContent, Chip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import StraightIcon from '@mui/icons-material/Straight'

const Blink = () => {
	const videoRef = useRef(null)
	const [blinkCount, setBlinkCount] = useState(0)
	const [detecting, setDetecting] = useState(false)
	const detectingRef = useRef(false)
	const [direction, setDirection] = useState('Centro')

	const startBlinkDetection = async () => {
		setDetecting(true)
		detectingRef.current = true
		if (videoRef.current) {
			await blink.loadModel()
			await blink.setUpCamera(videoRef.current)
			let blinkCounter = 0
			let prevBlink = false
			const detectLoop = async () => {
				const event = await blink.getBlinkPrediction()
				if (event) {
					if (!prevBlink && event.blink) {
						blinkCounter++
						setBlinkCount(blinkCounter)
					}
					prevBlink = event.blink
					if (event.left) {
						setDirection('Izquierda')
					} else if (event.right) {
						setDirection('Derecha')
					}
				}
				if (detectingRef.current) {
					requestAnimationFrame(detectLoop)
				}
			}
			detectLoop()
		}
	}
	const stopBlinkDetection = () => {
		setDetecting(false)
		detectingRef.current = false
		if (blink && blink.stopPrediction) {
			blink.stopPrediction()
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
			<Card sx={{ maxWidth: 400 }}>
				<CardContent
					sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
				>
					<video
						ref={videoRef}
						width={320}
						height={240}
						autoPlay
						style={{ borderRadius: 8, display: detecting ? 'block' : 'none' }}
					/>
					{!detecting && (
						<Box
							sx={{
								width: 320,
								height: 240,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: 'grey.200',
								borderRadius: 2
							}}
						>
							<VisibilityIcon sx={{ fontSize: 48, color: 'grey.500' }} />
							<Typography variant="body2" color="text.secondary">
								Cámara inactiva
							</Typography>
						</Box>
					)}
				</CardContent>
			</Card>

			<Box sx={{ display: 'flex', gap: 2 }}>
				<Button
					variant="contained"
					color="success"
					startIcon={<PlayArrowIcon />}
					onClick={startBlinkDetection}
					disabled={detecting}
				>
					{detecting ? 'Detectando...' : 'Iniciar Detección'}
				</Button>
				{detecting && (
					<Button
						variant="contained"
						color="error"
						startIcon={<StopIcon />}
						onClick={stopBlinkDetection}
					>
						Detener
					</Button>
				)}
			</Box>

			<Card sx={{ width: '100%', maxWidth: 400 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Estadísticas
					</Typography>
					<Box
						sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
					>
						<Typography variant="body1">Parpadeos detectados:</Typography>
						<Chip label={blinkCount} color="primary" />
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography variant="body1">Dirección de mirada:</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{direction === 'Izquierda' && <ArrowLeftIcon color="primary" />}
							{direction === 'Derecha' && <ArrowRightIcon color="primary" />}
							{direction === 'Centro' && <StraightIcon color="primary" />}
							<Chip label={direction} color="secondary" />
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Box>
	)
}

export default Blink
