import React, { useState } from 'react';
import { Copy, Code } from 'lucide-react';
export const JsonToDtoGenerator: React.FC = () => {
  const defaultJson = `{
  "id": 1,
  "name": "NovaSuite App",
  "active": true,
  "roles": ["admin", "developer"],
  "settings": {
    "theme": "dark",
    "notifications": false
  },
  "stats": [
    { "year": 2026, "score": 98.5 }
  ]
}`;

  const [rawJson, setRawJson] = useState(defaultJson);
  const [targetLang, setTargetLang] = useState<'ts' | 'kotlin' | 'dart' | 'go'>('ts');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const toCamelCase = (s: string) => s.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

  // TypeScript DTO Generator
  const generateTypeScript = (obj: any, rootName = 'RootObject') => {
    const definitions: { name: string; content: string }[] = [];

    const walk = (val: any, name: string): string => {
      if (val === null) return 'any';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'number') return 'number';
      if (typeof val === 'boolean') return 'boolean';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        const itemType = walk(val[0], name + 'Item');
        return `${itemType}[]`;
      }

      if (typeof val === 'object') {
        const typeName = capitalize(name);
        let lines = `export interface ${typeName} {\n`;
        for (const [key, value] of Object.entries(val)) {
          const itemType = walk(value, key);
          lines += `  ${key}: ${itemType};\n`;
        }
        lines += `}`;
        definitions.push({ name: typeName, content: lines });
        return typeName;
      }

      return 'any';
    };

    walk(obj, rootName);
    return definitions.reverse().map((d) => d.content).join('\n\n');
  };

  // Kotlin DTO Generator
  const generateKotlin = (obj: any, rootName = 'RootObject') => {
    const definitions: { name: string; content: string }[] = [];

    const walk = (val: any, name: string): string => {
      if (val === null) return 'Any?';
      if (typeof val === 'string') return 'String';
      if (typeof val === 'number') return Number.isInteger(val) ? 'Int' : 'Double';
      if (typeof val === 'boolean') return 'Boolean';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'List<Any>';
        const itemType = walk(val[0], name + 'Item');
        return `List<${itemType}>`;
      }

      if (typeof val === 'object') {
        const typeName = capitalize(name);
        let lines = `data class ${typeName}(\n`;
        const entries = Object.entries(val);
        entries.forEach(([key, value], idx) => {
          const itemType = walk(value, key);
          const comma = idx === entries.length - 1 ? '' : ',';
          lines += `  val ${key}: ${itemType}${comma}\n`;
        });
        lines += `)`;
        definitions.push({ name: typeName, content: lines });
        return typeName;
      }

      return 'Any';
    };

    walk(obj, rootName);
    return definitions.reverse().map((d) => d.content).join('\n\n');
  };

  // Dart DTO Generator
  const generateDart = (obj: any, rootName = 'RootObject') => {
    const definitions: { name: string; content: string }[] = [];

    const walk = (val: any, name: string): string => {
      if (val === null) return 'dynamic';
      if (typeof val === 'string') return 'String';
      if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
      if (typeof val === 'boolean') return 'bool';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'List<dynamic>';
        const itemType = walk(val[0], name + 'Item');
        return `List<${itemType}>`;
      }

      if (typeof val === 'object') {
        const typeName = capitalize(name);
        let lines = `class ${typeName} {\n`;
        
        const entries = Object.entries(val);
        entries.forEach(([key, value]) => {
          const itemType = walk(value, key);
          lines += `  final ${itemType} ${key};\n`;
        });
        
        lines += '\n';
        lines += `  ${typeName}({\n`;
        entries.forEach(([key]) => {
          lines += `    required this.${key},\n`;
        });
        lines += '  });\n';
        lines += `}`;
        
        definitions.push({ name: typeName, content: lines });
        return typeName;
      }

      return 'dynamic';
    };

    walk(obj, rootName);
    return definitions.reverse().map((d) => d.content).join('\n\n');
  };

  // Go Struct DTO Generator
  const generateGo = (obj: any, rootName = 'RootObject') => {
    const definitions: { name: string; content: string }[] = [];

    const walk = (val: any, name: string): string => {
      if (val === null) return 'interface{}';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64';
      if (typeof val === 'boolean') return 'bool';

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]interface{}';
        const itemType = walk(val[0], name + 'Item');
        return `[]${itemType}`;
      }

      if (typeof val === 'object') {
        const typeName = capitalize(name);
        let lines = `type ${typeName} struct {\n`;
        for (const [key, value] of Object.entries(val)) {
          const itemType = walk(value, key);
          const structFieldName = capitalize(toCamelCase(key));
          lines += `    ${structFieldName} ${itemType} \`json:"${key}"\`\n`;
        }
        lines += `}`;
        definitions.push({ name: typeName, content: lines });
        return typeName;
      }

      return 'interface{}';
    };

    walk(obj, rootName);
    return definitions.reverse().map((d) => d.content).join('\n\n');
  };

  const handleGenerate = () => {
    setError(null);
    setOutput('');

    const cleanInput = rawJson.trim();
    if (!cleanInput) return;

    try {
      const parsedObj = JSON.parse(cleanInput);
      
      let generated = '';
      if (targetLang === 'ts') {
        generated = generateTypeScript(parsedObj);
      } else if (targetLang === 'kotlin') {
        generated = generateKotlin(parsedObj);
      } else if (targetLang === 'dart') {
        generated = generateDart(parsedObj);
      } else if (targetLang === 'go') {
        generated = generateGo(parsedObj);
      }

      setOutput(generated);
    } catch (err: any) {
      setError('Invalid JSON format! Please check your syntax.');
    }
  };

  const handleInputChange = (val: string) => {
    setRawJson(val);
    if (val.trim() === '') {
      setOutput('');
      setError(null);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const isInputEmpty = !rawJson || rawJson.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>JSON to DTO Generator</h2>
      <p style={styles.subtitle}>
        Convert raw JSON schema structures into type-safe data model classes or structures for multiple target languages.
      </p>

      <div style={styles.splitRow}>
        {/* Left Input & Config Panel */}
        <div style={styles.panel}>
          <div style={styles.configRow}>
            <label style={styles.panelLabel}>Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              style={styles.select}
            >
              <option value="ts">TypeScript Interface</option>
              <option value="kotlin">Kotlin Data Class</option>
              <option value="dart">Dart Class (Flutter)</option>
              <option value="go">Go Struct</option>
            </select>
          </div>

          <label style={styles.panelLabel}>Raw JSON Input</label>
          <textarea
            value={rawJson}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Paste raw JSON object structure here..."
          />
          
          {/* Action Button */}
          <div style={styles.btnRow}>
            <button
              onClick={handleGenerate}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.actionButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isBtnHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              <Code size={14} style={{ marginRight: 6 }} /> Generate DTO
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Generated DTO</label>
            {output && (
              <button
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  color: copied ? '#22c55e' : 'var(--accent-blue)'
                }}
              >
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            )}
          </div>

          {error ? (
            <div style={styles.errorBox}>
              {error}
            </div>
          ) : output ? (
            <pre
              onClick={handleCopy}
              style={{
                ...styles.outputPre,
                cursor: 'pointer',
                borderColor: copied ? '#22c55e' : 'var(--border-color)',
                transform: copied ? 'scale(1.01)' : 'scale(1)'
              }}
            >
              <code>{output}</code>
            </pre>
          ) : (
            <div style={styles.emptyOutputBox}>
              Generated DTO will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)'
  },
  title: {
    fontSize: '18px',
    fontWeight: 600
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  splitRow: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '400px'
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  panelLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  configRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  select: {
    padding: '4px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '180px'
  },
  textarea: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none',
    border: '1px solid var(--border-color)'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: '6px',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
    outline: 'none',
    width: '100%'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  outputPre: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '16px 20px',
    overflowY: 'auto',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: 0,
    transition: 'transform 0.15s ease, border-color 0.15s ease'
  },
  emptyOutputBox: {
    flex: 1,
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  errorBox: {
    flex: 1,
    border: '1px solid rgba(255, 59, 48, 0.15)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    padding: '16px 20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
