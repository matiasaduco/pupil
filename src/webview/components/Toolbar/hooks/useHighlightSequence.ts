import { HighlightKeyBinding } from '@webview/types/KeyMapping.js'
import { MutableRefObject, RefObject, useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DELAY = 700
const DEFAULT_GAP = 150

// Small promise helper used to pause highlight transitions
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type UseHighlightSequenceParams = {
	highlightDelayMs?: number
	highlightGapMs?: number
	highlightConfirmKey: HighlightKeyBinding
	buttonIdsRef: MutableRefObject<string[]>
	isMountedRef: MutableRefObject<boolean>
	activeInput: RefObject<HTMLElement | null> | null
}

type UseHighlightSequenceResult = {
	highlightedButtonId: string | null
	isHighlighting: boolean
	startHighlightSequence: () => void
	stopHighlightSequence: () => void
	ensureToolbarHighlighting: () => void
	matchesHighlightKey: (event: KeyboardEvent) => boolean
}

// Coordinates the automatic toolbar highlight cycle and related keyboard listeners
const useHighlightSequence = ({
	highlightDelayMs,
	highlightGapMs,
	highlightConfirmKey,
	buttonIdsRef,
	isMountedRef,
	activeInput
}: UseHighlightSequenceParams): UseHighlightSequenceResult => {
	const [highlightedButtonId, setHighlightedButtonId] = useState<string | null>(null)
	const [isHighlighting, setIsHighlighting] = useState(false)
	const highlightingRef = useRef(false)

	// Keeps highlighted button state in sync while guarding against unmounted updates
	const updateHighlightedButtonId = useCallback(
		(value: string | null) => {
			if (!isMountedRef.current) {
				return
			}
			setHighlightedButtonId(value)
		},
		[isMountedRef]
	)

	// Tracks whether the highlighting loop is currently running
	const updateIsHighlighting = useCallback(
		(value: boolean) => {
			if (!isMountedRef.current) {
				return
			}
			setIsHighlighting(value)
		},
		[isMountedRef]
	)

	// Checks if a keyboard event corresponds to the configured confirmation key
	const matchesHighlightKey = useCallback(
		(event: KeyboardEvent) => {
			const normalizedKey = highlightConfirmKey?.key?.toLowerCase()
			const normalizedCode = highlightConfirmKey?.code?.toLowerCase()
			return (
				(event.key?.toLowerCase?.() ?? '') === normalizedKey ||
				(event.code?.toLowerCase?.() ?? '') === normalizedCode
			)
		},
		[highlightConfirmKey]
	)

	// Iterates over collected button ids, toggling highlight states with configurable delays
	const startHighlightLoop = useCallback(
		async (delayMs: number, gapMs: number) => {
			let index = 0
			while (highlightingRef.current && buttonIdsRef.current.length > 0 && isMountedRef.current) {
				const buttonId = buttonIdsRef.current[index % buttonIdsRef.current.length]
				updateHighlightedButtonId(buttonId)
				await wait(delayMs)
				if (!highlightingRef.current || !isMountedRef.current) {
					break
				}
				updateHighlightedButtonId(null)
				await wait(gapMs)
				index = (index + 1) % buttonIdsRef.current.length
			}
			highlightingRef.current = false
			updateIsHighlighting(false)
			updateHighlightedButtonId(null)
		},
		[buttonIdsRef, isMountedRef, updateHighlightedButtonId, updateIsHighlighting]
	)

	// Stops the highlight loop and clears visual state
	const stopHighlightSequence = useCallback(() => {
		highlightingRef.current = false
		updateIsHighlighting(false)
		updateHighlightedButtonId(null)
	}, [updateHighlightedButtonId, updateIsHighlighting])

	// Starts the highlight loop if it is not already running
	const startHighlightSequence = useCallback(() => {
		if (highlightingRef.current) {
			return
		}

		highlightingRef.current = true
		updateIsHighlighting(true)

		const delayMs = highlightDelayMs ?? DEFAULT_DELAY
		const gapMs = highlightGapMs ?? DEFAULT_GAP
		startHighlightLoop(delayMs, gapMs)
	}, [highlightDelayMs, highlightGapMs, startHighlightLoop, updateIsHighlighting])

	// Ensures highlighting is active, useful when other flows need to resume it
	const ensureToolbarHighlighting = useCallback(() => {
		if (!highlightingRef.current) {
			startHighlightSequence()
		}
	}, [startHighlightSequence])

	useEffect(() => {
		return () => {
			highlightingRef.current = false
		}
	}, [])

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!matchesHighlightKey(event)) {
				return
			}
			if (activeInput && activeInput.current) {
				return
			}
			if (!highlightingRef.current || !highlightedButtonId) {
				return
			}
			event.preventDefault()
			const element = document.getElementById(highlightedButtonId) as HTMLElement | null
			element?.click()
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [activeInput, highlightedButtonId, matchesHighlightKey])

	return {
		highlightedButtonId,
		isHighlighting,
		startHighlightSequence,
		stopHighlightSequence,
		ensureToolbarHighlighting,
		matchesHighlightKey
	}
}

export default useHighlightSequence
