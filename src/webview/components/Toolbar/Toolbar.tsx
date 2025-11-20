import { Divider, IconButton } from '@mui/material'
import { useRef, useState, useCallback, useEffect } from 'react'
import './Toolbar.css'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import useToolbar from './hooks/useToolbar.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import ToolbarButton from './components/ToolbarButton.js'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import StopIcon from '@mui/icons-material/Stop'
import HighlightableButton from './components/HighlightableButton.js'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import clsx from 'clsx'
import { HighlightMode } from '@webview/types/HighlightSettings.js'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import KeyboardAltIcon from '@mui/icons-material/KeyboardAlt'
import CodeIcon from '@mui/icons-material/Code'

type FocusTarget = 'editor' | 'terminal' | 'dialog'

type ToolbarProps = {
	focus: FocusTarget
	switchFocus: (next: FocusTarget) => void
	handleButtonClick: (input: string) => void
	editorRef: RefObject<PupilEditorHandle | null>
	keyboardVisible: boolean
	toggleKeyboard: () => void
	keyboardHighlighting: boolean
	setKeyboardHighlighting: (next: boolean) => void
	setKeyboardSectionHighlighted: (highlight: boolean) => void
	openSimpleBrowserDialog: () => void
	openFileFolderDialog: () => void
	openTranscriptDialog: () => void
	openSettingsDialog: () => void
	openBlinkDialog: () => void
	highlightDelayMs?: number
	highlightGapMs?: number
	sectionGuideMode?: HighlightMode
}

const Toolbar = ({
	editorRef,
	keyboardVisible,
	toggleKeyboard,
	keyboardHighlighting,
	focus,
	switchFocus,
	handleButtonClick,
	setKeyboardHighlighting,
	setKeyboardSectionHighlighted,
	openSimpleBrowserDialog,
	openFileFolderDialog,
	openTranscriptDialog,
	openSettingsDialog,
	openBlinkDialog,
	highlightDelayMs,
	highlightGapMs,
	sectionGuideMode
}: ToolbarProps) => {
	const buttonIdCounterRef = useRef(0)
	const buttonIdsRef = useRef<string[]>([])
	const [highlightedButtonId, setHighlightedButtonId] = useState<string | null>(null)
	const [isHighlighting, setIsHighlighting] = useState(false)
	const highlightingRef = useRef(false)
	const [isSectionGuideActive, setIsSectionGuideActive] = useState(false)
	const sectionGuideRef = useRef(false)
	const [sectionGuideTarget, setSectionGuideTarget] = useState<'toolbar' | 'keyboard' | null>(null)
	const [isToolbarSectionHighlighted, setIsToolbarSectionHighlighted] = useState(false)
	const isMountedRef = useRef(true)

	const updateHighlightedButtonId = useCallback(
		(value: string | null) => {
			if (!isMountedRef.current) {
				return
			}
			setHighlightedButtonId(value)
		},
		[setHighlightedButtonId]
	)

	const updateIsHighlighting = useCallback(
		(value: boolean) => {
			if (!isMountedRef.current) {
				return
			}
			setIsHighlighting(value)
		},
		[setIsHighlighting]
	)

	const updateIsSectionGuideActive = useCallback(
		(value: boolean) => {
			if (!isMountedRef.current) {
				return
			}
			setIsSectionGuideActive(value)
		},
		[setIsSectionGuideActive]
	)

	const updateSectionGuideTarget = useCallback(
		(value: 'toolbar' | 'keyboard' | null) => {
			if (!isMountedRef.current) {
				return
			}
			setSectionGuideTarget(value)
		},
		[setSectionGuideTarget]
	)

	const updateIsToolbarSectionHighlighted = useCallback(
		(value: boolean) => {
			if (!isMountedRef.current) {
				return
			}
			setIsToolbarSectionHighlighted(value)
		},
		[setIsToolbarSectionHighlighted]
	)

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

	const { generalShortcuts, editorShortcuts, terminalShortcuts } = useToolbar(
		handleButtonClick,
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog
	)

	const { activeInput } = useKeyboardFocus()

	const startHighlightLoop = useCallback(
		async (delayMs: number, gapMs: number) => {
			let i = 0
			while (highlightingRef.current && buttonIdsRef.current.length > 0 && isMountedRef.current) {
				const btnId = buttonIdsRef.current[i % buttonIdsRef.current.length]
				updateHighlightedButtonId(btnId)
				await new Promise((res) => setTimeout(res, delayMs))
				if (!highlightingRef.current || !isMountedRef.current) {
					break
				}
				updateHighlightedButtonId(null)
				await new Promise((res) => setTimeout(res, gapMs))
				i = (i + 1) % buttonIdsRef.current.length
			}
			// ensure state cleanup
			highlightingRef.current = false
			updateIsHighlighting(false)
			updateHighlightedButtonId(null)
		},
		[isMountedRef, updateHighlightedButtonId, updateIsHighlighting]
	)

	const stopHighlightSequence = useCallback(() => {
		highlightingRef.current = false
		updateIsHighlighting(false)
		updateHighlightedButtonId(null)
	}, [updateIsHighlighting, updateHighlightedButtonId])

	const startHighlightSequence = useCallback(() => {
		if (highlightingRef.current) {
			return
		}

		highlightingRef.current = true
		updateIsHighlighting(true)

		const delayMs = highlightDelayMs ?? 700
		const gapMs = highlightGapMs ?? 150

		startHighlightLoop(delayMs, gapMs)
	}, [highlightDelayMs, highlightGapMs, startHighlightLoop, updateIsHighlighting])

	const ensureToolbarHighlighting = useCallback(() => {
		if (!highlightingRef.current) {
			startHighlightSequence()
		}
	}, [startHighlightSequence])

	const stopSectionGuide = useCallback(() => {
		sectionGuideRef.current = false
		updateIsSectionGuideActive(false)
		updateSectionGuideTarget(null)
		updateIsToolbarSectionHighlighted(false)
		setKeyboardSectionHighlighted(false)
	}, [
		setKeyboardSectionHighlighted,
		updateIsSectionGuideActive,
		updateSectionGuideTarget,
		updateIsToolbarSectionHighlighted
	])

	const effectiveSectionGuideMode = sectionGuideMode ?? 'both'

	const startSectionGuideLoop = useCallback(
		async (delayMs: number, gapMs: number) => {
			const targets: Array<'toolbar' | 'keyboard'> =
				effectiveSectionGuideMode === 'both'
					? ['toolbar', 'keyboard']
					: [effectiveSectionGuideMode === 'toolbar' ? 'toolbar' : 'keyboard']
			let index = 0
			while (sectionGuideRef.current && isMountedRef.current) {
				const nextTarget = targets[index % targets.length]
				updateSectionGuideTarget(nextTarget)
				updateIsToolbarSectionHighlighted(nextTarget === 'toolbar')
				setKeyboardSectionHighlighted(nextTarget === 'keyboard')
				await new Promise((res) => setTimeout(res, delayMs))
				if (!sectionGuideRef.current || !isMountedRef.current) {
					break
				}
				updateSectionGuideTarget(null)
				updateIsToolbarSectionHighlighted(false)
				setKeyboardSectionHighlighted(false)
				await new Promise((res) => setTimeout(res, gapMs))
				index = (index + 1) % targets.length
			}
			stopSectionGuide()
		},
		[
			effectiveSectionGuideMode,
			isMountedRef,
			setKeyboardSectionHighlighted,
			stopSectionGuide,
			updateIsToolbarSectionHighlighted,
			updateSectionGuideTarget
		]
	)

	const startSectionGuide = useCallback(() => {
		if (sectionGuideRef.current) {
			return
		}

		sectionGuideRef.current = true
		updateIsSectionGuideActive(true)
		const delayMs = highlightDelayMs ?? 700
		const gapMs = highlightGapMs ?? 150
		startSectionGuideLoop(delayMs, gapMs)
	}, [highlightDelayMs, highlightGapMs, startSectionGuideLoop, updateIsSectionGuideActive])

	const handleSectionGuideButtonClick = useCallback(() => {
		if (sectionGuideRef.current) {
			stopSectionGuide()
			return
		}

		if (highlightingRef.current) {
			stopHighlightSequence()
			return
		}

		if (keyboardHighlighting) {
			setKeyboardHighlighting(false)
			return
		}

		startSectionGuide()
	}, [
		keyboardHighlighting,
		setKeyboardHighlighting,
		startSectionGuide,
		stopHighlightSequence,
		stopSectionGuide
	])

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
			const el = document.getElementById(highlightedButtonId) as HTMLElement | null
			el?.click()
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [highlightedButtonId, activeInput])

	useEffect(() => {
		return () => {
			isMountedRef.current = false
			highlightingRef.current = false
			sectionGuideRef.current = false
		}
	}, [])

	useEffect(() => {
		if (!isSectionGuideActive) {
			return
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== ' ' && e.key !== 'Spacebar' && e.code !== 'Space') {
				return
			}
			if (activeInput && activeInput.current) {
				return
			}
			e.preventDefault()
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
		isSectionGuideActive,
		sectionGuideTarget,
		activeInput,
		ensureToolbarHighlighting,
		setKeyboardHighlighting,
		stopSectionGuide
	])

	const sectionGuideStopActive = isSectionGuideActive || isHighlighting || keyboardHighlighting

	return (
		<>
			<nav
				className={clsx('toolbar-nav flex items-center gap-2', {
					'toolbar-nav--section-highlighted': isToolbarSectionHighlighted
				})}
			>
				<div className="toolbar-primary-actions">
					{(() => {
						const id = nextButtonId('focus')
						const focusLabel = `${focus.charAt(0).toUpperCase()}${focus.slice(1)}`
						return (
							<HighlightableButton
								id={id}
								highlightedButtonId={highlightedButtonId}
								onClick={() => switchFocus(focus)}
								label={focusLabel}
								icon={<CenterFocusStrongIcon fontSize="small" />}
								tooltipTitle="Cambiar foco"
							/>
						)
					})()}

					{(() => {
						const id = nextButtonId('keyboard')
						return (
							<HighlightableButton
								id={id}
								highlightedButtonId={highlightedButtonId}
								onClick={toggleKeyboard}
								label={`${keyboardVisible ? 'Ocultar' : 'Mostrar'} teclado`}
								icon={<KeyboardAltIcon fontSize="small" />}
								tooltipTitle="Alternar teclado"
							/>
						)
					})()}

					<TerminalsDialog
						id={nextButtonId('terminales')}
						highlightedButtonId={highlightedButtonId}
						triggerIcon={<CodeIcon fontSize="small" />}
						triggerTooltip="Terminales abiertas"
					/>
				</div>

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* GENERAL SHORTCUTS */}
				{generalShortcuts.map((shortcut) => {
					const id = nextButtonId(shortcut.label)
					return (
						<ToolbarButton
							key={shortcut.label}
							tooltipTitle={shortcut.tooltipTitle!}
							icon={shortcut.icon}
							label={shortcut.label}
							onButtonClick={shortcut.onClick || (() => {})}
							id={id}
							active={highlightedButtonId === id}
						/>
					)
				})}

				<Divider
					orientation="vertical"
					variant="middle"
					flexItem
					sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
				/>

				{/* EDITOR SHORTCUTS */}
				{focus === 'editor' && (
					<>
						<Snippets
							id={nextButtonId()}
							highlightedButtonId={highlightedButtonId}
							editorRef={editorRef}
						/>
						{editorShortcuts.map((shortcut) =>
							shortcut.divider ? (
								<Divider
									key="divider"
									orientation="vertical"
									variant="middle"
									flexItem
									sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
								/>
							) : (
								(() => {
									const id = nextButtonId(shortcut.value ?? shortcut.label)
									return (
										<ToolbarButton
											key={shortcut.value}
											tooltipTitle={shortcut.tooltipTitle!}
											icon={shortcut.icon}
											label={shortcut.label}
											onButtonClick={() => handleButtonClick(shortcut.value!)}
											id={id}
											active={highlightedButtonId === id}
										/>
									)
								})()
							)
						)}
					</>
				)}

				{/* TERMINAL SHORTCUTS */}
				{focus === 'terminal' &&
					terminalShortcuts.map((shortcut) =>
						shortcut.divider ? (
							<Divider
								key="divider"
								orientation="vertical"
								variant="middle"
								flexItem
								sx={{ bgcolor: 'grey.700', borderRightWidth: 1 }}
							/>
						) : (
							(() => {
								const id = nextButtonId(shortcut.value ?? shortcut.label)
								return (
									<ToolbarButton
										key={shortcut.value}
										tooltipTitle={shortcut.tooltipTitle!}
										icon={shortcut.icon}
										label={shortcut.label}
										onButtonClick={() => handleButtonClick(shortcut.value!)}
										id={id}
										active={highlightedButtonId === id}
									/>
								)
							})()
						)
					)}

				<span className="grow-1" />

				{(() => {
					const id = nextButtonId('settings')
					return (
						<ToolbarButton
							key="settings"
							tooltipTitle="Settings"
							icon={SettingsIcon}
							label="Settings"
							onButtonClick={openSettingsDialog}
							id={id}
							active={highlightedButtonId === id}
						/>
					)
				})()}
				{(() => {
					const id = nextButtonId('eye-tracking')
					return (
						<ToolbarButton
							key="blink"
							tooltipTitle="Eye Tracking"
							icon={VisibilityIcon}
							label="Eye Tracking"
							onButtonClick={openBlinkDialog}
							id={id}
							active={highlightedButtonId === id}
						/>
					)
				})()}

				<IconButton
					data-testid="start-section-highlight-sequence"
					onClick={handleSectionGuideButtonClick}
					aria-pressed={sectionGuideStopActive}
					color={sectionGuideStopActive ? 'primary' : 'default'}
				>
					{sectionGuideStopActive ? <StopIcon /> : <SyncAltIcon />}
				</IconButton>

				{/* Section guide button also drives toolbar/keyboard highlighting */}
			</nav>
		</>
	)
}

export default Toolbar
