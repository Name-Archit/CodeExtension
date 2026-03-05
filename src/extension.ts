import * as vscode from 'vscode';
import { exec } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let compileVersion = 0;

export function activate(context: vscode.ExtensionContext) {

    diagnosticCollection = vscode.languages.createDiagnosticCollection('archit-cpp-checker');
    context.subscriptions.push(diagnosticCollection);

    vscode.workspace.onDidChangeTextDocument((event) => {
        diagnosticCollection.delete(event.document.uri);
    });

    const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {

        if (document.languageId !== 'cpp') return;

        const filePath = document.fileName;
        const text = document.getText();
        const lines = text.split('\n');

        compileVersion++;
        const currentVersion = compileVersion;

        exec(`g++ -std=c++17 "${filePath}" -o temp.exe`, (error, stdout, stderr) => {

            if (currentVersion !== compileVersion) return;

            const diagnostics: vscode.Diagnostic[] = [];

            // 🔴 Compile Errors (Red)
            if (error && stderr) {

                const errLines = stderr.split('\n');

                errLines.forEach(line => {

                    const match = line.match(/:(\d+):(\d+):\s+(error|warning):\s+(.*)/);

                    if (match) {

                        const lineNum = parseInt(match[1]) - 1;
                        const colNum = parseInt(match[2]) - 1;
                        const type = match[3];
                        const rawMessage = match[4];

                        const message = simplifyMessage(rawMessage);

                        const range = new vscode.Range(
                            new vscode.Position(lineNum, colNum),
                            new vscode.Position(lineNum, lines.length)
                        );

                        const severity =
                            type === "warning"
                                ? vscode.DiagnosticSeverity.Warning
                                : vscode.DiagnosticSeverity.Error;

                        const diagnostic = new vscode.Diagnostic(range, message, severity);
                        diagnostic.source = "Archit-AI";

                        diagnostics.push(diagnostic);
                    }
                });
            }

                // 🟡 Smart TLE Detection
                let loopLines: number[] = [];

                lines.forEach((line, index) => {
                    if (line.includes("for(") || line.includes("for (")) {
                        loopLines.push(index);
                    }
                });

                const nMatch = text.match(/int\s+n\s*=\s*(\d+)/);

            if (loopLines.length >= 2 && nMatch) {

                const nValue = parseInt(nMatch[1]);
                const loopDepth = loopLines.length;

                const estimatedOps = Math.pow(nValue, loopDepth);

                if (estimatedOps > 1e8) {

                    const complexityMsg =
                    `Possible O(N^${loopDepth}) complexity. Estimated operations ≈ ${estimatedOps}. Risk of TLE.`;

                    loopLines.forEach(lineIndex => {

                        const range = new vscode.Range(
                        new vscode.Position(lineIndex, 0),
                        new vscode.Position(lineIndex, lines[lineIndex].length)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        complexityMsg,
                        vscode.DiagnosticSeverity.Warning
                    );

                    diagnostic.source = "Archit-AI";
                    diagnostics.push(diagnostic);
                });

                vscode.window.showWarningMessage(
                    `⚠ Archit-AI: Estimated ${estimatedOps} operations (O(N^${loopDepth})). Likely TLE.`,
                    "Ignore"
                );
            }
        }
            // 🟢 AI Overflow Hint
            const intMultiplyRegex = /int\s+\w+\s*=\s*\w+\s*\*\s*\w+/;

            lines.forEach((line, index) => {
                if (intMultiplyRegex.test(line)) {

                    const range = new vscode.Range(
                        new vscode.Position(index, 0),
                        new vscode.Position(index, line.length)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        "AI Hint: Multiplying integers may overflow. Consider using long long.",
                        vscode.DiagnosticSeverity.Information
                    );

                    diagnostic.source = "Archit-AI";
                    diagnostics.push(diagnostic);
                }
            });

            diagnosticCollection.set(document.uri, diagnostics);
        });

    });

    context.subscriptions.push(saveListener);
}

function simplifyMessage(original: string): string {

    if (original.includes("expected ';'"))
        return "You might be missing a semicolon ';' here.";

    if (original.includes("was not declared"))
        return "This variable is not declared. Check spelling or declaration.";

    if (original.includes("no matching function"))
        return "Function call does not match its definition. Check parameters.";

    if (original.includes("invalid types"))
        return "You may be accessing something incorrectly (check indexing or object usage).";

    return "There is a mistake here. Check this line carefully.";
}

export function deactivate() {
    diagnosticCollection.clear();
}