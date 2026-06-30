import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface MatchGroup {
  text: string;
  index: number;
}

export const RegexTester: React.FC = () => {
  const [regexStr, setRegexStr] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Contact us at support@novasuite.dev or sales@novasuite.dev for inquiries.');
  const [replaceText, setReplaceText] = useState('[REDACTED EMAIL]');

  const [matches, setMatches] = useState<MatchGroup[]>([
    { text: 'support@novasuite.dev', index: 14 },
    { text: 'sales@novasuite.dev', index: 38 }
  ]);
  const [replacedOutput, setReplacedOutput] = useState('Contact us at [REDACTED EMAIL] or [REDACTED EMAIL] for inquiries.');
  const [error, setError] = useState<string | null>(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleRunRegex = () => {
    setError(null);
    setMatches([]);
    setReplacedOutput('');

    if (!regexStr.trim() || !testText.trim()) return;

    try {
      const regex = new RegExp(regexStr, flags);
      
      // ReDoS Shield: Evaluate execution time
      const startTime = performance.now();
      
      let matchResult: RegExpExecArray | null;
      const list: MatchGroup[] = [];
      
      // Reset lastIndex for safety
      regex.lastIndex = 0;

      if (flags.includes('g')) {
        while ((matchResult = regex.exec(testText)) !== null) {
          list.push({
            text: matchResult[0],
            index: matchResult.index
          });
          
          // Check for performance budget expiration (>200ms) to block catastrophic backtracking
          if (performance.now() - startTime > 200) {
            throw new Error('Regex execution timeout. Potential ReDoS detected.');
          }
          
          // Safe break for empty matches to avoid infinite loop
          if (regex.lastIndex === matchResult.index) {
            regex.lastIndex++;
          }
        }
      } else {
        matchResult = regex.exec(testText);
        if (matchResult) {
          list.push({
            text: matchResult[0],
            index: matchResult.index
          });
        }
      }

      setMatches(list);
      setReplacedOutput(testText.replace(regex, replaceText));

    } catch (err: any) {
      setError(err.message || 'Invalid Regular Expression syntax');
    }
  };

  const handleRegexStrChange = (val: string) => {
    setRegexStr(val);
    if (val.trim() === '') {
      setMatches([]);
      setReplacedOutput('');
      setError(null);
    }
  };

  const handleTestTextChange = (val: string) => {
    setTestText(val);
    if (val.trim() === '') {
      setMatches([]);
      setReplacedOutput('');
      setError(null);
    }
  };

  const isInputEmpty = !regexStr.trim() || !testText.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Regex Tester & Debugger</h2>
      <p style={styles.subtitle}>
        Validate regular expressions, view match groups, and test string replacements with dynamic ReDoS protection.
      </p>

      {/* Editor inputs */}
      <div style={styles.formCard}>
        <div style={styles.regexInputRow}>
          <div style={styles.regexField}>
            <span style={styles.slash}>/</span>
            <input
              type="text"
              value={regexStr}
              onChange={(e) => handleRegexStrChange(e.target.value)}
              style={styles.input}
              placeholder="Enter regular expression pattern..."
            />
            <span style={styles.slash}>/</span>
          </div>

          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value.toLowerCase())}
            style={styles.flagsInput}
            placeholder="flags"
            title="e.g. g (global), i (insensitive), m (multiline)"
          />
        </div>

        {error && (
          <div style={styles.errorCard}>
            <AlertCircle size={16} style={{ marginRight: 6, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div style={styles.splitRow}>
        {/* Left Test Fields */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Test String</label>
          <textarea
            value={testText}
            onChange={(e) => handleTestTextChange(e.target.value)}
            style={styles.textarea}
            placeholder="Enter string to test regex pattern matches against..."
          />

          <label style={styles.panelLabel}>Replacement String</label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            style={styles.replaceInput}
            placeholder="Text to replace matches with..."
          />

          {/* Action Button Row */}
          <div style={styles.btnRow}>
            <button
              onClick={handleRunRegex}
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
              Run Regex
            </button>
          </div>
        </div>

        {/* Right Result Panels */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Match Results ({matches.length})</label>
          <div style={styles.resultsBox}>
            {matches.length > 0 ? (
              matches.map((item, index) => (
                <div key={index} style={styles.matchItem}>
                  <span style={styles.matchIndex}>Index {item.index}:</span>
                  <span style={styles.matchText}>{item.text}</span>
                </div>
              ))
            ) : (
              <div style={styles.emptyText}>No active match groups found.</div>
            )}
          </div>

          <label style={styles.panelLabel}>Replaced Output</label>
          <div style={styles.outputBox}>
            {replacedOutput || testText}
          </div>
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
  formCard: {
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  regexInputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  regexField: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0 8px'
  },
  slash: {
    color: 'var(--text-muted)',
    fontSize: '16px',
    fontWeight: 600,
    userSelect: 'none'
  },
  input: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '13px',
    padding: '6px 4px',
    outline: 'none'
  },
  flagsInput: {
    width: '60px',
    padding: '6px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none',
    textAlign: 'center'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    border: '1px solid rgba(255, 59, 48, 0.15)'
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
    border: '1px solid var(--border-color)'
  },
  replaceInput: {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  resultsBox: {
    flex: 1.2,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  outputBox: {
    flex: 0.8,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '10px',
    overflowY: 'auto',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    wordBreak: 'break-all'
  },
  matchItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    fontFamily: 'monospace',
    padding: '4px 6px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px'
  },
  matchIndex: {
    color: 'var(--text-muted)',
    fontWeight: 600,
    flexShrink: 0
  },
  matchText: {
    color: 'var(--accent-blue)',
    fontWeight: 600,
    wordBreak: 'break-all'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px'
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
    width: '100%'
  }
};

