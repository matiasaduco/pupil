import { HighlightMode } from '@webview/types/HighlightSettings.js'
import { MutableRefObject, RefObject, useCallback, useEffect, useRef, useState } from 'react'

type SectionTarget = 'toolbar' | 'keyboard'

type UseSectionGuideParams = {
	highlightDelayMs?: number
	highlightGapMs?: number
	sectionGuideMode?: HighlightMode
	setKeyboardSectionHighlighted: (next: boolean) => void
	setKeyboardHighlighting: (next: boolean) => void
	keyboardHighlighting: boolean
	isHighlighting: boolean
	stopHighlightSequence: () => void
	ensureToolbarHighlighting: () => void
	matchesHighlightKey: (event: KeyboardEvent) => boolean
	activeInput: RefObject<HTMLElement | null> | null
	isMountedRef: MutableRefObject<boolean>
}

type UseSectionGuideResult = {
	isToolbarSectionHighlighted: boolean
	isSectionGuideActive: boolean
	handleSectionGuideButtonClick: () => void
}

// Small helper that pauses execution between section transitions
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type UpdateBoolean = (value: boolean) => void

type UpdateTarget = (value: SectionTarget | null) => void

// Orchestrates the toolbar/keyboard section guide interactions and keyboard listeners
const useSectionGuide = ({
	highlightDelayMs,
	highlightGapMs,
	sectionGuideMode,
	setKeyboardSectionHighlighted,
	setKeyboardHighlighting,
	keyboardHighlighting,
	isHighlighting,
	stopHighlightSequence,
	ensureToolbarHighlighting,
	matchesHighlightKey,
	activeInput,
	isMountedRef
}: UseSectionGuideParams): UseSectionGuideResult => {
	const [isSectionGuideActive, setIsSectionGuideActive] = useState(false)
	const [sectionGuideTarget, setSectionGuideTarget] = useState<SectionTarget | null>(null)
	const [isToolbarSectionHighlighted, setIsToolbarSectionHighlighted] = useState(false)
	const sectionGuideRef = useRef(false)

	// Wraps boolean state setters to avoid updates after unmount
	const safeUpdateBoolean = useCallback(
		(updater: UpdateBoolean) => (value: boolean) => {
			if (!isMountedRef.current) {
				return
			}
			updater(value)
		},
		[isMountedRef]
	)

	// Wraps target state setters to avoid updates after unmount
	const safeUpdateTarget = useCallback(
		(updater: UpdateTarget) => (value: SectionTarget | null) => {
			if (!isMountedRef.current) {
				return
			}
			updater(value)
		},
		[isMountedRef]
	)

	const updateSectionGuideActive = safeUpdateBoolean(setIsSectionGuideActive)
	const updateToolbarHighlighted = safeUpdateBoolean(setIsToolbarSectionHighlighted)
	const updateSectionGuideTarget = safeUpdateTarget(setSectionGuideTarget)

	// Resets section guide state and removes any active highlights
	const stopSectionGuide = useCallback(() => {
		sectionGuideRef.current = false
		updateSectionGuideActive(false)
		updateSectionGuideTarget(null)
		updateToolbarHighlighted(false)
		setKeyboardSectionHighlighted(false)
	}, [
		setKeyboardSectionHighlighted,
		updateSectionGuideActive,
		updateSectionGuideTarget,
		updateToolbarHighlighted
	])

	const effectiveMode: SectionTarget | 'both' = sectionGuideMode ?? 'both'

	// Alternates highlighting between toolbar/keyboard based on user preferences
	const startSectionGuideLoop = useCallback(
		async (delayMs: number, gapMs: number) => {
			const targets: SectionTarget[] =
				effectiveMode === 'both'
					? ['toolbar', 'keyboard']
					: [effectiveMode === 'toolbar' ? 'toolbar' : 'keyboard']

			let index = 0
			while (sectionGuideRef.current && isMountedRef.current) {
				const nextTarget = targets[index % targets.length]
				updateSectionGuideTarget(nextTarget)
				updateToolbarHighlighted(nextTarget === 'toolbar')
				setKeyboardSectionHighlighted(nextTarget === 'keyboard')
				await wait(delayMs)
				if (!sectionGuideRef.current || !isMountedRef.current) {
					break
				}
				updateSectionGuideTarget(null)
				updateToolbarHighlighted(false)
				setKeyboardSectionHighlighted(false)
				await wait(gapMs)
				index = (index + 1) % targets.length
			}
			stopSectionGuide()
		},
		[
			effectiveMode,
			isMountedRef,
			setKeyboardSectionHighlighted,
			stopSectionGuide,
			updateSectionGuideTarget,
			updateToolbarHighlighted
		]
	)

	// Starts the section guide cycle if it is currently inactive
	const startSectionGuide = useCallback(() => {
		if (sectionGuideRef.current) {
			return
		}

		sectionGuideRef.current = true
		updateSectionGuideActive(true)
		const delayMs = highlightDelayMs ?? 700
		const gapMs = highlightGapMs ?? 150
		startSectionGuideLoop(delayMs, gapMs)
	}, [highlightDelayMs, highlightGapMs, startSectionGuideLoop, updateSectionGuideActive])

	// Handles the section guide toggle button, deciding when to start/stop auxiliary flows
	const handleSectionGuideButtonClick = useCallback(() => {
		if (sectionGuideRef.current) {
			stopSectionGuide()
			return
		}

		if (isHighlighting) {
			stopHighlightSequence()
			return
		}

		if (keyboardHighlighting) {
			setKeyboardHighlighting(false)
			return
		}

		startSectionGuide()
	}, [
		isHighlighting,
		keyboardHighlighting,
		setKeyboardHighlighting,
		startSectionGuide,
		stopHighlightSequence,
		stopSectionGuide
	])

	useEffect(() => {
		return () => {
			sectionGuideRef.current = false
		}
	}, [])

	useEffect(() => {
		if (!isSectionGuideActive) {
			return
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (!matchesHighlightKey(event)) {
				return
			}
			if (activeInput && activeInput.current) {
				return
			}
			event.preventDefault()
			if (sectionGuideTarget === 'toolbar') {
				ensureToolbarHighlighting()
			} else if (sectionGuideTarget === 'keyboard') {
				setKeyboardHighlighting(true)
			}
			stopSectionGuide()
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [
		activeInput,
		ensureToolbarHighlighting,
		isSectionGuideActive,
		matchesHighlightKey,
		sectionGuideTarget,
		setKeyboardHighlighting,
		stopSectionGuide
	])

	return {
		isToolbarSectionHighlighted,
		isSectionGuideActive,
		handleSectionGuideButtonClick
	}
}

export default useSectionGuide
