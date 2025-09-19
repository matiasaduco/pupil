import { useState, useEffect } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, RadioGroup, FormControlLabel, Radio} from '@mui/material'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'

const CreateButton = () => {
  const vscode = useVsCodeApi()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'file' | 'folder'>('file')
  const [coords, setCoords] = useState({ x: 0, y: 0 })

 
  useEffect(() => {
    const handleMiddleClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
        setCoords({ x: e.clientX, y: e.clientY })
        setOpen(true)
      }
    }

    window.addEventListener('mouseup', handleMiddleClick, true)
    return () => window.removeEventListener('mouseup', handleMiddleClick, true)
  }, [])

  const handleConfirm = () => {
    vscode.postMessage({ type: `create-${type}`, name })
    setOpen(false)
    setName('')
    setType('file')
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            position: 'absolute',
            top: coords.y,
            left: coords.x,
            transform: 'translate(-50%, -50%)', // center on cursor
            backgroundColor: '#2b2b2b',
            color: '#fff',
            pointerEvents: 'auto'
          }
        }}
      >
        <DialogTitle>Create New {type === 'file' ? 'File' : 'Folder'}</DialogTitle>
        <DialogContent>
          <RadioGroup row value={type} onChange={(e) => setType(e.target.value as 'file' | 'folder')} sx={{ mb: 2 }}>
            <FormControlLabel value="file" control={<Radio sx={{ color: '#fff' }} />} label="File" sx={{ color: '#fff' }}/>
            <FormControlLabel value="folder" control={<Radio sx={{ color: '#fff' }} />} label="Folder" sx={{ color: '#fff' }}/>
          </RadioGroup>

          <TextField autoFocus margin="dense" label={`${type === 'file' ? 'File' : 'Folder'} name`} fullWidth variant="outlined" value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#aaa' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button  onClick={handleConfirm} disabled={!name.trim()} sx={{ color: '#fff' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CreateButton
