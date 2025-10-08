import * as React from 'react'
import FolderTree from './FolderTree.js'
import { FolderNode } from './FolderTree.js'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'
import './FolderTree.css'

const FolderTreeContainer: React.FC = () => {
	const [tree, setTree] = React.useState<FolderNode[]>([])
	const [selecting, setSelecting] = React.useState(false)
	const vscode = useVsCodeApi()

	React.useEffect(() => {
		const listener = (event: MessageEvent) => {
			const msg = event.data
			console.log('Mensaje recibido en webview:', msg)
			if (msg.type === 'show-folder-tree') {
				setTree(msg.items)
				setSelecting(true)
			}
		}

		window.addEventListener('message', listener)
		return () => window.removeEventListener('message', listener)
	}, [])

	const handleSelect = (fullPath: string) => {
		console.log('Carpeta seleccionada en webview:')
		vscode.postMessage({ type: 'folder-selected', path: fullPath })
		setSelecting(false)
		setTree([])
	}

	if (!selecting) {
		return null
	}

	return (
		<div className="folder-tree-overlay">
			<div className="folder-tree-modal">
				<h3 className="folder-tree-modal-title">Elegí carpeta destino:</h3>
				<FolderTree tree={tree} onSelect={handleSelect} />
			</div>
		</div>
	)
}

export default FolderTreeContainer
