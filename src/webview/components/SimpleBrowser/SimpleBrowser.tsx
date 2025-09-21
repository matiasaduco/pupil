import { Button } from '@mui/material'
import PupilDialog from '../PupilDialog/PupilDialog.js'
import { useState } from 'react'

type SimpleBrowserProps = {
	onClick: (url: string, port: string) => void
}

const SimpleBrowser = ({ onClick }: SimpleBrowserProps) => {
	const [open, setOpen] = useState<boolean>(false)
	const [url, setUrl] = useState<string>('http://localhost')
	const [port, setPort] = useState<string>('3000')

	return (
		<>
			<Button onClick={() => setOpen(true)}>Browser</Button>
			<PupilDialog open={open} title="Simple Browser" onClose={() => setOpen(false)}>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label htmlFor="url" className="font-medium">
							URL
						</label>
						<input
							id="url"
							type="text"
							placeholder="http://localhost"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="border border-gray-300 rounded p-2"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="port" className="font-medium">
							Port
						</label>
						<input
							id="port"
							type="text"
							placeholder="3000"
							value={port}
							onChange={(e) => setPort(e.target.value)}
							className="border border-gray-300 rounded p-2"
						/>
					</div>
					<Button
						variant="contained"
						onClick={() => {
							onClick(url, port)
							setOpen(false)
						}}
					>
						Open Browser
					</Button>
				</div>
			</PupilDialog>
		</>
	)
}

export default SimpleBrowser
