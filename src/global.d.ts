/* eslint-disable */
// @ts-nocheck
// / <reference types="react" />
import * as React from 'react'

export type VsCodeApi = {
	postMessage: (msg: any) => void
	getState: () => any
	setState: (newState: any) => void
}

declare global {
	function acquireVsCodeApi(): VsCodeApi
}
