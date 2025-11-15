import './Snippets.css'
import useSnippets from './hooks/useSnippets.js'
import HtmlTooltip from '@mui/material/Tooltip'
import { Button } from '@mui/material'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import TooltipTitle from './components/TooltipTitle.js'
import HighlightableButton from '../Toolbar/components/HighlightableButton.js'

type SnippetsProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onSnippetPress?: (input: string | string[]) => void
	id: string
	highlightedButtonId: string | null
}

const Snippets = ({ editorRef, id, highlightedButtonId }: SnippetsProps) => {
	const { snippets, handleSnippetPress, open, openModal, onClose } = useSnippets(editorRef)

	return (
		<>
			<HighlightableButton
				id={id}
				highlightedButtonId={highlightedButtonId}
				onClick={openModal}
				label="Snippets"
			/>
			<PupilDialog open={open} onClose={onClose} title="Snippets">
				<div className="flex flex-wrap gap-3 justify-center overflow-auto max-h-[30em]">
					{snippets?.all.flat().map((snippet) =>
						Object.entries(snippet.snippets).map(([key, { body, description }]) => (
							<HtmlTooltip
								key={key}
								title={<TooltipTitle body={body} description={description} />}
								placement="top"
								arrow
							>
								<Button
									id={`snippet-${key}`}
									className="w-[10em] h-[3em] truncate"
									onClick={() => handleSnippetPress?.(body)}
									style={{ margin: '0 3px 6px 0' }}
								>
									{key}
								</Button>
							</HtmlTooltip>
						))
					)}
				</div>
			</PupilDialog>
		</>
	)
}

export default Snippets
