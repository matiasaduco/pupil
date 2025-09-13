import React, { useEffect } from 'react'

const MockPupilProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const terminals = [
		{ name: 'MockedTerminal 1' },
		{ name: 'MockedTerminal 2' },
		{ name: 'MockedTerminal 3' }
	]

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			switch (event.data.type) {
				case 'terminal-space':
					console.log('Mock: terminal SPACE')
					break
				case 'terminal-bksp':
					console.log('Mock: terminal BKSP')
					break
				case 'terminal-enter':
					console.log('Mock: terminal ENTER')
					break
				case 'terminal-clear':
					console.log('Mock: terminal CLEAR')
					break
				case 'terminal-create':
					console.log('Mock: terminal CREATE')
					break
				case 'terminal-open':
					console.log('Mock: terminal OPEN')
					break
				case 'terminal-hide':
					console.log('Mock: terminal OPEN')
					break
				case 'terminal-list':
					window.postMessage({
						type: 'set-terminals',
						content: terminals
					})
				default:
					console.log('Mock: mensaje no manejado', event.data)
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [])

	return <>{children}</>
}

export default MockPupilProvider
