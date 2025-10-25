import '@testing-library/jest-dom'
import mockVsCodeApi from '@webview/mocks/MockVsCodeApi.js'
import './mocks/monaco'

window.acquireVsCodeApi = mockVsCodeApi
