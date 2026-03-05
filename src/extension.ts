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

            diagnosticCollection.set(document.uri, diagnostics);

            if (diagnostics.length >= 3) {

                vscode.window.showInformationMessage(
                    `Archit-AI detected ${diagnostics.length} issues. Fix automatically with AI?`,
                    "Fix with AI",
                    "Ignore"
                ).then(selection => {

                    if (selection === "Fix with AI") {
                        runAIFix(document);
                    }

                });
            }

        });

    });

    context.subscriptions.push(saveListener);
}

function simplifyMessage(original: string): string {

    if (original.includes("expected ';'"))
        return "You might be missing a semicolon ';' here.";

    if (original.includes("was not declared"))
        return "This variable is not declared.";

    return "There is a mistake here.";
}

async function runAIFix(document: vscode.TextDocument) {

    const config = vscode.workspace.getConfiguration("architai");
    const apiKey = config.get<string>("apiKey");

    if (!apiKey) {
        vscode.window.showErrorMessage("Archit-AI API key not set.");
        return;
    }

    const code = document.getText();

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Archit-AI fixing your code...",
        cancellable: false
    }, async () => {

        try {

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content: `
Fix the following C++ code.

Rules:
- Do NOT change the algorithm logic
- Only fix syntax or runtime errors
- Return ONLY the corrected C++ code
- Do NOT include explanations
- Do NOT wrap the code in markdown
`
                        },
                        {
                            role: "user",
                            content: code
                        }
                    ],
                    temperature: 0
                })
            });

            const data: any = await response.json();
            let fixedCode = data?.choices?.[0]?.message?.content;

            console.log("AI RESPONSE:", fixedCode);

            if (!fixedCode || fixedCode.trim().length < 5) {
                vscode.window.showErrorMessage("Archit-AI returned invalid code.");
                return;
            }

            // remove accidental markdown fences
            fixedCode = fixedCode
                .replace(/```[a-zA-Z]*/g, "")
                .replace(/```/g, "")
                .trim();

            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            applyFullReplacement(editor, fixedCode);

        } catch (err) {

            console.error(err);
            vscode.window.showErrorMessage("Archit-AI failed.");

        }

    });
}

function applyFullReplacement(editor: vscode.TextEditor, newCode: string) {

    editor.edit(editBuilder => {

        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
        );

        editBuilder.replace(fullRange, newCode);

    }).then(() => {

        editor.document.save(); // re-trigger diagnostics

        vscode.window.showInformationMessage("Archit-AI applied fixes.");

    });
}

export function deactivate() {
    diagnosticCollection.clear();
}