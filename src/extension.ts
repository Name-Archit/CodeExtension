import * as vscode from 'vscode';
import { exec } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {

    console.log('archit-extension ACTIVATED');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('archit-cpp-checker');
    context.subscriptions.push(diagnosticCollection);

    const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {

        if (document.languageId !== 'cpp') return;

        const filePath = document.fileName;

        exec(`g++ -std=c++17 "${filePath}" -o temp.exe`, (error, stdout, stderr) => {
            
            diagnosticCollection.delete(document.uri);

            const diagnostics: vscode.Diagnostic[] = [];

            if (error && stderr) {

                const lines = stderr.split('\n');

                lines.forEach(line => {
                    
                    const match = line.match(/:(\d+):(\d+):\s+(error| warning):\s+(.*)/);

                    if (match) {
                        const lineNum = parseInt(match[1]) - 1;
                        const colNum = parseInt(match[2]) - 1;
                        const type = match[3];
                        const rawMessage = match[4];

                        const message = simplifyMessage(rawMessage);

                        const range = new vscode.Range(
                            new vscode.Position(lineNum, colNum),
                            new vscode.Position(lineNum, colNum + 1)
                        );

                        const severity =
                            type === "warning"? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;

                        const diagnostic = new vscode.Diagnostic(
                            range,
                            message,
                            severity
                        );

                        diagnostics.push(diagnostic);
                    }
                });
            }
            
            diagnosticCollection.set(document.uri, diagnostics);
        });

    });

    context.subscriptions.push(saveListener);
}

function simplifyMessage(original: string): string {

    if (original.includes("expected ';'")) {
        return "You might be missing a semicolon ';' here.";
    }

    if (original.includes("was not declared")) {
        return "This variable is not declared. Check spelling or declaration.";
    }

    if (original.includes("no matching function")) {
        return "Function call does not match its definition. Check parameters.";
    }

    if (original.includes("invalid types")) {
        return "You may be accessing something incorrectly (check indexing or object usage).";
    }

    return "There is a mistake here. Check this line carefully.";
}

export function deactivate() {
    diagnosticCollection.clear();
}