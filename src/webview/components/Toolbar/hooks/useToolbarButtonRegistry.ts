import { MutableRefObject, useCallback, useRef } from 'react'

const sanitizeId = (value?: string) => {
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

export type ToolbarButtonRegistry = {
	nextButtonId: (base?: string) => string
	buttonIdsRef: MutableRefObject<string[]>
	resetRegistry: () => void
}

const useToolbarButtonRegistry = (): ToolbarButtonRegistry => {
	const counterRef = useRef(0)
	const buttonIdsRef = useRef<string[]>([])

	const resetRegistry = useCallback(() => {
		counterRef.current = 0
		buttonIdsRef.current = []
	}, [])

	const nextButtonId = useCallback(
		(base?: string) => {
			const semantic = sanitizeId(base)
			const id = semantic ? `toolbar-button-${semantic}` : `toolbar-button-${++counterRef.current}`
			buttonIdsRef.current.push(id)
			return id
		},
		[]
	)

	return {
		nextButtonId,
		buttonIdsRef,
		resetRegistry
	}
}

export default useToolbarButtonRegistry
