import React, { useState } from 'react';
import { Copy, FileCode } from 'lucide-react';

export const SqlFormatter: React.FC = () => {
  const defaultSql = "select id, name, created_at from users where active = 1 and role = 'admin' order by created_at desc limit 10;";
  
  const [input, setInput] = useState(defaultSql);
  const [output, setOutput] = useState('');
  const [caseMode, setCaseMode] = useState<'upper' | 'lower'>('upper');
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    // Clean up spaces
    let formatted = input.replace(/\s+/g, ' ').trim();

    // SQL Keywords list for formatting rules
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 
      'GROUP BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
      'INNER JOIN', 'HAVING', 'INSERT INTO', 'VALUES', 
      'UPDATE', 'SET', 'DELETE FROM'
    ];

    // Standard formatting rule: Place keywords on new lines with casing rules
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const replacement = caseMode === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase();
      formatted = formatted.replace(regex, `\n${replacement}`);
    });

    // Formatting enhancements: indent fields after SELECT
    formatted = formatted.trim();
    setOutput(formatted);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim() === '') {
      setOutput('');
    }
  };

  const isInputEmpty = !input || input.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>SQL Formatter</h2>
      <p style={styles.subtitle}>
        Prettify and clean up raw SQL queries. Formats main keywords on new lines and standardizes key casing.
      </p>

      {/* Control panel */}
      <div style={styles.controlsBar}>
        <div style={styles.controlField}>
          <label style={styles.controlLabel}>Keyword Case</label>
          <select
            value={caseMode}
            onChange={(e) => setCaseMode(e.target.value as 'upper' | 'lower')}
            style={styles.select}
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
          </select>
        </div>
      </div>

      <div style={styles.splitRow}>
        {/* Input Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw SQL Input</label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Paste your raw SQL query here..."
          />
          
          {/* Action Button Row */}
          <div style={styles.btnRow}>
            <button
              onClick={handleFormat}
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
              <FileCode size={14} style={{ marginRight: 6 }} /> Format SQL
            </button>
          </div>
        </div>

        {/* Output Panel */}
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
            placeholder="Formatted SQL will appear here..."
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '10px 16px',
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
  }
};

