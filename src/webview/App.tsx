import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilEditorContainer from '@components/PupilEditorContainer/PupilEditorContainer.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'
import { DebuggerProvider } from './contexts/DebuggerContext.js'

const App = () => {
	return (
		<DebuggerProvider>
			<VsCodeApiProvider>
				<StyledEngineProvider enableCssLayer>
					<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
					<PupilEditorContainer />
				</StyledEngineProvider>
			</VsCodeApiProvider>
		</DebuggerProvider>
	)
}

export default App
