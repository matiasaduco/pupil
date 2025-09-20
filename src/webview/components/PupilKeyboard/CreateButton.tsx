// CreateButton.tsx
import { useState } from 'react'
import { Button } from '@mui/material'
import CreateDialog from './CreateDialog.js'

const CreateButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
      >
        New File/Folder
      </Button>

      <CreateDialog
        externalOpen={open}
        onExternalClose={() => setOpen(false)}
      />
    </>
  )
}

export default CreateButton
