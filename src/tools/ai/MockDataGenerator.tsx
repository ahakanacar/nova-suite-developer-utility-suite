import React, { useState } from 'react';
import { Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export const MockDataGenerator: React.FC = () => {
  const [schemaInput, setSchemaInput] = useState(JSON.stringify({
    type: "object",
    properties: {
      userId: { type: "integer" },
      username: { type: "string" },
      email: { type: "string" },
      isActive: { type: "boolean" },
      roles: {
        type: "array",
        items: {
          type: "string",
          enum: ["admin", "editor", "viewer"]
        }
      },
      profile: {
        type: "object",
        properties: {
          age: { type: "integer" },
          bio: { type: "string" }
        },
        required: ["age"]
      }
    },
    required: ["userId", "username"]
  }, null, 2));

  const [outputJson, setOutputJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generationCount, setGenerationCount] = useState(1);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // Recursive mock data generation engine with key context
  const generateMockValue = (schema: any, key?: string): any => {
    if (!schema || typeof schema !== 'object') return null;

    if (schema.enum && Array.isArray(schema.enum)) {
      const idx = Math.floor(Math.random() * schema.enum.length);
      return schema.enum[idx];
    }

    const fakerRule = schema.faker ? String(schema.faker).toLowerCase() : '';
    const fieldKey = key ? key.toLowerCase() : '';
    const type = schema.type ? String(schema.type).toLowerCase() : '';

    // Enhanced mock data generation for UUIDs and Email formats
    if (fakerRule.includes('uuid') || fieldKey.includes('uuid') || type === 'uuid') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    if (fakerRule.includes('email') || fieldKey.includes('email')) {
      const domains = ['example.com', 'novasuite.io', 'gmail.com', 'yahoo.com', 'outlook.com'];
      const names = ['alice', 'bob', 'charlie', 'delta', 'nova', 'admin', 'user', 'test'];
      const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return `${name}@${domain}`;
    }

    if (fakerRule.includes('date') || fieldKey.includes('date') || type === 'date') {
      return new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];
    }

    switch (type) {
      case 'string':
        const words = ['alpha', 'beta', 'gamma', 'delta', 'orion', 'nova', 'omega', 'nexus'];
        return words[Math.floor(Math.random() * words.length)] + '_' + Math.floor(Math.random() * 100);
      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      case 'date':
        return new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];
      case 'integer':
      case 'number':
        const min = schema.minimum !== undefined ? schema.minimum : 1;
        const max = schema.maximum !== undefined ? schema.maximum : 100;
        const val = Math.floor(Math.random() * (max - min + 1)) + min;
        return type === 'integer' ? Math.floor(val) : val;
      case 'boolean':
        return Math.random() > 0.5;
      case 'array':
        const itemsSchema = schema.items || { type: 'string' };
        // Array Length Boundaries (minItems / maxItems validation)
        const minItems = schema.minItems !== undefined ? schema.minItems : 1;
        let maxItems = schema.maxItems !== undefined ? schema.maxItems : Math.max(minItems, 3);
        if (maxItems < minItems) maxItems = minItems;
        const arrayLength = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        return Array.from({ length: arrayLength }, () => generateMockValue(itemsSchema));
      case 'object':
        const obj: Record<string, any> = {};
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([propKey, prop]) => {
            obj[propKey] = generateMockValue(prop, propKey);
          });
        }
        return obj;
      default:
        return null;
    }
  };

  const generateFromSchemaOrTemplate = (schema: any): any => {
    if (!schema || typeof schema !== 'object') return null;

    const isJsonSchema = (schema.properties && typeof schema.properties === 'object') || (schema.type && typeof schema.type === 'string');

    if (isJsonSchema) {
      return generateMockValue(schema);
    } else {
      const obj: Record<string, any> = {};
      Object.entries(schema).forEach(([key, val]) => {
        if (typeof val === 'string') {
          obj[key] = generateMockValue({ type: val }, key);
        } else if (typeof val === 'object') {
          obj[key] = generateFromSchemaOrTemplate(val);
        } else {
          obj[key] = val;
        }
      });
      return obj;
    }
  };

  const handleGenerate = () => {
    try {
      if (!schemaInput.trim()) {
        setOutputJson('');
        setErrorMsg(null);
        return;
      }
      const parsed = JSON.parse(schemaInput);
      
      const mockResult = [];
      for (let i = 0; i < generationCount; i++) {
        mockResult.push(generateFromSchemaOrTemplate(parsed));
      }
      const finalOutput = generationCount === 1 ? mockResult[0] : mockResult;
      setOutputJson(JSON.stringify(finalOutput, null, 2));
      setErrorMsg(null);
    } catch (err: any) {
      setOutputJson('');
      setErrorMsg(err?.message || 'Invalid JSON Schema');
    }
  };

  const handleTextChange = (val: string) => {
    setSchemaInput(val);
    if (val.trim() === '') {
      setOutputJson('');
      setErrorMsg(null);
    }
  };

  const handleCopy = async () => {
    if (!outputJson) return;
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const isInputEmpty = !schemaInput || schemaInput.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>JSON Schema Mock Data Generator</h2>
      <p style={styles.subtitle}>
        Generate valid mock data payloads recursively from JSON schema parameters.
      </p>

      <div className="split-row" style={styles.splitRow}>
        {/* Schema Editor Panel */}
        <div style={styles.panel}>
          <label style={styles.label}>Mock Schema Definition</label>
          <textarea
            value={schemaInput}
            onChange={(e) => handleTextChange(e.target.value)}
            style={{
              ...styles.textarea,
              border: errorMsg ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
              overflowY: 'auto'
            }}
            placeholder="Paste your JSON schema properties definition here..."
          />
          
          {/* Generation Controls */}
          <div style={styles.controlRow}>
            <div style={styles.inputGroup}>
              <label style={styles.smallLabel}>Generation Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={generationCount}
                onChange={(e) => setGenerationCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.numberInput}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.generateButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isBtnHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer',
                opacity: isInputEmpty ? 0.6 : 1
              }}
            >
              Generate Mock Data
            </button>
          </div>

          {errorMsg && (
            <div style={styles.errorBanner}>
              <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Mock Output Panel */}
        <div style={styles.panel}>
          <div style={styles.outputLabelRow}>
            <label style={styles.label}>Generated Mock Output</label>
            {outputJson && (
              <div style={styles.actionButtons}>
                <button onClick={handleGenerate} style={styles.iconButton} title="Regenerate data">
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    ...styles.copyButton,
                    color: copied ? '#22c55e' : 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copied ? <Check size={12} style={{ marginRight: 4 }} /> : <Copy size={12} style={{ marginRight: 4 }} />}
                  {copied ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          <pre
            onClick={handleCopy}
            style={{
              ...styles.outputBlock,
              cursor: 'pointer',
              borderColor: copied ? '#22c55e' : 'var(--border-color)',
              transform: copied ? 'scale(1.01)' : 'scale(1)'
            }}
          >
            <code>{outputJson || 'Generated mock results will appear here...'}</code>
          </pre>
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
    flex: 1
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
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
    transition: 'border-color 0.15s ease'
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    color: 'var(--accent-red)',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.2)'
  },
  outputLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionButtons: {
    display: 'flex',
    gap: '6px'
  },
  iconButton: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '4px 8px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    backgroundColor: 'var(--bg-sidebar)',
    transition: 'background-color 0.15s ease'
  },
  copyButton: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  outputBlock: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap'
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  smallLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  numberInput: {
    width: '60px',
    padding: '6px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  generateButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    outline: 'none'
  }
};
