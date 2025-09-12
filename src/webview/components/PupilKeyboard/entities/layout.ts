type Key = {
	value: string
	label?: string
	icon?: React.ElementType
	col?: number
}

export type Layout = {
	[key: string]: Key[]
}
