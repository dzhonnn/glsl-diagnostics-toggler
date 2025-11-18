import * as vscode from 'vscode';


let statusBarItem: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
	statusBarItem.command = 'glsl-diagnostics-toggler.toggle'
	statusBarItem.tooltip = 'Toggle GLSL Diagnostics (webgl-glsl-editor)'
	context.subscriptions.push(statusBarItem)

	const updateStatusBarVisibility = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			statusBarItem.hide()
			return
		}

		const langId = editor.document.languageId
		const fileName = editor.document.fileName

		const isGLSL = langId === 'glsl' ||
		 fileName.endsWith('.glsl') ||
		 fileName.endsWith('.vert') ||
		 fileName.endsWith('.frag')

		if (isGLSL) {
			updateStatusBarText()
			statusBarItem.show()
		} else {
			statusBarItem.hide()
		}
	}

	const updateStatusBarText = () => {
		const config = vscode.workspace.getConfiguration('webgl-glsl-editor')
		const enabled = config.get<boolean>('diagnostics', true)
		statusBarItem.text = enabled ? '$(light-bulb) GLSL Diagnostics: ON' : '$(circle-slash) GLSL Diagnostics: OFF'
	}

	const toggleDiagnostics = () => {
		const config = vscode.workspace.getConfiguration('webgl-glsl-editor')
		const currentValue = config.get<boolean>('diagnostics', true)
		config.update('diagnostics', !currentValue, vscode.ConfigurationTarget.Global)
			.then(() => updateStatusBarText())
	}

	updateStatusBarText()
	context.subscriptions.push(
		vscode.commands.registerCommand('glsl-diagnostics-toggler.toggle', toggleDiagnostics),
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility),
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('webgl-glsl-editor.diagnostics')) {
				updateStatusBarText()
			}
		})
	)

	updateStatusBarVisibility()
}

export function deactivate() {}
