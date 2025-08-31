import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = 3000

// Resolve __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.join(__dirname, 'webview')))

app.listen(PORT, () => {
	console.log(`Eye Tracker running at http://localhost:${PORT}/eye-tracker.html`)
})
