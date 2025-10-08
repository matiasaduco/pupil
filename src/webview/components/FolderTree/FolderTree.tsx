import * as React from 'react'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { Typography } from '@mui/material'

export interface FolderNode {
	id: string
	name: string
	fullPath: string
	children?: FolderNode[]
}

type FolderTreeProps = {
	tree: FolderNode[]
	onSelect: (fullPath: string) => void
}

const FolderTree: React.FC<FolderTreeProps> = ({ tree, onSelect }) => {
	const renderTree = (node: FolderNode) => (
		<TreeItem key={node.id} itemId={node.id}>
			<Typography
				onClick={() => onSelect(node.fullPath)}
				sx={{ cursor: 'pointer', userSelect: 'none', padding: '2px 4px' }}
			>
				{node.name}
			</Typography>
			{node.children?.map(renderTree)}
		</TreeItem>
	)

	return <SimpleTreeView>{tree.map(renderTree)}</SimpleTreeView>
}

export default FolderTree
