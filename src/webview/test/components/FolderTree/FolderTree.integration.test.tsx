import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import FolderTree, { FolderNode } from '@components/FolderTree/FolderTree.js'
import '@testing-library/jest-dom'

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

// Mock the MUI tree components to test the FolderTree logic
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

describe('FolderTree Integration', () => {
	beforeEach(() => {
		mockOnSelect.mockClear()
	})

	it('should render the tree structure with real component logic', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		expect(screen.getByTestId('simple-tree-view')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-1')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-2')).toBeInTheDocument()
		expect(screen.getByTestId('tree-item-3')).toBeInTheDocument()
		expect(screen.getByText('Folder1')).toBeInTheDocument()
		expect(screen.getByText('File1.txt')).toBeInTheDocument()
		expect(screen.getByText('Folder2')).toBeInTheDocument()
	})

	it('should call onSelect when a node Typography is clicked', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		const folder1Typography = screen.getAllByTestId('typography')[0]
		fireEvent.click(folder1Typography)

		expect(mockOnSelect).toHaveBeenCalledWith('/path/to/folder1')
		expect(mockOnSelect).toHaveBeenCalledTimes(1)
	})

	it('should call onSelect for nested children', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		const file1Typography = screen.getAllByTestId('typography')[1]
		fireEvent.click(file1Typography)

		expect(mockOnSelect).toHaveBeenCalledWith('/path/to/folder1/file1.txt')
	})

	it('should render empty tree when no nodes provided', () => {
		render(<FolderTree tree={[]} onSelect={mockOnSelect} />)

		expect(screen.getByTestId('simple-tree-view')).toBeInTheDocument()
		expect(screen.queryByTestId('tree-item-1')).not.toBeInTheDocument()
	})

	it('should handle single node tree', () => {
		const singleNodeTree: FolderNode[] = [
			{
				id: 'single',
				name: 'SingleFile.js',
				fullPath: '/single/file.js'
			}
		]

		render(<FolderTree tree={singleNodeTree} onSelect={mockOnSelect} />)

		expect(screen.getByText('SingleFile.js')).toBeInTheDocument()

		const typography = screen.getByTestId('typography')
		fireEvent.click(typography)

		expect(mockOnSelect).toHaveBeenCalledWith('/single/file.js')
	})

	it('should handle deeply nested tree structure', () => {
		const deepTree: FolderNode[] = [
			{
				id: 'root',
				name: 'root',
				fullPath: '/root',
				children: [
					{
						id: 'level1',
						name: 'level1',
						fullPath: '/root/level1',
						children: [
							{
								id: 'level2',
								name: 'level2.txt',
								fullPath: '/root/level1/level2.txt'
							}
						]
					}
				]
			}
		]

		render(<FolderTree tree={deepTree} onSelect={mockOnSelect} />)

		expect(screen.getByText('root')).toBeInTheDocument()
		expect(screen.getByText('level1')).toBeInTheDocument()
		expect(screen.getByText('level2.txt')).toBeInTheDocument()

		// Click the deepest nested item
		const deepTypography = screen.getAllByTestId('typography')[2]
		fireEvent.click(deepTypography)

		expect(mockOnSelect).toHaveBeenCalledWith('/root/level1/level2.txt')
	})

	it('should apply correct styling to Typography components', () => {
		render(<FolderTree tree={sampleTree} onSelect={mockOnSelect} />)

		const typographies = screen.getAllByTestId('typography')

		typographies.forEach((typography) => {
			const element = typography as HTMLElement
			expect(element.style.cursor).toBe('pointer')
			expect(element.style.userSelect).toBe('none')
			expect(element.style.padding).toBe('2px 4px')
		})
	})

	it('should render multiple root level nodes', () => {
		const multiRootTree: FolderNode[] = [
			{ id: 'a', name: 'A', fullPath: '/a' },
			{ id: 'b', name: 'B', fullPath: '/b' },
			{ id: 'c', name: 'C', fullPath: '/c' }
		]

		render(<FolderTree tree={multiRootTree} onSelect={mockOnSelect} />)

		expect(screen.getByText('A')).toBeInTheDocument()
		expect(screen.getByText('B')).toBeInTheDocument()
		expect(screen.getByText('C')).toBeInTheDocument()

		// Test clicking different root nodes
		const bTypography = screen.getAllByTestId('typography')[1]
		fireEvent.click(bTypography)
		expect(mockOnSelect).toHaveBeenCalledWith('/b')
	})
})
