import { Button, IconButton, Tooltip } from '@mui/material'
import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardFocus } from '@webview/contexts/KeyboardFocusContext.js'
import EditIcon from '@mui/icons-material/Edit'
import EditOffIcon from '@mui/icons-material/EditOff'

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
	const [orderedLayout, setOrderedLayout] = useState(() => layout)
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [editMode, setEditMode] = useState(false)

	if (layout.length !== orderedLayout.length || layout[0]?.value !== orderedLayout[0]?.value) {
		setOrderedLayout(layout)
	}

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

		const isLetter = (key: typeof draggedKey) => {
			return key.value.length === 1 && /[a-zA-Z]/.test(key.value)
		}

		if (!isLetter(draggedKey) || !isLetter(dropKey)) {
			setDraggedIndex(null)
			return
		}

		const result = Array.from(orderedLayout)
		result[draggedIndex] = dropKey
		result[dropIndex] = draggedKey
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

	if (!visible) {
		return null
	}

	return (
		<div style={{ position: 'relative' }}>
			<Tooltip title={editMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}>
				<IconButton
					onClick={() => setEditMode(!editMode)}
					size="small"
					sx={{
						position: 'absolute',
						top: 8,
						right: 8,
						zIndex: 10,
						backgroundColor: editMode ? 'primary.main' : 'grey.700',
						color: 'white',
						'&:hover': {
							backgroundColor: editMode ? 'primary.dark' : 'grey.600'
						}
					}}
				>
					{editMode ? <EditOffIcon fontSize="small" /> : <EditIcon fontSize="small" />}
				</IconButton>
			</Tooltip>
			<div
				className={clsx('grid grid-cols-30 gap-1 bg-gray-400 rounded p-2', {
					'pupil-keyboard--section-highlighted': sectionHighlighting
				})}
				style={{ height: 'min(30vh, 220px)' }}
				data-testid={testId}
			>
				{orderedLayout.map((key, index) => {
					const isLetter = key.value.length === 1 && /[a-zA-Z]/.test(key.value)
					const isDraggable = editMode && isLetter

					return (
						<div
							key={`${key.value}-${index}`}
							draggable={isDraggable}
							onDragStart={isDraggable ? (e) => handleDragStart(e, index) : undefined}
							onDragOver={isDraggable ? handleDragOver : undefined}
							onDrop={isDraggable ? (e) => handleDrop(e, index) : undefined}
							onDragEnd={isDraggable ? handleDragEnd : undefined}
							style={{
								gridColumn: `span ${key.col || 2} / span ${key.col || 2}`,
								display: 'flex',
								cursor: isDraggable ? 'grab' : 'default'
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
					)
				})}
			</div>
		</div>
	)
}

export default PupilKeyboard
