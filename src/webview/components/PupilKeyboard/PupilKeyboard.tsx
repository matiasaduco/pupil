import { Button, Tooltip } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import EditIcon from '@mui/icons-material/Edit'
import EditOffIcon from '@mui/icons-material/EditOff'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

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
	const [orderedLayout, setOrderedLayout] = useState<typeof layout>(() => {
		const saved = localStorage.getItem('pupil-keyboard-layout')
		if (saved) {
			try {
				const savedOrder: Array<{ value: string; label?: string; col?: number }> = JSON.parse(saved)
				if (Array.isArray(savedOrder) && savedOrder.length === layout.length) {
					const ordered = savedOrder.map((saved) => {
						const original = layout.find((k) => k.value === saved.value)
						if (original) {
							return { ...original, col: saved.col }
						}
						return saved as (typeof layout)[number]
					})
					return ordered
				}
			} catch (e) {
				console.error('Failed to parse saved keyboard layout:', e)
			}
		}
		return layout
	})
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [editMode, setEditMode] = useState(false)

	if (layout.length !== orderedLayout.length || layout[0]?.value !== orderedLayout[0]?.value) {
		setOrderedLayout(layout)
	}

	useEffect(() => {
		const serializableLayout = orderedLayout.map((key) => ({
			value: key.value,
			label: key.label,
			col: key.col
		}))
		localStorage.setItem('pupil-keyboard-layout', JSON.stringify(serializableLayout))
	}, [orderedLayout])

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index)
		e.dataTransfer.effectAllowed = 'move'
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault()

		if (draggedIndex === null || draggedIndex === dropIndex) {
			return
		}

		const draggedKey = orderedLayout[draggedIndex]
		const dropKey = orderedLayout[dropIndex]

		const result = Array.from(orderedLayout)
		const draggedCol = draggedKey.col
		const dropCol = dropKey.col
		result[draggedIndex] = { ...dropKey, col: draggedCol }
		result[dropIndex] = { ...draggedKey, col: dropCol }

		setOrderedLayout(result)
		setDraggedIndex(null)
	}

	const handleDragEnd = () => {
		setDraggedIndex(null)
	}
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

	const handleResetLayout = () => {
		setOrderedLayout(layout)
	}

	if (!visible) {
		return null
	}

	return (
		<div style={{ position: 'relative' }}>
			<div
				style={{
					position: 'absolute',
					top: 12,
					right: 20,
					zIndex: 100,
					display: 'flex',
					gap: '4px'
				}}
			>
				<Tooltip title={editMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}>
					<Button
						onClick={() => setEditMode(!editMode)}
						className={clsx('pupil-keyboard-btn border-2', {
							'border-amber-500!': editMode,
							'border-transparent': !editMode
						})}
						sx={{
							minWidth: 'auto',
							padding: '6px',
							width: '32px',
							height: '32px'
						}}
					>
						{editMode ? <EditOffIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
					</Button>
				</Tooltip>
				<Tooltip title="Reset to Default Layout">
					<Button
						onClick={handleResetLayout}
						className="pupil-keyboard-btn border-2 border-transparent"
						sx={{
							minWidth: 'auto',
							padding: '6px',
							width: '32px',
							height: '32px'
						}}
					>
						<RestartAltIcon sx={{ fontSize: 16 }} />
					</Button>
				</Tooltip>
			</div>
			<div
				className={clsx('grid grid-cols-30 gap-1 bg-gray-400 rounded p-2', {
					'pupil-keyboard--section-highlighted': sectionHighlighting
				})}
				style={{ height: 'min(30vh, 220px)' }}
				data-testid={testId}
			>
				{orderedLayout.map((key, index) => (
					<div
						key={`${key.value}-${index}`}
						draggable={editMode}
						onDragStart={editMode ? (e) => handleDragStart(e, index) : undefined}
						onDragOver={editMode ? handleDragOver : undefined}
						onDrop={editMode ? (e) => handleDrop(e, index) : undefined}
						onDragEnd={editMode ? handleDragEnd : undefined}
						style={{
							gridColumn: `span ${key.col || 2} / span ${key.col || 2}`,
							display: 'flex',
							cursor: editMode ? 'grab' : 'default'
						}}
					>
						<Button
							onClick={() => handleKeyPress(key)}
							disabled={editMode}
							className={clsx('pupil-keyboard-btn border-2 border-transparent', {
								'border-amber-500!': key.value === clickedKey,
								'pupil-keyboard-btn--highlighted': highlightedKeyIndex === index
							})}
							sx={{
								width: '100%',
								textTransform: 'unset'
							}}
						>
							{key.icon ? <key.icon /> : key.label || key.value}
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}

export default PupilKeyboard
