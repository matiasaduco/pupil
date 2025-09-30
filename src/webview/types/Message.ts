export type Message = {
	type: MessageType
	content?: never
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
	| 'terminal-show'
	| 'openWeb'
	| 'stop-process'
