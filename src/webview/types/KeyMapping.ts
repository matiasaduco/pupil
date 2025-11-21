export type HighlightKeyBinding = {
	key: string
	code: string
	label: string
}

export type RadialMouseBinding = {
	button: number
	label: string
}

export type KeyMappings = {
	highlightSequence: HighlightKeyBinding
	radialToggle: RadialMouseBinding
}

export type KeyMappingId = keyof KeyMappings

export type KeyMappingValue<T extends KeyMappingId = KeyMappingId> = KeyMappings[T]

export const DEFAULT_KEY_MAPPINGS: KeyMappings = {
	highlightSequence: {
		key: ' ',
		code: 'Space',
		label: 'Barra espaciadora'
	},
	radialToggle: {
		button: 1,
		label: 'Botón central del mouse'
	}
}
