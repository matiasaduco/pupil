import { Typography } from '@mui/material'

type TitleProps = {
	body: string | string[]
	description?: string
}

const TooltipTitle = ({ body, description }: TitleProps) => (
	<>
		<Typography color="inherit" fontWeight={600}>
			{description || ''}
		</Typography>
		<hr style={{ margin: '8px 0' }} />
		<Typography color="inherit" fontFamily="monospace" fontSize={14}>
			<pre className="snippetTooltip">{Array.isArray(body) ? body.join('\n') : body}</pre>
		</Typography>
	</>
)

export default TooltipTitle
