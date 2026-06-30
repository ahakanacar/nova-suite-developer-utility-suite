import React, { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

export const XmlTagChecker: React.FC = () => {
  const [promptText, setPromptText] = useState(
    `<instructions>\n` +
    `<context>\n` +
    `You are a helpful assistant translating text.\n` +
    `</context>\n` +
    `Translate: "Hello world"\n` +
    `<!-- Forgot to close instructions tag -->`
  );

  const [audited, setAudited] = useState(false);
  const [isValidStructure, setIsValidStructure] = useState(true);
  const [unclosedList, setUnclosedList] = useState<string[]>([]);
  const [fixedPrompt, setFixedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleValidateAndFix = () => {
    if (!promptText.trim()) return;

    const tagRegex = /<(\/?[a-zA-Z0-9_\-]+)([^>]*?)>/g;
    const stack: string[] = [];
    const unclosedTags: string[] = [];
    let match;
    let isValid = true;

    while ((match = tagRegex.exec(promptText)) !== null) {
      const fullTag = match[0];
      const tagContent = match[1];
      const isClosing = tagContent.startsWith('/');
      const isSelfClosing = match[2].trim().endsWith('/') || fullTag.endsWith('/>');

      if (isSelfClosing) continue;

      const tagName = isClosing ? tagContent.substring(1) : tagContent;

      if (!isClosing) {
        stack.push(tagName);
      } else {
        const last = stack.lastIndexOf(tagName);
        if (last !== -1) {
          const popped = stack.splice(last);
          popped.slice(1).forEach(t => {
            if (!unclosedTags.includes(t)) unclosedTags.push(t);
          });
        } else {
          isValid = false;
        }
      }
    }

    // Remaining on stack are unclosed
    const remainingUnclosed = [...stack].reverse();
    remainingUnclosed.forEach(t => {
      if (!unclosedTags.includes(t)) unclosedTags.push(t);
    });

    const fixed = promptText + (stack.length > 0 ? '\n' + stack.reverse().map(t => `</${t}>`).join('\n') : '');
    const xmlValid = isValid && remainingUnclosed.length === 0;

    setIsValidStructure(xmlValid);
    setUnclosedList(unclosedTags);
    setFixedPrompt(fixed);
    setAudited(true);
  };

  const handleInputChange = (val: string) => {
    setPromptText(val);
    if (val.trim() === '') {
      setAudited(false);
      setIsValidStructure(true);
      setUnclosedList([]);
      setFixedPrompt('');
    }
  };

  const handleCopy = () => {
    if (!fixedPrompt) return;
    navigator.clipboard.writeText(fixedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const isPromptEmpty = !promptText.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Prompt XML Tag & Markdown Validator</h2>
      <p style={styles.subtitle}>
        Detect unclosed tags, validate hierarchy, and auto-fix prompt structures in accordance with Claude and Gemini standards.
      </p>

      <div className="split-row" style={styles.splitRow}>
        {/* Left Input */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw Prompt Input</label>
          <textarea
            value={promptText}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              ...styles.textarea,
              border: audited && !isValidStructure ? '1px solid #ef4444' : '1px solid var(--border-color)'
            }}
            placeholder="Paste your prompt containing XML blocks..."
          />

          <button
            onClick={handleValidateAndFix}
            disabled={isPromptEmpty}
            onMouseEnter={() => !isPromptEmpty && setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              ...styles.primaryButton,
              backgroundColor: isPromptEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : (isBtnHovered ? '#732be6' : '#863bff'),
              cursor: isPromptEmpty ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Validate & Fix Prompt
          </button>
        </div>

        {/* Right Output */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Validation Output</label>
            {fixedPrompt && (
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

          {audited ? (
            <div style={styles.reportContent}>
              <div style={styles.indicatorsRow}>
                <div
                  style={{
                    ...styles.indicator,
                    borderColor: isValidStructure ? '#22c55e' : '#ef4444',
                    backgroundColor: isValidStructure ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <span style={styles.indicatorLabel}>XML Structure:</span>
                  <span style={{ ...styles.indicatorValue, color: isValidStructure ? '#22c55e' : '#ef4444' }}>
                    {isValidStructure ? 'Valid' : 'Invalid'}
                  </span>
                </div>

                <div
                  style={{
                    ...styles.indicator,
                    borderColor: unclosedList.length === 0 ? '#22c55e' : '#ef4444',
                    backgroundColor: unclosedList.length === 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <span style={styles.indicatorLabel}>Unclosed Tags:</span>
                  <span style={{ ...styles.indicatorValue, color: unclosedList.length === 0 ? '#22c55e' : '#ef4444' }}>
                    {unclosedList.length === 0 ? 'None' : unclosedList.join(', ')}
                  </span>
                </div>
              </div>

              <div style={styles.fixedPromptTitle}>Sanitized & Fixed Prompt</div>
              <pre
                onClick={handleCopy}
                style={{
                  ...styles.outputPre,
                  cursor: 'pointer',
                  borderColor: copied ? '#22c55e' : 'var(--border-color)',
                  transform: copied ? 'scale(1.01)' : 'scale(1)'
                }}
              >
                <code>{fixedPrompt}</code>
              </pre>
            </div>
          ) : (
            <div style={styles.emptyOutputBox}>
              Validated prompt will appear here...
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
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  reportContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    overflowY: 'auto'
  },
  indicatorsRow: {
    display: 'flex',
    gap: '12px'
  },
  indicator: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  indicatorLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  indicatorValue: {
    fontSize: '13px',
    fontWeight: 600
  },
  fixedPromptTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
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
