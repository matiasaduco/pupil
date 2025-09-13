type Terminal = {
	name: string
	processId: Thenable<number | undefined>
	creationOptions: object
	shellIntegration: object
	state: object
}

export default Terminal
