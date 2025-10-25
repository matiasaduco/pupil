import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import FolderTree, { FolderNode } from '@components/FolderTree/FolderTree.js'
import '@testing-library/jest-dom'

vi.mock('@mui/x-tree-view', () => ({
	SimpleTreeView: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="simple-tree-view">{children}</div>
	),
	TreeItem: ({ itemId, children }: { itemId: string; children: React.ReactNode }) => (
		<div data-testid={`tree-item-${itemId}`}>{children}</div>
	)
}))

vi.mock('@mui/material', () => ({
	Typography: ({
		children,
		onClick,
		sx
	}: {
		children: React.ReactNode
		onClick?: () => void
		sx?: Record<string, unknown>
	}) => (
		<div data-testid="typography" onClick={onClick} style={sx}>
			{children}
		</div>
	)
}))

describe('FolderTree', () => {
	const mockOnSelect = vi.fn()

	const sampleTree: FolderNode[] = [
		{
			id: '1',
			name: 'Folder1',
			fullPath: '/path/to/folder1',
			children: [
				{
					id: '2',
					name: 'File1.txt',
					fullPath: '/path/to/folder1/file1.txt'
				}
			]
		},
		{
			id: '3',
			name: 'Folder2',
			fullPath: '/path/to/folder2'
		}
	]

	it('should render the tree structure', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		expect(screen.getByTestId('simple-tree-view')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-1')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-2')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-3')).toBeInTheDocument()
		expect(screen.getByText('Folder1')).toBeInTheDocument()
		expect(screen.getByText('File1.txt')).toBeInTheDocument()
		expect(screen.getByText('Folder2')).toBeInTheDocument()
	})

	it('should call onSelect when a node is clicked', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		const folder1 = screen.getByText('Folder1')
		fireEvent.click(folder1)

		expect(mockOnSelect).toHaveBeenCalledWith('/path/to/folder1')
		expect(mockOnSelect).toHaveBeenCalledTimes(1)
	})

	it('should call onSelect for nested children', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		const file1 = screen.getByText('File1.txt')
		fireEvent.click(file1)

		expect(mockOnSelect).toHaveBeenCalledWith('/path/to/folder1/file1.txt')
	})

	it('should render empty tree', () => {
		render(<FolderTree tree={[]} onSelect={mockOnSelect} />)

		expect(screen.getByTestId('simple-tree-view')).toBeInTheDocument()
		expect(screen.queryByTestId('tree-item-1')).not.toBeInTheDocument()
	})
})
