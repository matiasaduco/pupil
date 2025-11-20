type SnippetCardProps = {
	id: string
	title: string
	description?: string
	body: string | string[]
	meta?: string
	badge?: string
	onSelect: () => void
}

const SnippetCard = ({ id, title, description, body, meta, badge, onSelect }: SnippetCardProps) => {
	const preview = Array.isArray(body) ? body.join('\n') : body

	return (
		<button type="button" id={id} className="snippet-card" onClick={onSelect}>
			<div className="snippet-card__header">
				<span className="snippet-card__title">{title}</span>
				{badge && <span className="snippet-card__badge">{badge}</span>}
			</div>
			{description && <p className="snippet-card__description">{description}</p>}
			<pre className="snippet-card__preview">{preview}</pre>
			{meta && <span className="snippet-card__meta">{meta}</span>}
		</button>
	)
}

export default SnippetCard
