import { useState, useEffect } from 'react'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'

type VoiceCommandsSettings = {
	enabled: boolean
	commands: Record<string, boolean>
}

const DEFAULT_VOICE_COMMANDS = [
	'open-simple-browser',
	'open-create-dialog',
	'open-terminal',
	'save-document',
	'open-settings'
]

const useVoiceCommandsSettings = () => {
	const vscode = useVsCodeApi()

	const [voiceCommandsSettings, setVoiceCommandsSettings] = useState<VoiceCommandsSettings>(() => {
		// Try to load from localStorage (synced from speech-web)
		const saved = localStorage.getItem('voiceCommandsSettings')
		if (saved) {
			try {
				return JSON.parse(saved)
			} catch (e) {
				console.error('Failed to parse voice commands settings:', e)
			}
		}

		// Default: all commands enabled
		const defaultSettings: VoiceCommandsSettings = {
			enabled: true,
			commands: {}
		}
		DEFAULT_VOICE_COMMANDS.forEach((cmd) => {
			defaultSettings.commands[cmd] = true
		})
		return defaultSettings
	})

	// Listen for settings updates from speech-web
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === 'voice-commands-settings') {
				setVoiceCommandsSettings(event.data.settings)
				localStorage.setItem('voiceCommandsSettings', JSON.stringify(event.data.settings))
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [])

	const updateVoiceCommandsSettings = (settings: VoiceCommandsSettings) => {
		setVoiceCommandsSettings(settings)
		localStorage.setItem('voiceCommandsSettings', JSON.stringify(settings))

		// Send to extension to propagate to speech-web
		vscode.postMessage({
			type: 'update-voice-commands-settings',
			settings
		})
	}

	return {
		voiceCommandsSettings,
		updateVoiceCommandsSettings
	}
}

export default useVoiceCommandsSettings
