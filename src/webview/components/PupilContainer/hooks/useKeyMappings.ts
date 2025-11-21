import {
	DEFAULT_KEY_MAPPINGS,
	KeyMappingId,
	KeyMappingValue,
	KeyMappings
} from '@webview/types/KeyMapping.js'
import { useCallback, useState } from 'react'

const STORAGE_KEY = 'pupil-key-mappings'

// Ensures stored key mappings always include the default shape
const mergeWithDefaults = (stored: Partial<KeyMappings> = {}): KeyMappings => ({
	highlightSequence: {
		...DEFAULT_KEY_MAPPINGS.highlightSequence,
		...stored.highlightSequence
	},
	radialToggle: {
		...DEFAULT_KEY_MAPPINGS.radialToggle,
		...stored.radialToggle
	}
})

// Reads persisted mappings from storage while handling malformed data
const readKeyMappings = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) {
			return { ...DEFAULT_KEY_MAPPINGS }
		}
		return mergeWithDefaults(JSON.parse(stored))
	} catch (error) {
		console.warn('No se pudo leer el mapeo de teclas almacenado', error)
		return { ...DEFAULT_KEY_MAPPINGS }
	}
}

// Provides key mapping state plus a setter that persists to localStorage
const useKeyMappings = () => {
	const [keyMappings, setKeyMappings] = useState<KeyMappings>(() => readKeyMappings())

	// Updates a single binding and writes the result back to storage
	const handleKeyMappingChange = useCallback((id: KeyMappingId, value: KeyMappingValue) => {
		setKeyMappings((prev) => {
			const next = { ...prev, [id]: value }
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
			return next
		})
	}, [])

	return { keyMappings, handleKeyMappingChange }
}

export default useKeyMappings
