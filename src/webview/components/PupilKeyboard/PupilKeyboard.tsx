import './PupilKeyboard.css'
import usePupilKeyboard from './hooks/usePupilKeyboard.js'
import clsx from 'clsx'
import HighlightableButton from '../Toolbar/components/HighlightableButton.js'
import useTypeWithBlink from '../../../hooks/useTypeWithBlink.js'
import { IconButton } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'

type PupilKeyboardProps = {
	onInput?: (input: string) => void
	visible: boolean
	'data-testid'?: string
	highlightDelayMs?: number
	highlightGapMs?: number
}

const PupilKeyboard = ({
	onInput,
	visible,
	'data-testid': testId,
	highlightDelayMs,
	highlightGapMs
}: PupilKeyboardProps) => {
	const { layout, handleKeyPress, clickedKey } = usePupilKeyboard(onInput)
	const {
		highlightedButtonId,
		isHighlighting,
		nextButtonId,
		toggleHighlightSequence,
		registerButton
	} = useTypeWithBlink(highlightDelayMs, highlightGapMs)

	if (!visible) {
		return null
	}

	return (
		<div
			className="grid grid-cols-30 gap-1 bg-gray-400 rounded p-2"
			style={{ height: 'min(30vh, 220px)' }}
			data-testid={testId}
		>
			<IconButton data-testid="start-highlight-sequence" onClick={toggleHighlightSequence}>
				{isHighlighting ? <StopIcon /> : <PlayArrowIcon />}
			</IconButton>
			{layout.map((key, index) => (
				<HighlightableButton
					id={nextButtonId()}
					key={`${key.value}-${index}`}
					registerButton={registerButton}
					onClick={() => handleKeyPress(key)}
					className={clsx('pupil-keyboard-btn border-2', {
						'border-amber-500!': key.value === clickedKey
					})}
					sx={{
						gridColumn: `span ${key.col || 2} / span ${key.col || 2}`,
						textTransform: 'unset'
					}}
					label={key.icon ? <key.icon /> : key.label || key.value}
					highlightedButtonId={highlightedButtonId}
				/>
			))}
		</div>
	)
}

export default PupilKeyboard
