import * as vscode from 'vscode'

class DocumentManager {
	static openTextDocument(document: vscode.TextDocument) {
		const content = document.getText()
		const fileName = document.fileName
		const fileExtension = fileName.split('.').pop() || ''

		return { content, fileName, fileExtension }
	}

	static updateTextDocument(document: vscode.TextDocument, value: string) {
		const edit = new vscode.WorkspaceEdit()
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		)
		edit.replace(document.uri, fullRange, value)
		return vscode.workspace.applyEdit(edit)
	}
}

export default DocumentManager
