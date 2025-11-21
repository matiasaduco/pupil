import { Divider, IconButton } from '@mui/material'
import { useEffect, useRef } from 'react'
import './Toolbar.css'
import Snippets from '../Snippets/Snippets.js'
import TerminalsDialog from '../TerminalsDialog/TerminalsDialog.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import useToolbar from './hooks/useToolbar.js'
import useToolbarButtonRegistry from './hooks/useToolbarButtonRegistry.js'
import useHighlightSequence from './hooks/useHighlightSequence.js'
import useSectionGuide from './hooks/useSectionGuide.js'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import ToolbarButton from './components/ToolbarButton.js'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import StopIcon from '@mui/icons-material/Stop'
import HighlightableButton from './components/HighlightableButton.js'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import clsx from 'clsx'
import { HighlightMode } from '@webview/types/HighlightSettings.js'
import { HighlightKeyBinding } from '@webview/types/KeyMapping.js'
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
	highlightConfirmKey: HighlightKeyBinding
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
	sectionGuideMode,
	highlightConfirmKey
}: ToolbarProps) => {
	const isMountedRef = useRef<boolean>(true)

	const { nextButtonId, buttonIdsRef, resetRegistry } = useToolbarButtonRegistry()
	resetRegistry()

	const { generalShortcuts, editorShortcuts, terminalShortcuts } = useToolbar(
		handleButtonClick,
		openSimpleBrowserDialog,
		openFileFolderDialog,
		openTranscriptDialog
	)

	const { activeInput } = useKeyboardFocus()

	const {
		highlightedButtonId,
		isHighlighting,
		stopHighlightSequence,
		ensureToolbarHighlighting,
		matchesHighlightKey
	} = useHighlightSequence({
		highlightDelayMs,
		highlightGapMs,
		highlightConfirmKey,
		buttonIdsRef,
		isMountedRef,
		activeInput
	})

	const { isToolbarSectionHighlighted, isSectionGuideActive, handleSectionGuideButtonClick } =
		useSectionGuide({
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
		})

	useEffect(() => {
		return () => {
			isMountedRef.current = false
		}
	}, [])

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
