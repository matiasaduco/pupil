import { VsCodeApi } from '../global.js'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
	timestamp: string
	level: LogLevel
	message: string
	meta?: string | object
}

class Logger {
	private vscode: VsCodeApi | null = null
	private logToConsole = true

	setVsCodeApi(api: VsCodeApi) {
		this.vscode = api
	}

	private formatTimestamp(): string {
		const now = new Date()
		return now.toISOString().replace('T', ' ').substring(0, 19)
	}

	private log(level: LogLevel, message: string, meta?: string | object): void {
		const entry: LogEntry = {
			timestamp: this.formatTimestamp(),
			level,
			message,
			meta
		}

		// Console output
		if (this.logToConsole) {
			const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
			const consoleMsg = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`

			switch (level) {
				case 'error':
					console.error(consoleMsg)
					break
				case 'warn':
					console.warn(consoleMsg)
					break
				case 'debug':
					console.debug(consoleMsg)
					break
				default:
					console.log(consoleMsg)
			}
		}

		if (this.vscode) {
			this.vscode.postMessage({
				type: 'log',
				data: entry
			})
		}
	}

	info(message: string, meta?: string | object): void {
		this.log('info', message, meta)
	}

	warn(message: string, meta?: string | object): void {
		this.log('warn', message, meta)
	}

	error(message: string, meta?: string | object): void {
		this.log('error', message, meta)
	}

	debug(message: string, meta?: string | object): void {
		this.log('debug', message, meta)
	}

	disableConsoleLogging(): void {
		this.logToConsole = false
	}

	enableConsoleLogging(): void {
		this.logToConsole = true
	}
}

export const logger = new Logger()

export default logger
