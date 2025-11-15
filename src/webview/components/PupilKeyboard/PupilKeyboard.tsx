import { Button } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
	highlightingEnabled?: boolean
	highlightDelayMs?: number
	highlightGapMs?: number
	sectionHighlighting?: boolean
	'data-testid'?: string
}

const DEFAULT_HIGHLIGHT_DELAY_MS = 700
const DEFAULT_HIGHLIGHT_GAP_MS = 150

const PupilKeyboard = ({
	onInput,
	visible,
	highlightingEnabled,
	highlightDelayMs,
	highlightGapMs,
	sectionHighlighting,
	'data-testid': testId
}: PupilKeyboardProps) => {
	const { layout, handleKeyPress, clickedKey } = usePupilKeyboard(onInput)
	const { activeInput } = useKeyboardFocus()
	const [highlightedKeyIndex, setHighlightedKeyIndex] = useState<number | null>(null)
	const highlightLoopRef = useRef(false)

	useEffect(() => {
		if (!highlightingEnabled || !visible) {
			highlightLoopRef.current = false
			setHighlightedKeyIndex(null)
			return
		}

		highlightLoopRef.current = true
		let cancelled = false
		let index = 0
		const delay = highlightDelayMs ?? DEFAULT_HIGHLIGHT_DELAY_MS
		const gap = highlightGapMs ?? DEFAULT_HIGHLIGHT_GAP_MS

		const run = async () => {
			while (!cancelled && highlightLoopRef.current && layout.length > 0) {
				setHighlightedKeyIndex(index)
				await new Promise((res) => setTimeout(res, delay))
				if (!highlightLoopRef.current || cancelled) {
					break
				}
				setHighlightedKeyIndex(null)
				await new Promise((res) => setTimeout(res, gap))
				index = (index + 1) % layout.length
			}
			if (cancelled || !highlightLoopRef.current) {
				setHighlightedKeyIndex(null)
			}
		}

		run()

		return () => {
			cancelled = true
			highlightLoopRef.current = false
			setHighlightedKeyIndex(null)
		}
	}, [highlightingEnabled, layout, visible, highlightDelayMs, highlightGapMs])

	useEffect(() => {
		if (!highlightingEnabled || highlightedKeyIndex === null || !visible) {
			return
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== ' ' && event.key !== 'Spacebar' && event.code !== 'Space') {
				return
			}
			if (activeInput && activeInput.current) {
				return
			}
			const key = layout[highlightedKeyIndex]
			if (!key) {
				return
			}
			event.preventDefault()
			handleKeyPress(key)
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [highlightingEnabled, highlightedKeyIndex, layout, handleKeyPress, activeInput, visible])

	if (!visible) {
		return null
	}

	return (
		<div
			className={clsx('grid grid-cols-30 gap-1 bg-gray-400 rounded p-2', {
				'pupil-keyboard--section-highlighted': sectionHighlighting
			})}
			style={{ height: 'min(30vh, 220px)' }}
			data-testid={testId}
		>
			{layout.map((key, index) => (
				<Button
					key={`${key.value}-${index}`}
					onClick={() => handleKeyPress(key)}
					className={clsx('pupil-keyboard-btn border-2 border-transparent', {
						'border-amber-500!': key.value === clickedKey,
						'pupil-keyboard-btn--highlighted': highlightedKeyIndex === index
					})}
					sx={{
						gridColumn: `span ${key.col || 2} / span ${key.col || 2}`,
						textTransform: 'unset'
					}}
				>
					{key.icon ? <key.icon /> : key.label || key.value}
				</Button>
			))}
		</div>
	)
}

export default PupilKeyboard
