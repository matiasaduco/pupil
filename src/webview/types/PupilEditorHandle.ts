export type PupilEditorHandle = {
  getCursorPosition: () => { lineNumber: number; column: number } | undefined
  insertAtCursor: (text: string) => void
  deleteAtCursor: () => void
  enterAtCursor: () => void
  commentAtCursor: () => void
}
