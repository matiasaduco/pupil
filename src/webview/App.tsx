import PupilEditor from './components/PupilEditor/PupilEditor.js'
import PupilKeyboard from './components/PupilKeyboard/PupilKeyboard.js'
import { useRef } from 'react'
import { PupilEditorHandle } from './types/PupilEditorHandle.js'

const App = () => {
  const editorRef = useRef<PupilEditorHandle>(null)

  const handleKeyboardInput = (input: string) => {
    if (input === '{bksp}') {
      editorRef.current?.deleteAtCursor()
    } else if (input === '{enter}') {
      editorRef.current?.enterAtCursor()
    } else if (input === '{comment}') {
      editorRef.current?.commentAtCursor()
    } else {
      editorRef.current?.insertAtCursor(input)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PupilEditor ref={editorRef} />
      <PupilKeyboard onInput={handleKeyboardInput} />
    </div>
  )
}

export default App
