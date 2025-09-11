import blink from '@webview/lib/blink.js'
import { useRef, useState } from 'react'

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
		<div style={{ marginBottom: 16, position: 'absolute', zIndex: 10 }}>
			<video
				ref={videoRef}
				width={320}
				height={240}
				autoPlay
				style={{ display: detecting ? 'block' : 'none' }}
			/>
			<button onClick={startBlinkDetection} disabled={detecting}>
				{detecting ? 'Detectando...' : 'Iniciar detección de parpadeos'}
			</button>
			{detecting && (
				<button onClick={stopBlinkDetection} style={{ marginLeft: 8 }}>
					Detener detección
				</button>
			)}
			<div>Parpadeos detectados: {blinkCount}</div>
			<div>{direction}</div>
		</div>
	)
}

export default Blink
