import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    console.log('archit-extension ACTIVATED');

    const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {

        console.log("File saved:", document.fileName);
        console.log("Language:", document.languageId);

        if (document.languageId === 'cpp') {

            vscode.window.showInformationMessage("C++ File Detected");

            const filePath = document.fileName;

            exec(`g++ -std=c++17 "${filePath}" -o temp.exe`, (error, stdout, stderr) => {

                console.log("STDERR:", stderr);
                console.log("STDOUT:", stdout);

                if (error) {
                    vscode.window.showErrorMessage("Compilation Error");
                } else {
                    vscode.window.showInformationMessage("Compilation Successful!");
                }
            });
        }
    });

    context.subscriptions.push(saveListener);
}

export function deactivate() {}