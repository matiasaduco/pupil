import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilContainer from '@webview/components/PupilContainer/PupilContainer.js'
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
					<PupilContainer />
					<FolderTreeContainer />
				</StyledEngineProvider>
			</VsCodeApiProvider>
		</MockPupilEditorProvider>
	)
}

export default App
