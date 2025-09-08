import useScroll from './hooks/useScroll.js'
import useSnippets from './hooks/useSnippets.js'
import './Snippets.css'
import { useEffect } from 'react'
import * as React from 'react'
import Typography from '@mui/material/Typography'
import HtmlTooltip from '@mui/material/Tooltip'
import { Button } from '@mui/material'

type SnippetsProps = {
	onSnippetPress?: (input: string | string[]) => void
}

const Snippets = ({ onSnippetPress }: SnippetsProps) => {
	const { snippets } = useSnippets()
	const { containerRef, atStart, atEnd, startScroll, stopScroll, checkScrollPosition } = useScroll()

	useEffect(() => {
		if (containerRef.current) {
			checkScrollPosition()
		}
	}, [containerRef, checkScrollPosition])

	return (
		<section className="snippets-section">
			{!atStart && (
				<Button
					className="overflow-button left-0"
					onMouseEnter={() => startScroll('left')}
					onMouseLeave={stopScroll}
					aria-label="Scroll left"
				>
					&#8592;
				</Button>
			)}
			{!atEnd && (
				<Button
					className="overflow-button right-0"
					onMouseEnter={() => startScroll('right')}
					onMouseLeave={stopScroll}
					aria-label="Scroll right"
				>
					&#8594;
				</Button>
			)}
			<div
				ref={containerRef}
				className="snippets-container !bg-white flex space-x-3 overflow-x-auto whitespace-nowrap py-2 px-2"
			>
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
								className="snippets-button !bg-white !border !border-gray-200 hover:!bg-gray-400 active:!bg-gray-500"
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
