import { useCallback, useState } from 'react'

const STORAGE_KEY = 'pupil-radial-enabled'

// Reads the persisted radial keyboard state, falling back to true
const readRadialEnabled = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored !== null ? JSON.parse(stored) : true
	} catch (error) {
		console.warn('No se pudo leer el estado del teclado radial', error)
		return true
	}
}

// Exposes the radial preference state along with a toggle that syncs storage
const useRadialPreference = () => {
	const [radialEnabled, setRadialEnabled] = useState<boolean>(() => readRadialEnabled())

	// Flips the current preference and persists it
	const toggleRadial = useCallback(() => {
		setRadialEnabled((prev) => {
			const next = !prev
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
			return next
		})
	}, [])

	return { radialEnabled, toggleRadial }
}

export default useRadialPreference
