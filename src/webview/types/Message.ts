export type Message = {
	type: MessageType
	content?: string
}

type MessageType =
	| 'ready'
	| 'get-snippets'
	| 'edit'
	| 'terminal-open'
	| 'terminal-create'
	| 'terminal-input'
	| 'terminal-space'
	| 'terminal-bksp'
	| 'terminal-enter'
	| 'terminal-clear'
	| 'terminal-hide'
	| 'terminal-list'
