export const LOCALHOST = 'http://localhost'
export const DEFAULT_PORT = '3000'
export const DEFAULT_URL = `${LOCALHOST}:${DEFAULT_PORT}`

export const ConnectionStatus = {
	CONNECTED: {
		value: 'connected',
		label: 'Connected',
		icon: '🟢'
	},
	CONNECTING: {
		value: 'connecting',
		label: 'Connecting',
		icon: '🟡'
	},
	DISCONNECTED: {
		value: 'disconnected',
		label: 'Disconnected',
		icon: '🔴'
	}
}

export type ConnectionStatusType =
	| typeof ConnectionStatus.CONNECTED
	| typeof ConnectionStatus.CONNECTING
	| typeof ConnectionStatus.DISCONNECTED
