import { useEffect, ReactNode } from 'react'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import logger from '../utils/logger.js'

interface LoggerProviderProps {
	children: ReactNode
}

export const LoggerProvider = ({ children }: LoggerProviderProps) => {
	const vscode = useVsCodeApi()

	useEffect(() => {
		logger.setVsCodeApi(vscode)
		logger.info('Logger initialized successfully')
	}, [vscode])

	return children
}

export default LoggerProvider
