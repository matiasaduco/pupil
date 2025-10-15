export type Message<T = unknown> = {
	type: MessageType
	content?: T
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
	| 'openSimpleBrowser'
	| 'stop-process'
	| 'transcript'
