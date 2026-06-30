Nova Suite - Developer Utility Toolset
Nova Suite is a lightweight, web-based toolset designed for developers and AI engineers. It contains 32 local utility tools categorized into AI-specific utilities and core developer tools. The application is fully client-side and can be run offline as a single self-contained HTML file.

🚀 Key Features
Zero Dependencies at Runtime: Runs entirely in the browser using client-side JavaScript. No backend server or external API proxy is required.
Fully Offline Capable: The build process bundles all styles and logic into a single HTML file (docs/index.html) that can be opened and run locally by double-clicking it.
Dynamic LLM Pricing: Syncs active model data and token pricing from OpenRouter API, caching it locally for offline fallback.
💻 Getting Started (No Installation Required)
For regular use, you do not need to install Node.js, npm, or run any terminal commands.

Run Offline Instantly
Download the docs/index.html file from this repository.
Double-click the index.html file to open it in your default web browser.
The entire toolset will run completely offline.
🛠️ Included Tools
AI & LLM Utilities (12 Tools)
Token Calculator: Multi-model token counter and pricing calculator supporting custom OpenRouter payloads.
Context Budget Visualizer: Stacked capacity visualization of context windows with warnings for token overflow limits.
Prompt Diff: Side-by-side prompt version comparator utilizing local Myers Diff logic.
Schema Validator: JSON schema builder and validator for LLM function calling and structured outputs.
Mock Generator: Synthesis engine for generating random mock data directly from a JSON Schema.
Few-Shot Formatter: Compile and format prompt training examples into JSON, XML, or markdown template strings.
Log Converter: Client-side parser running inside a Web Worker to convert chat logs to OpenAI/Anthropic fine-tuning JSONL format.
Agent Validator: Manifest schema checker for CrewAI and AutoGen agent configurations.
Prompt XML Validator: Strict stack-based checker for unclosed XML tags and structural tag hierarchy.
Model Matrix: Parameter and feature matrix comparator for active LLM models.
RAG Chunk Splitter: Sliding-window text partitioner showcasing chunk overlaps and boundary limits.
Prompt Injection Tester: Audit tool checking system instructions against known injection vectors (jailbreaks, DAN, leakage).
Core Developer Utilities (20 Tools)
JSON Formatter: Lint, format, and visualize JSON objects with precise inline syntax error indexing.
Base64 Encoder/Decoder: Secure conversion utility using native web codecs.
URL Encoder/Decoder: Safely process URI parameters and query strings.
JWT Debugger: Parse and unpack JSON Web Token payloads and verify algorithm headers.
UUID/ULID Generator: Secure generator using high-entropy crypto.getRandomValues.
Date Epoch Converter: Bidirectional Unix epoch and date-string converter supporting multiple timezones.
Text Diff Checker: Standard text comparison engine highlighting character edits.
HTML Entity Converter: Encode or decode special characters to valid HTML entities.
Cryptographic Hasher: Local hash generator supporting MD5, SHA-1, SHA-256, and SHA-512 via Web Crypto.
CSS Unit Converter: Conversions between px, rem, em, % and viewport units.
Color Picker & Contrast Checker: Interactive color palette selector calculating WCAG AA/AAA contrast ratios.
Regex Tester: RegEx pattern matcher with a timeout-terminated Web Worker guard to block ReDoS freezes.
Markdown Previewer: Real-time markdown parser utilizing DOMPurify to render safe HTML previews.
User Agent Parser: Parse browser, device, OS, and engine parameters from a user-agent header.
SQL Formatter: Formatter for organizing SQL queries.
JSON to DTO Generator: Auto-translate JSON schema models into TypeScript interfaces, Go structs, or C# DTOs.
cURL to Code Converter: Convert shell cURL commands into clean Fetch API, Axios, Python requests, or Go code.
String Transformer: Quick adjustments for case conversions, camelCase, snake_case, casing, and slugification.
Cron Expression Builder: Visual interface for constructing and validating Crontab cron schedules.
Env File Parser: Safely parse, clean, and format raw .env files into JSON arrays.
🔧 Developer Guide (Optional)
If you wish to modify the source code or build the project yourself:

Development Setup
Clone the repository.
Install development dependencies:
bash

npm install
Run the development server:
bash

npm run dev
Compile the Standalone HTML File
To bundle the source code and assets into the single docs/index.html file yourself:

bash

npm run build:web
