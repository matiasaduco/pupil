/* eslint-disable */
// @ts-nocheck
// / <reference types="react" />
import * as React from 'react'

export type VsCodeApi = {
	postMessage: (msg: any) => void
}

declare global {
	function acquireVsCodeApi(): VsCodeApi
}
