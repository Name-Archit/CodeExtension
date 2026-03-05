# Archit-AI Vscode Extension

Archit-AI is a Visual Studio Code extension designed to help **competitive programmers debug C++ code quickly**.

The extension analyzes your code when you save the file, detects compilation errors, and explains them in **simple human-readable language**.
It also provides an optional **AI-assisted fix** using a Groq LLM to automatically correct syntax and runtime issues.

The goal is to help programmers **spend less time debugging and more time solving problems.**

---

# Features

### Compiler Error Detection

When you save a `.cpp` file, the extension compiles the code using `g++` and highlights errors directly in the editor.

Errors are displayed with clear explanations such as:

* Missing semicolon
* Undeclared variables
* Invalid function calls

---

### Simple Error Messages

Instead of showing complex compiler output, Archit-AI converts errors into **simpler explanations** to make debugging easier.

Example:

```
You might be missing a semicolon ';' here.
```

---

### AI Assisted Fix

If multiple issues are detected, the extension will show a prompt:

```
Archit-AI detected X issues. Fix automatically with AI?
```

If accepted, the AI model attempts to fix the code automatically.

---

### Automatic Re-Check

After AI applies changes, the file is automatically saved and recompiled so new errors or warnings appear immediately.

---

# Supported Language

Currently the extension supports:

```
C++
```

Future versions will support additional programming languages.

---

# Installation

### 1. Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/archit-ai-vscode-extension.git
```

Open the folder in **VS Code**.

---

### 2. Install Dependencies

Run inside the project directory:

```
npm install
```

---

### 3. Compile the Extension

```
npm run compile
```

---

### 4. Run the Extension

Press:

```
F5
```

VS Code will launch a **new Extension Development Host window**.

Open a `.cpp` file and start coding.

---

# Adding Your API Key

Archit-AI requires a Groq API key to enable AI code fixes.

### Step 1

Open VS Code settings.

```
Ctrl + ,
```

Search for:

```
Archit-AI API Key
```

---

### Step 2

Paste your Groq API key into the field.

Example:

```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 3

Save the settings.

AI fixing will now be enabled.

---

# How It Works

1. Save a `.cpp` file
2. Extension compiles the code using `g++`
3. Errors are highlighted in the editor
4. If many errors exist, a popup offers **AI Fix**
5. AI corrects syntax/runtime issues
6. File is replaced and recompiled automatically

---

# Model Used

This extension currently uses:

```
Groq LLM API
```

Example model used:

```
openai/gpt-oss-20b
```

The model is used **only for optional AI-assisted debugging**.

---

# Disclaimer

* AI responses depend on the Groq model and may not always produce perfect results.
* The extension currently supports **C++ only**.
* The AI feature requires a **user-provided API key**.
* API usage may incur costs depending on your Groq account.

---

# Limitations

Current limitations include:

* Only works with `.cpp` files
* Only basic compiler error simplification
* AI fixes may occasionally rewrite parts of the code
* Requires local `g++` compiler

---

# Future Updates

Planned improvements include:

* Support for additional languages
* Improved runtime error detection
* Better Time Limit Exceeded (TLE) analysis
* Inline AI suggestions
* Competitive programming specific optimizations
* Smarter debugging based on compiler diagnostics

---

# Contributing

Contributions and suggestions are welcome.

You can:

* Open an issue
* Submit a pull request
* Suggest improvements

---

# License

MIT License

