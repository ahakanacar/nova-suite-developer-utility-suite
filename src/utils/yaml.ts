import yaml from 'js-yaml';

interface YamlParseResult {
  data: any;
  error: {
    line: number;
    column: number;
    message: string;
  } | null;
}

/**
 * Parses a YAML string and safely handles YAML parse exceptions by returning 
 * structured line and column coordinates of the syntax error.
 */
export function safeParseYaml(yamlString: string): YamlParseResult {
  try {
    const data = yaml.load(yamlString);
    return { data, error: null };
  } catch (err: any) {
    if (err && typeof err === 'object' && 'mark' in err) {
      return {
        data: null,
        error: {
          line: err.mark.line + 1, // Convert 0-indexed to 1-indexed line numbers
          column: err.mark.column + 1,
          message: err.reason || err.message
        }
      };
    }
    return {
      data: null,
      error: {
        line: 1,
        column: 1,
        message: err?.message || 'Unknown YAML parsing error'
      }
    };
  }
}
