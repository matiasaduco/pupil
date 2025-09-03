import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

type SnippetType = 'user' | 'extension' | 'builtin'

abstract class SnippetManager {
	static getAllSnippets() {
		const user = SnippetManager.getUserSnippets()
		const extension = SnippetManager.getExtensionSnippets()
		const builtin = SnippetManager.getBuiltinSnippets()

		return {
			user,
			extension,
			builtin,
			all: [...user, ...extension, ...builtin]
		}
	}

	private static getUserSnippets(): unknown[] {
		const dir = this.getSnippetsDir('user')
		const files = fs
			.readdirSync(dir)
			.filter((f) => f.endsWith('.json') || f.endsWith('.code-snippets'))

		const snippets: unknown[] = []
		for (const file of files) {
			const content = fs.readFileSync(path.join(dir, file), 'utf-8')
			try {
				const parsed = JSON.parse(content)
				snippets.push({ file, snippets: parsed })
			} catch (e) {
				console.error(`Error leyendo ${file}:`, e)
			}
		}

		return snippets
	}

	private static getExtensionSnippets(): unknown[] {
		const extensionsDir = this.getSnippetsDir('extension')
		const extensions = fs.readdirSync(extensionsDir)
		const snippets: unknown[] = []

		for (const ext of extensions) {
			const snippetDir = path.join(extensionsDir, ext, 'snippets')
			if (!fs.existsSync(snippetDir)) {
				continue
			}

			const files = fs
				.readdirSync(snippetDir)
				.filter((f) => f.endsWith('.json') || f.endsWith('.code-snippets'))

			for (const file of files) {
				const fullPath = path.join(snippetDir, file)
				try {
					const content = fs.readFileSync(fullPath, 'utf-8')
					const parsed = JSON.parse(content)
					snippets.push({ extension: ext, file, snippets: parsed })
				} catch (e) {
					console.error(`Error leyendo ${fullPath}:`, e)
				}
			}
		}

		return snippets
	}

	private static getBuiltinSnippets(): unknown[] {
		const baseDir = this.getSnippetsDir('builtin')
		const extensions = fs.readdirSync(baseDir)
		const snippets: unknown[] = []

		for (const ext of extensions) {
			const snippetDir = path.join(baseDir, ext, 'snippets')
			if (!fs.existsSync(snippetDir)) {
				continue
			}

			const files = fs
				.readdirSync(snippetDir)
				.filter((f) => f.endsWith('.json') || f.endsWith('.code-snippets'))

			for (const file of files) {
				const fullPath = path.join(snippetDir, file)
				try {
					const content = fs.readFileSync(fullPath, 'utf-8')
					const parsed = JSON.parse(content)
					snippets.push({ extension: ext, file, snippets: parsed })
				} catch (e) {
					console.error(`Error leyendo ${fullPath}:`, e)
				}
			}
		}

		return snippets
	}

	private static getSnippetsDir(type: SnippetType): string {
		const basePaths = this.getBasePaths(process.platform)
		return path.join(...basePaths[type])
	}

	private static getBasePaths(platform: string) {
		switch (platform) {
			case 'win32':
				const vscodeExe = process.execPath; 
      			const vscodeDir = path.dirname(vscodeExe); 
      			const builtinPath = path.join(vscodeDir, "resources", "app", "extensions");
				return {
					user: [process.env.APPDATA!, 'Code', 'User', 'snippets'],
					extension: [process.env.USERPROFILE!, '.vscode', 'extensions'],
					builtin: [builtinPath]
				}
			case 'darwin':
				return {
					user: [os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'snippets'],
					extension: [os.homedir(), '.vscode', 'extensions'],
					builtin: ['/Applications/Visual Studio Code.app/Contents/Resources/app/extensions']
				}
			default:
				return {
					user: [os.homedir(), '.config', 'Code', 'User', 'snippets'],
					extension: [os.homedir(), '.vscode', 'extensions'],
					builtin: ['/usr/share/code/resources/app/extensions']
				}
		}
	}
}

export default SnippetManager
