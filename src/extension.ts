import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	console.log('archit_Extension is active!');

	const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {

		if(document.languageId === 'cpp') {

			const filePath = document.fileName;

			exec(`g++ -std = c++17 "${filePath}" -o temp.exe`, (error, stdout, stderr) => {

				if(error) {
					vscode.window.showErrorMessage("Compilation Error: \n" + stderr);
				}
				else{
					vscode.window.showInformationMessage("Compilation Succesfull");
				}
			});
		}
	});

	context.subscriptions.push(saveListener);
}

export function deactivate() {}