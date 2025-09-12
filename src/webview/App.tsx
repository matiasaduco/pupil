import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilEditorContainer from '@components/PupilEditorContainer/PupilEditorContainer.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'
import MockPupilEditorProvider from './mocks/MockPupilProvider.js'

const App = () => {
	return (
		<MockPupilEditorProvider>
			<VsCodeApiProvider>
				<StyledEngineProvider enableCssLayer>
					<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
					<PupilEditorContainer />
				</StyledEngineProvider>
			</VsCodeApiProvider>
		</MockPupilEditorProvider>
	)
}

export default App
