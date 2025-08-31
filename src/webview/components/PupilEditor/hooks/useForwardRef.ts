import { useMonaco } from '@monaco-editor/react'
import { Ref, useImperativeHandle, useRef } from 'react'
import type { editor } from 'monaco-editor'
import { PupilEditorHandle } from '../../../types/PupilEditorHandle.js'

const useForwardRef = (ref?: Ref<PupilEditorHandle>) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  const handleOnMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const getCursorPosition = () => {
    const pos = editorRef.current?.getPosition()
    if (pos && typeof pos.lineNumber === 'number' && typeof pos.column === 'number') {
      return { lineNumber: pos.lineNumber, column: pos.column }
    }
    return undefined
  }

  const insertAtCursor = (text: string) => {
    const editor = editorRef.current
    const position = editor?.getPosition()

    if (monaco && editor && position) {
      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      )

      editor.executeEdits(null, [
        {
          range,
          text,
          forceMoveMarkers: true
        }
      ])

      editor.focus()

      setTimeout(() => {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {})
      }, 0)
    }
  }

  const deleteAtCursor = () => {
    const editor = editorRef.current
    const position = editor?.getPosition()

    if (monaco && editor && position) {
      if (position.column === 1) {
        // Si no es la primera línea, unir con la anterior
        if (position.lineNumber > 1) {
          const model = editor.getModel()
          if (model) {
            const prevLine = position.lineNumber - 1
            const prevLineLength = model.getLineLength(prevLine)

            // Rango desde el final de la línea anterior hasta el inicio de la actual
            const range = new monaco.Range(prevLine, prevLineLength + 1, position.lineNumber, 1)

            editor.executeEdits(null, [
              {
                range,
                text: '',
                forceMoveMarkers: true
              }
            ])

            // Mover el cursor al final de la línea anterior
            editor.setPosition({ lineNumber: prevLine, column: prevLineLength + 1 })
            setTimeout(() => {
              editor.focus()
            }, 0)
          }
        }
        return
      }

      // Borrar el carácter anterior al cursor
      const range = new monaco.Range(
        position.lineNumber,
        position.column - 1,
        position.lineNumber,
        position.column
      )

      editor.executeEdits(null, [
        {
          range,
          text: '',
          forceMoveMarkers: true
        }
      ])

      setTimeout(() => {
        editor.focus()
      }, 0)
    }
  }

  const enterAtCursor = () => {
    const editor = editorRef.current
    const position = editor?.getPosition()

    if (monaco && editor && position) {
      const model = editor.getModel()
      if (model) {
        const lineContent = model.getLineContent(position.lineNumber)
        // Detectar indentación (espacios o tabs al inicio de la línea)
        const indentMatch = lineContent.match(/^(\s*)/)
        const indent = indentMatch ? indentMatch[1] : ''
        // Insertar salto de línea y la indentación
        const text = '\n' + indent
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        )

        editor.executeEdits(null, [
          {
            range,
            text,
            forceMoveMarkers: true
          }
        ])

        // Mover el cursor a la nueva línea, después de la indentación
        editor.setPosition({
          lineNumber: position.lineNumber + 1,
          column: indent.length + 1
        })

        setTimeout(() => {
          editor.focus()
        }, 0)
      }
    }
  }

  const commentAtCursor = () => {
    const editor = editorRef.current
    const position = editor?.getPosition()

    if (monaco && editor && position) {
      const model = editor.getModel()
      if (model) {
        const lineContent = model.getLineContent(position.lineNumber)
        const trimmedLine = lineContent.trim()
        let newText: string
        let cursorOffset: number

        if (trimmedLine.startsWith('//')) {
          // Si ya está comentada, descomentar
          newText = lineContent.replace('//', '')
          cursorOffset = -2 // Ajuste del cursor al eliminar "//"
        } else {
          // Comentar la línea
          newText = '//' + lineContent
          cursorOffset = 2 // Ajuste del cursor al agregar "//"
        }

        const range = new monaco.Range(
          position.lineNumber,
          1,
          position.lineNumber,
          lineContent.length + 1
        )

        editor.executeEdits(null, [
          {
            range,
            text: newText,
            forceMoveMarkers: true
          }
        ])

        // Ajustar la posición del cursor
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + cursorOffset
        })

        setTimeout(() => {
          editor.focus()
        }, 0)
      }
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      getCursorPosition,
      insertAtCursor,
      deleteAtCursor,
      enterAtCursor,
      commentAtCursor
    }),
    [monaco]
  )

  return { handleOnMount }
}

export default useForwardRef
