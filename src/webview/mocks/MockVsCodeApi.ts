import VsCodeMessage from '@webview/types/VsCodeMessage.js'
import { VsCodeApi } from '../../global.js'

const mockVsCodeApi = (): VsCodeApi => {
	return {
		postMessage: (message: VsCodeMessage) => {
			window.postMessage(message, '*')
		}
	}
}

export default mockVsCodeApi
