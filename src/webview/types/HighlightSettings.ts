export type HighlightMode = 'toolbar' | 'keyboard' | 'both'

export type HighlightSettings = {
	delayMs: number
	gapMs: number
	mode: HighlightMode
}
