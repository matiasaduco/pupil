import useScroll from './hooks/useScroll.js'
import useSnippets from './hooks/useSnippets.js'
import './Snippets.css'

type SnippetsProps = {
	onSnippetPress?: (input: string | string[]) => void
}

const Snippets = ({ onSnippetPress }: SnippetsProps) => {
	const { snippets } = useSnippets()
	const { containerRef, atStart, atEnd, startScroll, stopScroll } = useScroll()

	return (
		<section className="snippets-section">
			{!atStart && (
				<button
					className="overflow-button overflow-left"
					onMouseEnter={() => startScroll('left')}
					onMouseLeave={stopScroll}
					aria-label="Scroll left"
				>
					&#8592;
				</button>
			)}
			{!atEnd && (
				<button
					className="overflow-button overflow-right"
					onMouseEnter={() => startScroll('right')}
					onMouseLeave={stopScroll}
					aria-label="Scroll right"
				>
					&#8594;
				</button>
			)}
			<div ref={containerRef} className="snippets-container">
				{snippets?.all.flat().map((snippet) =>
					Object.entries(snippet.snippets).map(([key, { body }]) => (
						<button
							key={key}
							onClick={() => onSnippetPress?.(body)}
							style={{ margin: '0 3px 6px 0' }}
						>
							{key}
						</button>
					))
				)}
			</div>
		</section>
	)
}

export default Snippets
