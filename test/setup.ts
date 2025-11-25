import '@testing-library/jest-dom'
import mockVsCodeApi from '../src/webview/mocks/MockVsCodeApi.js'

window.acquireVsCodeApi = () => mockVsCodeApi()
