import { useEffect } from 'react'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import logger from '../utils/logger.js'

export const useLogger = () => {
	const vscode = useVsCodeApi()

	useEffect(() => {
		logger.setVsCodeApi(vscode)
	}, [vscode])

	return logger
}

export default useLogger
