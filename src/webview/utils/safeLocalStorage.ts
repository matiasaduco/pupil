type LocalStorageLike = {
	getItem: (key: string) => string | null
	setItem: (key: string, value: string) => void
	removeItem: (key: string) => void
	clear: () => void
}

const noopStorage: LocalStorageLike = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
	clear: () => {}
}

export const safeLocalStorage: LocalStorageLike = (() => {
	if (typeof window === 'undefined') {
		return noopStorage
	}

	const storage = window.localStorage
	if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function') {
		return storage
	}

	return noopStorage
})()
