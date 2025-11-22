import { useMonaco } from '@monaco-editor/react'
import { Ref, useImperativeHandle, useRef } from 'react'
import type { editor } from 'monaco-editor'
import { PupilEditorHandle } from '@webview/types/PupilEditorHandle.js'
import { MonacoInlineCompletionProvider } from '@webview/utils/monacoInlineCompletionProvider.js'
import { useVsCodeApi } from '@webview/contexts/VsCodeApiContext.js'

const useForwardRef = (ref?: Ref<PupilEditorHandle>) => {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
	const monaco = useMonaco()
	const vscodeApi = useVsCodeApi()

	// Inserta una lista de strings, selecciona el bloque y lo comenta
	const insertCommentBlockAtCursor = (texts: string[]) => {
		const editor = editorRef.current
		if (!editor || !monaco) {
			return
		}

		// Guardar posición inicial antes de insertar
		const startPosition = editor.getPosition()
		if (!startPosition) {
			return
		}

		insertMultipleAtCursor(texts)

		// Obtener posición final después de insertar
		const endPosition = editor.getPosition()
		if (!endPosition) {
			return
		}

		// Seleccionar el bloque insertado
		editor.setSelection(
			new monaco.Selection(
				startPosition.lineNumber,
				1,
				endPosition.lineNumber,
				editor.getModel()?.getLineMaxColumn(endPosition.lineNumber) || 1
			)
		)

		// Comentar el bloque seleccionado
		commentAtCursor()
	}

	const handleOnMount = (editor: editor.IStandaloneCodeEditor) => {
		editorRef.current = editor

		// Register inline completion provider
		if (monaco) {
			try {
				const provider = new MonacoInlineCompletionProvider(vscodeApi)
				// Register for common programming languages
				const languages = [
					'javascript',
					'typescript',
					'python',
					'java',
					'csharp',
					'cpp',
					'c',
					'go',
					'rust',
					'php',
					'ruby'
				]
				languages.forEach((lang) => {
					monaco.languages.registerInlineCompletionsProvider(lang, provider)
				})
				console.log('Inline completion provider registered successfully')
			} catch (error) {
				console.error('Failed to register inline completion provider:', error)
			}
		}
	}

	const getCursorPosition = () => {
		const pos = editorRef.current?.getPosition()
		if (pos && typeof pos.lineNumber === 'number' && typeof pos.column === 'number') {
			return { lineNumber: pos.lineNumber, column: pos.column }
		}
		return undefined
	}

	const insertMultipleAtCursor = (texts: string[]) => {
		// If the provided lines look like a snippet (contain placeholders/tabstops),
		// insert them as a single snippet so placeholders/tabstops work across lines.
		const joined = texts.join('\n')
		const looksLikeSnippet = /\$(?:\d+|\{)/.test(joined)
		if (looksLikeSnippet) {
			insertAtCursor(joined)
			return
		}
		texts.forEach((line, index) => {
			insertAtCursor(line)
			if (index < texts.length - 1) {
				enterAtCursor()
			}
		})
	}

	const insertAtCursor = (text: string) => {
		const editor = editorRef.current
		const position = editor?.getPosition()
		const selection = editor?.getSelection()

		// Si hay selección activa, reemplazarla
		if (selection && !selection.isEmpty() && editor) {
			editor.executeEdits(null, [
				{
					range: selection,
					text,
					forceMoveMarkers: true
				}
			])

			// Mover el cursor al final del texto insertado
			const endPosition = editor.getPosition()
			if (endPosition) {
				editor.setPosition({
					lineNumber: endPosition.lineNumber,
					column: endPosition.column + text.length
				})
			}

			setTimeout(() => editor.focus(), 0)

			return
		}

		if (monaco && editor && position) {
			// If the text looks like a snippet (contains $1, ${1:}, choices, etc.) try
			// to use Monaco's snippet controller so placeholders/tabstops work like in VS Code.
			const looksLikeSnippet = /\$(?:\d+|\{)/.test(text)
			if (looksLikeSnippet) {
				// snippetController2 is the Monaco contribution that handles snippets
				try {
					const contribHost = editor as unknown as { getContribution: (id: string) => unknown }
					const snippetController = contribHost.getContribution('snippetController2')
					if (
						snippetController &&
						typeof (snippetController as { insert?: unknown }).insert === 'function'
					) {
						;(snippetController as { insert: (s: string) => void }).insert(text)
						editor.focus()
						return
					}
				} catch {
					// ignore and fall back to plain insert
				}
			}
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
		const selection = editor?.getSelection()

		if (monaco && editor && position && selection) {
			// Si hay selección activa (más de un carácter o varias líneas)
			if (!selection.isEmpty()) {
				editor.executeEdits(null, [
					{
						range: selection,
						text: '',
						forceMoveMarkers: true
					}
				])

				// Mover el cursor al inicio de la selección borrada
				editor.setPosition({
					lineNumber: selection.startLineNumber,
					column: selection.startColumn
				})

				setTimeout(() => editor.focus(), 0)

				return
			}

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

						setTimeout(() => editor.focus(), 0)
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

			setTimeout(() => editor.focus(), 0)
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

				setTimeout(() => editor.focus(), 0)
			}
		}
	}

	const commentAtCursor = () => {
		const editor = editorRef.current
		const position = editor?.getPosition()
		const selection = editor?.getSelection()

		if (monaco && editor && position) {
			const model = editor.getModel()
			if (model) {
				let startLine = position.lineNumber
				let endLine = position.lineNumber
				if (selection && !selection.isEmpty()) {
					startLine = selection.startLineNumber
					endLine = selection.endLineNumber
				}

				// Detectar si todas las líneas están comentadas
				let allCommented = true
				for (let i = startLine; i <= endLine; i++) {
					const lineContent = model.getLineContent(i).trim()
					if (!lineContent.startsWith('//')) {
						allCommented = false
						break
					}
				}

				const edits = []
				for (let i = startLine; i <= endLine; i++) {
					const lineContent = model.getLineContent(i)
					let newText
					if (allCommented) {
						// Descomentar
						newText = lineContent.replace(/^\s*\/\//, '')
					} else {
						// Comentar
						newText = '//' + lineContent
					}
					edits.push({
						range: new monaco.Range(i, 1, i, lineContent.length + 1),
						text: newText,
						forceMoveMarkers: true
					})
				}
				editor.executeEdits(null, edits)

				// Ajustar la posición del cursor
				if (selection && !selection.isEmpty()) {
					// Mantener la selección
					editor.setSelection(
						new monaco.Selection(startLine, 1, endLine, model.getLineMaxColumn(endLine))
					)
				} else {
					// Mantener la posición del cursor en la línea actual
					editor.setPosition({
						lineNumber: position.lineNumber,
						column: position.column + (allCommented ? -2 : 2)
					})
				}

				setTimeout(() => editor.focus(), 0)
			}
		}
	}

	const copySelection = () => {
		const editor = editorRef.current
		const selection = editor?.getSelection()
		const model = editor?.getModel()
		if (editor && selection && model && !selection.isEmpty()) {
			const selectedText = model.getValueInRange(selection)
			if (selectedText) {
				navigator.clipboard.writeText(selectedText)
			}
		}
	}

	const pasteClipboard = async () => {
		const editor = editorRef.current
		if (editor) {
			const clipboardText = await navigator.clipboard.readText()
			if (clipboardText) {
				insertAtCursor(clipboardText)
			}
		}
	}

	const cutSelection = () => {
		const editor = editorRef.current
		const selection = editor?.getSelection()
		const model = editor?.getModel()
		if (editor && selection && model && !selection.isEmpty()) {
			const selectedText = model.getValueInRange(selection)
			if (selectedText) {
				navigator.clipboard.writeText(selectedText)
				// Borrar la selección del editor
				editor.executeEdits(null, [
					{
						range: selection,
						text: '',
						forceMoveMarkers: true
					}
				])

				// Mover el cursor al inicio de la selección cortada
				editor.setPosition({
					lineNumber: selection.startLineNumber,
					column: selection.startColumn
				})

				setTimeout(() => editor.focus(), 0)
			}
		}
	}

	useImperativeHandle(
		ref,
		() => ({
			getCursorPosition,
			insertAtCursor,
			insertMultipleAtCursor,
			insertCommentBlockAtCursor,
			deleteAtCursor,
			enterAtCursor,
			commentAtCursor,
			copySelection,
			pasteClipboard,
			cutSelection,
			focus: () => editorRef.current?.focus(),
			undo: () => editorRef.current?.trigger('keyboard', 'undo', {}),
			redo: () => editorRef.current?.trigger('keyboard', 'redo', {})
		}),
		[monaco]
	)

	return { handleOnMount }
}

export default useForwardRef
