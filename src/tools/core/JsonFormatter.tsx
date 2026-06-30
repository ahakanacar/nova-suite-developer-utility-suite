import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, FileText, Minimize2 } from 'lucide-react';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('{\n  "name": "NovaSuite",\n  "version": 1,\n  "features": ["ai-tools", "core-tools"],\n  "status": "active"\n}');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = (mode: 'pretty' | 'minify') => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      if (mode === 'pretty') {
        setOutput(JSON.stringify(parsed, null, indentSize));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>JSON Formatter & Validator</h2>
      <p style={styles.subtitle}>
        Validate, prettify, or compact JSON data with instant syntax verification.
      </p>

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.controlField}>
          <label style={styles.controlLabel}>Indentation</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            style={styles.select}
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={8}>8 Spaces</option>
          </select>
        </div>
      </div>

      {/* Error / Success Status */}
      {error && (
        <div style={styles.errorCard}>
          <AlertCircle size={16} color="var(--accent-red)" style={{ marginRight: 8, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {!error && output && (
        <div style={styles.successCard}>
          <CheckCircle size={16} color="var(--accent-green)" style={{ marginRight: 8, flexShrink: 0 }} />
          <span>Valid JSON Syntax</span>
        </div>
      )}

      {/* Editor Panels */}
      <div style={styles.splitRow}>
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw JSON Input</label>
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (!val.trim()) {
                setError(null);
                setOutput('');
              }
            }}
            style={styles.textarea}
            placeholder="Paste raw JSON here..."
          />
          <div style={styles.btnRow}>
            <button
              onClick={() => handleFormat('pretty')}
              disabled={!input.trim()}
              style={{
                ...styles.primaryButton,
                opacity: !input.trim() ? 0.6 : 1,
                cursor: !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <FileText size={14} style={{ marginRight: 6 }} />
              Prettify
            </button>
            <button
              onClick={() => handleFormat('minify')}
              disabled={!input.trim()}
              style={{
                ...styles.secondaryButton,
                opacity: !input.trim() ? 0.6 : 1,
                cursor: !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Minimize2 size={14} style={{ marginRight: 6 }} />
              Minify
            </button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Formatted Output</label>
            {output && (
              <button onClick={handleCopy} style={styles.copyButton}>
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            style={{ ...styles.textarea, ...styles.readonlyTextarea }}
            placeholder="Formatted output will appear here..."
          />
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
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    gap: '16px'
  },
  controlField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  controlLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  select: {
    padding: '4px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  btnGroup: {
    display: 'flex',
    gap: '8px'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.15)'
  },
  successCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    color: 'var(--accent-green)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(52, 199, 89, 0.15)'
  },
  splitRow: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '260px'
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
  readonlyTextarea: {
    backgroundColor: 'var(--bg-sidebar)',
    cursor: 'text'
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  }
};
