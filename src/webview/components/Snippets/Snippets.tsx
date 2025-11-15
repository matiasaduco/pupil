import './Snippets.css'
import useSnippets from './hooks/useSnippets.js'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject, useMemo, useState } from 'react'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import SnippetCard from './components/SnippetCard.js'
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder'
import ToolbarButton from '../Toolbar/components/ToolbarButton.js'
import HighlightableButton from '../Toolbar/components/HighlightableButton.js'

type SnippetsProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onSnippetPress?: (input: string | string[]) => void
	id: string
	highlightedButtonId: string | null
}

const FILTERS = [
	{ id: 'all', label: 'Todos' },
	{ id: 'user', label: 'Usuario' },
	{ id: 'extension', label: 'Extensión' },
	{ id: 'builtin', label: 'Builtin' }
] as const

type SnippetFilter = (typeof FILTERS)[number]['id']

const Snippets = ({ editorRef, id, highlightedButtonId, onSnippetPress }: SnippetsProps) => {
	const { snippets, handleSnippetPress, open, openModal, onClose } = useSnippets(editorRef)
	const [filter, setFilter] = useState<SnippetFilter>('all')
	const insertSnippet = onSnippetPress ?? handleSnippetPress

	const snippetGroups = useMemo(() => {
		if (!snippets) {
			return []
		}

		if (filter === 'all') {
			return snippets.all ?? []
		}

		return snippets[filter] ?? []
	}, [snippets, filter])

	const flattenedSnippets = useMemo(
		() =>
			snippetGroups.flatMap((snippetGroup) =>
				Object.entries(snippetGroup.snippets).map(([key, value]) => ({
					id: key,
					body: value.body,
					description: value.description,
					file: snippetGroup.file,
					source: snippetGroup.extension
				}))
			),
		[snippetGroups]
	)

	return (
		<>
			<ToolbarButton
				id={id}
				tooltipTitle="Snippets"
				icon={<SnippetFolderIcon fontSize="small" />}
				onButtonClick={openModal}
				active={highlightedButtonId === id}
			/>
			<PupilDialog open={open} onClose={onClose} title="Snippets">
				<div className="snippets-dialog">
					<div className="snippets-filter" role="group" aria-label="Filtrar snippets">
						{FILTERS.map((option) => (
							<button
								key={option.id}
								type="button"
								className={`snippets-filterButton${filter === option.id ? ' is-active' : ''}`}
								onClick={() => setFilter(option.id)}
							>
								{option.label}
							</button>
						))}
					</div>
					<div className="snippets-grid">
						{flattenedSnippets.length === 0 ? (
							<p className="snippets-empty">No hay snippets para este filtro.</p>
						) : (
							flattenedSnippets.map((snippet) => (
								<SnippetCard
									key={`${snippet.id}-${snippet.file}`}
									id={`snippet-${snippet.id}`}
									title={snippet.id}
									description={snippet.description}
									body={snippet.body}
									meta={snippet.file}
									badge={filter === 'all' ? snippet.source : undefined}
									onSelect={() => insertSnippet(snippet.body)}
								/>
							))
						)}
					</div>
				</div>
			</PupilDialog>
		</>
	)
}

export default Snippets
