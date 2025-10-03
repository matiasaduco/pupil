import './App.css'
import { VsCodeApiProvider } from './contexts/VsCodeApiContext.js'
import PupilContainer from '@webview/components/PupilContainer/PupilContainer.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/styled-engine'
import MockPupilEditorProvider from './mocks/MockPupilProvider.js'
import FolderTreeContainer from './components/FolderTree/FolderTreeContainer.js'
import { KeyboardFocusProvider } from './contexts/KeyboardFocusContext.js'

const App = () => {
  return (
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <MockPupilEditorProvider>
        <VsCodeApiProvider>
          <KeyboardFocusProvider>
            <PupilContainer />
            <FolderTreeContainer />
          </KeyboardFocusProvider>
        </VsCodeApiProvider>
      </MockPupilEditorProvider>
    </StyledEngineProvider>
  )
}

export default App