import useSnippets from './hooks/useSnippets.js'
import Typography from '@mui/material/Typography'
import HtmlTooltip from '@mui/material/Tooltip'
import { Button } from '@mui/material'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { RefObject } from 'react'
import PupilDialog from '../PupilDialog/PupilDialog.js'

type SnippetsProps = {
	editorRef: RefObject<PupilEditorHandle | null>
	onSnippetPress?: (input: string | string[]) => void
}

const Snippets = ({ editorRef }: SnippetsProps) => {
	const { snippets, handleSnippetPress, open, openModal, onClose } = useSnippets(editorRef)

	return (
		<>
			<Button onClick={openModal}>Snippets</Button>
			<PupilDialog open={open} onClose={onClose} title="Snippets">
				<div className="flex flex-wrap gap-3 justify-center overflow-auto max-h-[30em]">
					{snippets?.all.flat().map((snippet) =>
						Object.entries(snippet.snippets).map(([key, { body, description }]) => (
							<HtmlTooltip
								title={
									<>
										<Typography color="inherit" fontWeight={600}>
											{description || ''}
										</Typography>
										<hr style={{ margin: '8px 0' }} />
										<Typography color="inherit" fontFamily="monospace" fontSize={14}>
											<pre
												style={{
													background: '#222',
													color: '#fff',
													padding: '8px',
													borderRadius: '6px',
													fontFamily: 'monospace',
													fontSize: 14,
													maxWidth: '30em',
													whiteSpace: 'pre-wrap'
												}}
											>
												{Array.isArray(body) ? body.join('\n') : body}
											</pre>
										</Typography>
									</>
								}
								placement="top"
								arrow
							>
								<Button
									className="w-[10em] h-[3em] truncate"
									key={key}
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
