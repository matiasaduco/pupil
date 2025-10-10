export type PupilEditorHandle = {
	getCursorPosition: () => { lineNumber: number; column: number } | undefined
	insertAtCursor: (text: string) => void
	insertMultipleAtCursor: (texts: string[]) => void
	insertCommentBlockAtCursor: (texts: string[]) => void
	deleteAtCursor: () => void
	enterAtCursor: () => void
	commentAtCursor: () => void
	copySelection: () => void
	pasteClipboard: () => void
	cutSelection: () => void
	focus: () => void
	undo: () => void
	redo: () => void
}
