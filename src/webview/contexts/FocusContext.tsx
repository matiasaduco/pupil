import React, { createContext, useContext, useState } from 'react'

export type FocusType = 'editor' | 'terminal' | 'simpleBrowser' | 'createFileFolder'

type FocusContextType = {
  focus: FocusType
  setFocus: (focus: FocusType) => void
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focus, setFocus] = useState<FocusType>('editor')

  return (
    <FocusContext.Provider value={{ focus, setFocus }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}