import React, { createContext, useContext } from 'react'
import { VsCodeApi } from '../../global.js'
import mockVsCodeApi from '@webview/mocks/MockVsCodeApi.js'

const VsCodeApiContext = createContext<VsCodeApi | null>(null)

export const VsCodeApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const isDev = window.location.hostname === 'localhost'

	const vscode: VsCodeApi = isDev
		? mockVsCodeApi()
		: !window.__vscodeApiInstance
			? (window.__vscodeApiInstance = acquireVsCodeApi())
			: window.__vscodeApiInstance

	return <VsCodeApiContext.Provider value={vscode}>{children}</VsCodeApiContext.Provider>
}

export const useVsCodeApi = () => {
	const context = useContext(VsCodeApiContext)
	if (!context) {
		throw new Error('useVsCodeApi must be used within a VsCodeApiProvider')
	}
	return context
}
