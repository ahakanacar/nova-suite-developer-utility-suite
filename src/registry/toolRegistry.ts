import { TokenCalculator } from '../tools/ai/TokenCalculator';
import { ContextVisualizer } from '../tools/ai/ContextVisualizer';
import { PromptDiff } from '../tools/ai/PromptDiff';
import { SchemaValidator } from '../tools/ai/SchemaValidator';
import { MockDataGenerator } from '../tools/ai/MockDataGenerator';
import { FewShotFormatter } from '../tools/ai/FewShotFormatter';
import { LogConverter } from '../tools/ai/LogConverter';
import { AgentValidator } from '../tools/ai/AgentValidator';
import { XmlTagChecker } from '../tools/ai/XmlTagChecker';
import { ModelMatrix } from '../tools/ai/ModelMatrix';
import { ChunkSplitter } from '../tools/ai/ChunkSplitter';
import { PromptInjectionTester } from '../tools/ai/PromptInjectionTester';
import { JsonFormatter } from '../tools/core/JsonFormatter';
import { Base64Tool } from '../tools/core/Base64Tool';
import { UrlEncoderDecoder } from '../tools/core/UrlEncoderDecoder';
import { JwtDebugger } from '../tools/core/JwtDebugger';
import { UuidUlidGenerator } from '../tools/core/UuidUlidGenerator';
import { DateEpochConverter } from '../tools/core/DateEpochConverter';
import { TextDiffChecker } from '../tools/core/TextDiffChecker';
import { HtmlEntityConverter } from '../tools/core/HtmlEntityConverter';
import { CryptographicHasher } from '../tools/core/CryptographicHasher';
import { CssUnitConverter } from '../tools/core/CssUnitConverter';
import { ColorPickerTool } from '../tools/core/ColorPickerTool';
import { RegexTester } from '../tools/core/RegexTester';
import { MarkdownPreviewer } from '../tools/core/MarkdownPreviewer';
import { UserAgentParser } from '../tools/core/UserAgentParser';
import { SqlFormatter } from '../tools/core/SqlFormatter';
import { JsonToDtoGenerator } from '../tools/core/JsonToDtoGenerator';
import { CurlToCodeConverter } from '../tools/core/CurlToCodeConverter';
import { StringTransformer } from '../tools/core/StringTransformer';
import { CronExpressionBuilder } from '../tools/core/CronExpressionBuilder';
import { EnvFileParser } from '../tools/core/EnvFileParser';

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'ai' | 'core';
  description: string;
  component: React.ComponentType;
}

// Map of categories for display organization in sidebar/menus
export const CATEGORY_LABELS = {
  ai: 'AI & LLM Tools',
  core: 'Core Tools'
};

// Global registry of all active tools in NovaSuite
const toolRegistry: ToolDefinition[] = [];

// Register core suite tools
registerTool({
  id: 'token-calculator',
  name: 'Token Calculator',
  category: 'ai',
  description: 'Multi-model token & cost calculator',
  component: TokenCalculator
});

registerTool({
  id: 'context-visualizer',
  name: 'Context Budget',
  category: 'ai',
  description: 'Visual budget breakdown of LLM context capacity',
  component: ContextVisualizer
});

registerTool({
  id: 'prompt-diff',
  name: 'Prompt Diff',
  category: 'ai',
  description: 'Side-by-side prompt version comparison checker',
  component: PromptDiff
});

registerTool({
  id: 'schema-validator',
  name: 'Schema Validator',
  category: 'ai',
  description: 'Function calling JSON schema validator & form previewer',
  component: SchemaValidator
});

registerTool({
  id: 'mock-generator',
  name: 'Mock Generator',
  category: 'ai',
  description: 'JSON Schema based random mock data generator',
  component: MockDataGenerator
});

registerTool({
  id: 'few-shot-formatter',
  name: 'Few-Shot Formatter',
  category: 'ai',
  description: 'Compile prompt training examples into JSON/XML formats',
  component: FewShotFormatter
});

registerTool({
  id: 'log-converter',
  name: 'Log Converter',
  category: 'ai',
  description: 'Convert chat logs to Fine-Tuning jsonl format',
  component: LogConverter
});

registerTool({
  id: 'agent-validator',
  name: 'Agent Validator',
  category: 'ai',
  description: 'CrewAI & AutoGen agent config manifest validator',
  component: AgentValidator
});

registerTool({
  id: 'xml-tag-checker',
  name: 'Prompt XML Validator',
  category: 'ai',
  description: 'Detect unclosed tags, validate hierarchy, and auto-fix prompt structures in accordance with Claude and Gemini standards.',
  component: XmlTagChecker
});

registerTool({
  id: 'model-matrix',
  name: 'Model Matrix',
  category: 'ai',
  description: 'List and filter active LLM models parameters and prices',
  component: ModelMatrix
});

registerTool({
  id: 'chunk-splitter',
  name: 'RAG Chunk Splitter',
  category: 'ai',
  description: 'Simulate sliding window document partitioning and preview overlap boundaries',
  component: ChunkSplitter
});

registerTool({
  id: 'injection-tester',
  name: 'Prompt Injection Tester',
  category: 'ai',
  description: 'Audit system prompts for security leaks, roleplays, overrides, and jailbreak vulnerabilities',
  component: PromptInjectionTester
});

registerTool({
  id: 'json-formatter',
  name: 'JSON Formatter',
  category: 'core',
  description: 'Prettify, minify, validate, and debug JSON content structures',
  component: JsonFormatter
});

registerTool({
  id: 'base64-tool',
  name: 'Base64 Converter',
  category: 'core',
  description: 'Encode and decode Base64 strings with UTF-8 character safe conversions',
  component: Base64Tool
});

registerTool({
  id: 'url-tool',
  name: 'URL Encoder / Decoder',
  category: 'core',
  description: 'Percent-encode/decode queries, and dynamically edit structured parameters',
  component: UrlEncoderDecoder
});

registerTool({
  id: 'jwt-debugger',
  name: 'JWT Debugger',
  category: 'core',
  description: 'Decode and debug JSON Web Tokens, claim payload parameters, and expiration timings',
  component: JwtDebugger
});

registerTool({
  id: 'uuid-ulid-tool',
  name: 'UUID / ULID Generator',
  category: 'core',
  description: 'Generate secure UUID v4 or Sortable ULIDs, and decode timestamps from existing ULIDs',
  component: UuidUlidGenerator
});

registerTool({
  id: 'date-epoch-tool',
  name: 'Date & Epoch Converter',
  category: 'core',
  description: 'Convert timestamp epoch values (seconds/milliseconds) to human-readable dates',
  component: DateEpochConverter
});

registerTool({
  id: 'text-diff-tool',
  name: 'Text Diff Checker',
  category: 'core',
  description: 'Compare two text structures side-by-side with synchronized scrolls',
  component: TextDiffChecker
});

registerTool({
  id: 'html-entity-tool',
  name: 'HTML Entity Converter',
  category: 'core',
  description: 'Escape characters to HTML/XML entities or unescape them back into normal tags',
  component: HtmlEntityConverter
});

registerTool({
  id: 'hasher-tool',
  name: 'Cryptographic Hasher',
  category: 'core',
  description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes in the browser',
  component: CryptographicHasher
});

registerTool({
  id: 'css-unit-tool',
  name: 'CSS Unit Converter',
  category: 'core',
  description: 'Convert layout units between px, rem, em, %, vw, and vh relative parameters',
  component: CssUnitConverter
});

registerTool({
  id: 'color-tool',
  name: 'Color Picker & Palette',
  category: 'core',
  description: 'Convert HEX, RGB, and HSL colors and generate variations',
  component: ColorPickerTool
});

registerTool({
  id: 'regex-tool',
  name: 'Regex Tester',
  category: 'core',
  description: 'Validate regular expressions, match groups, and test string replacements safely',
  component: RegexTester
});

registerTool({
  id: 'markdown-tool',
  name: 'Markdown Previewer',
  category: 'core',
  description: 'Write Markdown with real-time GitHub-flavored side-by-side previewing',
  component: MarkdownPreviewer
});

registerTool({
  id: 'ua-tool',
  name: 'User Agent Parser',
  category: 'core',
  description: 'Extract OS details, browser brands, and device targets from raw user agent strings',
  component: UserAgentParser
});

registerTool({
  id: 'sql-tool',
  name: 'SQL Formatter',
  category: 'core',
  description: 'Prettify queries and standardize SQL keywords on new lines',
  component: SqlFormatter
});

registerTool({
  id: 'dto-tool',
  name: 'JSON to DTO Generator',
  category: 'core',
  description: 'Convert JSON structures to TypeScript, Kotlin, Dart, or Go DTO structures',
  component: JsonToDtoGenerator
});

registerTool({
  id: 'curl-tool',
  name: 'cURL to Code',
  category: 'core',
  description: 'Convert cURL requests to JavaScript Fetch, Axios, or Python Requests code blocks',
  component: CurlToCodeConverter
});

registerTool({
  id: 'string-tool',
  name: 'String Transformer',
  category: 'core',
  description: 'Transform string patterns to camelCase, snake_case, PascalCase, or generate URL slugs',
  component: StringTransformer
});

registerTool({
  id: 'cron-tool',
  name: 'Cron Expression Builder',
  category: 'core',
  description: 'Convert cron expressions to human-readable text and vice-versa',
  component: CronExpressionBuilder
});

registerTool({
  id: 'env-parser',
  name: 'ENV File Parser',
  category: 'core',
  description: 'Validate .env key-value syntax, detect duplicates, and auto-fix formatting errors',
  component: EnvFileParser
});

/**
 * Registers a tool into the global registry.
 * @param tool The tool definition to register.
 */
export function registerTool(tool: ToolDefinition) {
  if (toolRegistry.some((t) => t.id === tool.id)) {
    console.warn(`[ToolRegistry] Tool with ID "${tool.id}" is already registered. Skipping.`);
    return;
  }
  toolRegistry.push(tool);
}


/**
 * Retrieves all registered tools.
 */
export const getRegisteredTools = (): ToolDefinition[] => {
  return [...toolRegistry];
};

/**
 * Retrieves a specific tool definition by ID.
 * @param id Tool ID.
 */
export const getToolById = (id: string): ToolDefinition | undefined => {
  return toolRegistry.find((t) => t.id === id);
};
