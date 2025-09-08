import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilEditorContainer from '@components/PupilEditorContainer/PupilEditorContainer.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'

const App = () => {
	return (
		<VsCodeApiProvider>
			<StyledEngineProvider enableCssLayer>
				<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
				<PupilEditorContainer />
			</StyledEngineProvider>
		</VsCodeApiProvider>
	)
}

export default App
