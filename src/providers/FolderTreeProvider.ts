import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class VsCodeFolderNode extends vscode.TreeItem {
    constructor(
        public readonly fullPath: string
    ) {
        super(path.basename(fullPath),
              vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'folder';
        this.resourceUri = vscode.Uri.file(fullPath);
    }
}

export class FolderTreeProvider implements vscode.TreeDataProvider<VsCodeFolderNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<VsCodeFolderNode | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<VsCodeFolderNode | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: VsCodeFolderNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: VsCodeFolderNode): Thenable<VsCodeFolderNode[]> {
        const root = element
            ? element.fullPath
            : vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        if (!root) { return Promise.resolve([]); }

        const dirs = fs.readdirSync(root)
            .map(name => path.join(root, name))
            .filter(p =>
                fs.statSync(p).isDirectory() &&
                !p.includes('node_modules') &&
                !p.includes('public')
            )
            .map(p => new VsCodeFolderNode(p));

        return Promise.resolve(dirs);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
export default FolderTreeProvider;