import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilEditorContainer from '@components/PupilEditorContainer/PupilEditorContainer.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'
import MockPupilEditorProvider from './mocks/MockPupilProvider.js'
import FolderTreeContainer from './components/FolderTree/FolderTreeContainer.js' 

const App = () => {
	return (
		<MockPupilEditorProvider>
			<VsCodeApiProvider>
				<StyledEngineProvider enableCssLayer>
					<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
					<PupilEditorContainer />	
					<FolderTreeContainer />				
				</StyledEngineProvider>
			</VsCodeApiProvider>
		</MockPupilEditorProvider>
	)
}

export default App
