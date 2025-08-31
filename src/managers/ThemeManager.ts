import * as vscode from 'vscode'

abstract class ThemeManager {
	static getCurrentTheme() {
		const themeKind = vscode.window.activeColorTheme.kind

		switch (themeKind) {
			case vscode.ColorThemeKind.Dark:
				return 'vs-dark'
			case vscode.ColorThemeKind.HighContrast:
				return 'hc-black'
			default:
				return 'vs'
		}
	}
}

export default ThemeManager
