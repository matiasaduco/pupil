import { useState, useEffect } from 'react'
import { SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { ReactElement } from 'react'

type GeneralShortcut = {
	tooltipTitle: string
	icon: OverridableComponent<SvgIconTypeMap> | ReactElement
	label: string
	onClick?: () => void
}

type ShortcutItem = {
	label?: string
	value?: string
	divider?: boolean
	tooltipTitle?: string
	icon?: OverridableComponent<SvgIconTypeMap> | ReactElement
}

type Category = 'general' | 'editor' | 'terminal'

type UseDragAndDropProps = {
	generalShortcuts: GeneralShortcut[]
	editorShortcuts: ShortcutItem[]
	terminalShortcuts: ShortcutItem[]
}

type UseDragAndDropReturn = {
	orderedGeneralShortcuts: GeneralShortcut[]
	orderedEditorShortcuts: ShortcutItem[]
	orderedTerminalShortcuts: ShortcutItem[]
	draggedIndex: number | null
	draggedCategory: Category | null
	handleDragStart: (e: React.DragEvent, index: number, category: Category) => void
	handleDragOver: (e: React.DragEvent, category: Category) => void
	handleDrop: (e: React.DragEvent, dropIndex: number, category: Category) => void
	handleDragEnd: () => void
}

const useDragAndDrop = ({
	generalShortcuts,
	editorShortcuts,
	terminalShortcuts
}: UseDragAndDropProps): UseDragAndDropReturn => {
	const [orderedGeneralShortcuts, setOrderedGeneralShortcuts] = useState<GeneralShortcut[]>(() => {
		const saved = localStorage.getItem('pupil-toolbar-general')
		if (saved) {
			try {
				const savedOrder: string[] = JSON.parse(saved)
				if (Array.isArray(savedOrder) && savedOrder.length === generalShortcuts.length) {
					const ordered = savedOrder
						.map((label) => generalShortcuts.find((s) => s.label === label))
						.filter((s): s is GeneralShortcut => s !== undefined)
					if (ordered.length === generalShortcuts.length) {
						return ordered
					}
				}
			} catch (e) {
				console.error('Failed to parse saved general shortcuts:', e)
			}
		}
		return generalShortcuts
	})

	const [orderedEditorShortcuts, setOrderedEditorShortcuts] = useState<ShortcutItem[]>(() => {
		const saved = localStorage.getItem('pupil-toolbar-editor')
		if (saved) {
			try {
				const savedOrder: string[] = JSON.parse(saved)
				if (Array.isArray(savedOrder) && savedOrder.length === editorShortcuts.length) {
					const ordered = savedOrder
						.map((val) => {
							if (val === '__DIVIDER__') {
								return editorShortcuts.find((s) => s.divider)
							}
							return editorShortcuts.find((s) => s.value === val || s.label === val)
						})
						.filter((s): s is ShortcutItem => s !== undefined)
					if (ordered.length === editorShortcuts.length) {
						return ordered
					}
				}
			} catch (e) {
				console.error('Failed to parse saved editor shortcuts:', e)
			}
		}
		return editorShortcuts
	})

	const [orderedTerminalShortcuts, setOrderedTerminalShortcuts] = useState<ShortcutItem[]>(() => {
		const saved = localStorage.getItem('pupil-toolbar-terminal')
		if (saved) {
			try {
				const savedOrder: string[] = JSON.parse(saved)
				if (Array.isArray(savedOrder) && savedOrder.length === terminalShortcuts.length) {
					const ordered = savedOrder
						.map((val) => {
							if (val === '__DIVIDER__') {
								return terminalShortcuts.find((s) => s.divider)
							}
							return terminalShortcuts.find((s) => s.value === val || s.label === val)
						})
						.filter((s): s is ShortcutItem => s !== undefined)
					if (ordered.length === terminalShortcuts.length) {
						return ordered
					}
				}
			} catch (e) {
				console.error('Failed to parse saved terminal shortcuts:', e)
			}
		}
		return terminalShortcuts
	})

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [draggedCategory, setDraggedCategory] = useState<Category | null>(null)

	useEffect(() => {
		const order = orderedGeneralShortcuts.map((s) => s.label)
		localStorage.setItem('pupil-toolbar-general', JSON.stringify(order))
	}, [orderedGeneralShortcuts])

	useEffect(() => {
		const order = orderedEditorShortcuts.map((s) =>
			s.divider ? '__DIVIDER__' : s.value || s.label
		)
		localStorage.setItem('pupil-toolbar-editor', JSON.stringify(order))
	}, [orderedEditorShortcuts])

	useEffect(() => {
		const order = orderedTerminalShortcuts.map((s) =>
			s.divider ? '__DIVIDER__' : s.value || s.label
		)
		localStorage.setItem('pupil-toolbar-terminal', JSON.stringify(order))
	}, [orderedTerminalShortcuts])

	const handleDragStart = (e: React.DragEvent, index: number, category: Category) => {
		setDraggedIndex(index)
		setDraggedCategory(category)
		e.dataTransfer.effectAllowed = 'move'
	}

	const handleDragOver = (e: React.DragEvent, category: Category) => {
		e.preventDefault()
		if (draggedCategory === category) {
			e.dataTransfer.dropEffect = 'move'
		}
	}

	const handleDrop = (e: React.DragEvent, dropIndex: number, category: Category) => {
		e.preventDefault()

		if (draggedIndex === null || draggedCategory !== category || draggedIndex === dropIndex) {
			return
		}

		console.log('Reordering...')
		const reorder = <T>(list: T[]): T[] => {
			const result = Array.from(list)
			const [removed] = result.splice(draggedIndex, 1)
			result.splice(dropIndex, 0, removed)
			return result
		}

		if (category === 'general') {
			setOrderedGeneralShortcuts(reorder(orderedGeneralShortcuts))
		} else if (category === 'editor') {
			setOrderedEditorShortcuts(reorder(orderedEditorShortcuts))
		} else if (category === 'terminal') {
			setOrderedTerminalShortcuts(reorder(orderedTerminalShortcuts))
		}

		setDraggedIndex(null)
		setDraggedCategory(null)
	}

	const handleDragEnd = () => {
		setDraggedIndex(null)
		setDraggedCategory(null)
	}

	return {
		orderedGeneralShortcuts,
		orderedEditorShortcuts,
		orderedTerminalShortcuts,
		draggedIndex,
		draggedCategory,
		handleDragStart,
		handleDragOver,
		handleDrop,
		handleDragEnd
	}
}

export default useDragAndDrop
