import React, { createContext, useContext } from 'react'

const DebuggerContext = createContext<boolean>(false)

export const DebuggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const isDev = window.location.hostname === 'localhost'

	return <DebuggerContext.Provider value={isDev}>{children}</DebuggerContext.Provider>
}

export const useDebuggerContext = () => {
	const context = useContext(DebuggerContext)
	if (!context) {
		throw new Error('useDebuggerContext must be used within a DebuggerProvider')
	}
	return context
}
