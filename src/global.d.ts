/* eslint-disable */
// @ts-nocheck
// / <reference types="react" />
import * as React from 'react'

declare global {
	declare function acquireVsCodeApi(): {
		postMessage: (msg: any) => void
		getState: () => any
		setState: (newState: any) => void
	}
}
