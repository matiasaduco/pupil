import useScroll from './hooks/useScroll.js'
import useSnippets from './hooks/useSnippets.js'
import './Snippets.css'
import * as React from 'react'
import Typography from '@mui/material/Typography'
import HtmlTooltip from '@mui/material/Tooltip'
import { Button, IconButton } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'

type SnippetsProps = {
	onSnippetPress?: (input: string | string[]) => void
}

const Snippets = ({ onSnippetPress }: SnippetsProps) => {
	const { snippets } = useSnippets()
	const { containerRef, atStart, atEnd, startScroll, stopScroll } = useScroll()

	return (
		<section className="snippets-section">
			{!atStart && (
				<IconButton
					className="overflow-button left-0"
					onMouseEnter={() => startScroll('left')}
					onMouseLeave={stopScroll}
					color="primary"
					aria-label="Scroll left"
				>
					<ArrowBack />
				</IconButton>
			)}
			{!atEnd && (
				<IconButton
					className="overflow-button right-0"
					onMouseEnter={() => startScroll('right')}
					onMouseLeave={stopScroll}
					color="primary"
					aria-label="Scroll right"
				>
					<ArrowForward />
				</IconButton>
			)}
			<div ref={containerRef} className="snippets-container space-x-3 whitespace-nowrap">
				{snippets?.all.flat().map((snippet) =>
					Object.entries(snippet.snippets).map(([key, { body }]) => (
						<HtmlTooltip
							title={
								<React.Fragment>
									<Typography color="inherit">
										{snippet.snippets[key]?.description || ''}{' '}
									</Typography>
								</React.Fragment>
							}
							placement="top"
							arrow
						>
							<Button
								className="snippets-button"
								key={key}
								onClick={() => onSnippetPress?.(body)}
								style={{ margin: '0 3px 6px 0' }}
							>
								{key}
							</Button>
						</HtmlTooltip>
					))
				)}
			</div>
		</section>
	)
}

export default Snippets
