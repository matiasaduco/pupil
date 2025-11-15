import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import { useCallback, useEffect, useRef, useState } from 'react'

const useTypeWithBlink = (highlightDelayMs: number = 1000, highlightGapMs: number = 500) => {
	const buttonIdCounterRef = useRef<number>(0)
	const buttonIdsRef = useRef<string[]>([])
	const [highlightedButtonId, setHighlightedButtonId] = useState<string | null>(null)
	const [isHighlighting, setIsHighlighting] = useState<boolean>(false)
	const highlightingRef = useRef<boolean>(false)

	const { activeInput } = useKeyboardFocus()

	// reset counters/ids on each render and collect ids in DOM order
	buttonIdCounterRef.current = 0
	buttonIdsRef.current = []
	const sanitize = (value?: string) => {
		if (!value) {
			return ''
		}

		return value
			.toString()
			.replace(/[{}]/g, '')
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	const nextButtonId = (base?: string) => {
		const semantic = sanitize(base)
		const id = semantic
			? `toolbar-button-${semantic}`
			: `toolbar-button-${++buttonIdCounterRef.current}`
		buttonIdsRef.current.push(id)
		return id
	}

	// map of button ids -> handler functions. We call these handlers directly when space is pressed.
	const buttonHandlersRef = useRef<Map<string, () => void>>(new Map())

	const registerButton = (id: string, handler: () => void) => {
		buttonHandlersRef.current.set(id, handler)
		return () => buttonHandlersRef.current.delete(id)
	}

	const startHighlightLoop = useCallback(async (delayMs: number, gapMs: number) => {
		let i = 0
		while (highlightingRef.current && buttonIdsRef.current.length > 0) {
			const btnId = buttonIdsRef.current[i % buttonIdsRef.current.length]
			setHighlightedButtonId(btnId)
			await new Promise((res) => setTimeout(res, delayMs))
			if (!highlightingRef.current) {
				break
			}
			setHighlightedButtonId(null)
			await new Promise((res) => setTimeout(res, gapMs))
			i = (i + 1) % buttonIdsRef.current.length
		}
		// ensure state cleanup
		highlightingRef.current = false
		setIsHighlighting(false)
		setHighlightedButtonId(null)
	}, [])

	const toggleHighlightSequence = useCallback(() => {
		// Toggle highlight sequence
		if (highlightingRef.current) {
			highlightingRef.current = false
			setIsHighlighting(false)
			setHighlightedButtonId(null)
			return
		}

		highlightingRef.current = true
		setIsHighlighting(true)

		const delayMs = highlightDelayMs ?? 700
		const gapMs = highlightGapMs ?? 150

		startHighlightLoop(delayMs, gapMs)
	}, [highlightDelayMs, highlightGapMs, startHighlightLoop])

	// Trigger the highlighted button on Space key press when guide is active
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== ' ' && e.key !== 'Spacebar' && e.code !== 'Space') {
				return
			}
			// If there's an active native input we shouldn't trigger the toolbar
			if (activeInput && activeInput.current) {
				return
			}
			// Only trigger when highlighting is running
			if (!highlightingRef.current) {
				return
			}
			if (!highlightedButtonId) {
				return
			}
			e.preventDefault()
			e.stopPropagation()
			const handler = buttonHandlersRef.current.get(highlightedButtonId!)
			if (handler) {
				handler()
				return
			}
			const el = document.getElementById(highlightedButtonId) as HTMLElement | null
			el?.click()
		}

		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	}, [highlightedButtonId, activeInput])

	return {
		highlightedButtonId,
		isHighlighting,
		nextButtonId,
		toggleHighlightSequence,
		registerButton
	}
}

export default useTypeWithBlink
