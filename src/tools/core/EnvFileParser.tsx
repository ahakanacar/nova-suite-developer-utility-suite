import React, { useState } from 'react';
import { Copy, Check, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface EnvError {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export const EnvFileParser: React.FC = () => {
  const [envInput, setEnvInput] = useState(
    `# Sample ENV file\n` +
    `PORT = 8080\n` +
    `DB_HOST=127.0.0.1\n` +
    `DB_USER = root\n` +
    `DB_PASS = secret password spaces\n` +
    `PORT = 9000\n` +
    `APP_KEY = "unclosed_quote`
  );

  const [audited, setAudited] = useState(false);
  const [errors, setErrors] = useState<EnvError[]>([]);
  const [cleanedOutput, setCleanedOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleParseAndValidate = () => {
    if (!envInput.trim()) return;

    const lines = envInput.split('\n');
    const varMap = new Map<string, string>();
    const validationErrors: EnvError[] = [];
    const keysSeen = new Set<string>();

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) return;

      const parts = trimmed.split('=');
      if (parts.length < 2) {
        validationErrors.push({
          line: idx + 1,
          message: `Invalid syntax (Missing '=' separator)`,
          type: 'error'
        });
        return;
      }

      const rawKey = parts[0];
      const rawValue = parts.slice(1).join('=');

      const key = rawKey.trim();
      // Validate KEY: no spaces, alphanumeric and underscores only
      if (!/^[A-Za-z0-9_]+$/.test(key)) {
        validationErrors.push({
          line: idx + 1,
          message: `Invalid Key format: "${key}" (Only alphanumeric and underscores allowed, no spaces)`,
          type: 'error'
        });
      } else if (rawKey !== key) {
        validationErrors.push({
          line: idx + 1,
          message: `Key "${key}" contains surrounding whitespace`,
          type: 'warning'
        });
      }

      const val = rawValue.trim();
      const hasDoubleQuote = val.startsWith('"');
      const hasSingleQuote = val.startsWith("'");
      const endsDoubleQuote = val.endsWith('"');
      const endsSingleQuote = val.endsWith("'");

      // Check mismatched quotes
      const isMismatched = 
        (hasDoubleQuote && !endsDoubleQuote) || (!hasDoubleQuote && endsDoubleQuote) ||
        (hasSingleQuote && !endsSingleQuote) || (!hasSingleQuote && endsSingleQuote);

      if (isMismatched) {
        validationErrors.push({
          line: idx + 1,
          message: `Mismatched quotes detected in value`,
          type: 'error'
        });
      }

      // Check if value with spaces is unquoted
      if (!hasDoubleQuote && !hasSingleQuote && val.includes(' ')) {
        validationErrors.push({
          line: idx + 1,
          message: `Value with spaces should be enclosed in quotes`,
          type: 'warning'
        });
      }

      // Strip quotes for cleaned normalization
      let cleanVal = val;
      if ((hasDoubleQuote && endsDoubleQuote) || (hasSingleQuote && endsSingleQuote)) {
        cleanVal = val.slice(1, -1);
      }

      // Check duplicate keys
      if (keysSeen.has(key)) {
        validationErrors.push({
          line: idx + 1,
          message: `Duplicate Key: "${key}" (Will override previous definitions)`,
          type: 'warning'
        });
      }
      keysSeen.add(key);

      // Keep the last occurrence (override)
      if (key) {
        varMap.set(key, cleanVal);
      }
    });

    // Reconstruct cleaned output
    const cleanLines: string[] = [];
    varMap.forEach((val, key) => {
      if (val.includes(' ') || val.includes('#') || val.includes('"') || val.includes("'")) {
        const escaped = val.replace(/"/g, '\\"');
        cleanLines.push(`${key}="${escaped}"`);
      } else {
        cleanLines.push(`${key}=${val}`);
      }
    });

    setErrors(validationErrors);
    setCleanedOutput(cleanLines.join('\n'));
    setAudited(true);
  };

  const handleInputChange = (val: string) => {
    setEnvInput(val);
    if (val.trim() === '') {
      setAudited(false);
      setErrors([]);
      setCleanedOutput('');
    }
  };

  const handleCopy = () => {
    if (!cleanedOutput) return;
    navigator.clipboard.writeText(cleanedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const isInputEmpty = !envInput || envInput.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ENV File Parser & Validator</h2>
      <p style={styles.subtitle}>
        Validate .env configurations, detect syntax issues, mismatched quotes, or duplicate keys, and auto-fix formatting errors.
      </p>

      <div className="split-row" style={styles.splitRow}>
        {/* Left Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw .env Input</label>
          <textarea
            value={envInput}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Paste your .env configuration contents here..."
          />
          
          <button
            onClick={handleParseAndValidate}
            disabled={isInputEmpty}
            onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              ...styles.primaryButton,
              backgroundColor: isInputEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : (isBtnHovered ? '#732be6' : '#863bff'),
              cursor: isInputEmpty ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Parse & Validate ENV
          </button>
        </div>

        {/* Right Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Validation Summary</label>
          
          {audited ? (
            <div style={styles.reportContent}>
              {errors.length === 0 ? (
                <div style={styles.successCard}>
                  <CheckCircle size={20} color="#22c55e" style={{ marginRight: 8 }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>All Variables Valid</span>
                </div>
              ) : (
                <div style={styles.errorList}>
                  {errors.map((err, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.errorCard,
                        borderColor: err.type === 'error' ? '#ef4444' : '#eab308',
                        backgroundColor: err.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(234, 179, 8, 0.05)',
                        color: err.type === 'error' ? '#ef4444' : '#eab308'
                      }}
                    >
                      <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', fontWeight: 500 }}>
                        [Line {err.line}] {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.outputHeader}>
                <label style={styles.panelLabel}>Sanitized & Cleaned .env</label>
                {cleanedOutput && (
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
                )}
              </div>

              <pre
                onClick={handleCopy}
                style={{
                  ...styles.outputPre,
                  cursor: 'pointer',
                  borderColor: copied ? '#22c55e' : 'var(--border-color)',
                  transform: copied ? 'scale(1.01)' : 'scale(1)'
                }}
              >
                <code>{cleanedOutput}</code>
              </pre>
            </div>
          ) : (
            <div style={styles.emptyOutputBox}>
              Parsed .env result will appear here...
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
  panelLabel: {
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
    border: '1px solid var(--border-color)',
    overflowY: 'auto'
  },
  primaryButton: {
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
    marginTop: '4px'
  },
  reportContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    overflowY: 'auto'
  },
  successCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.15)',
    color: '#22c55e'
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '140px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid'
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
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
  }
};
