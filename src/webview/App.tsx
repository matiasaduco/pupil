import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilEditorContainer from './components/PupilEditorContainer/PupilEditorContainer.js'

const App = () => {
	return (
		<VsCodeApiProvider>
			<PupilEditorContainer />
		</VsCodeApiProvider>
	)
}

export default App
