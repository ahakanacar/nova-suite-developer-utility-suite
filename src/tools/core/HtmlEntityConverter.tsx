import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export const HtmlEntityConverter: React.FC = () => {
  const [input, setInput] = useState('<div>\n  <p class="premium">Hello & Welcome to NovaSuite!</p>\n</div>');
  const [output, setOutput] = useState('');
  const [lastAction, setLastAction] = useState<'escape' | 'unescape'>('escape');
  const [copied, setCopied] = useState(false);
  const [isEscapeHovered, setIsEscapeHovered] = useState(false);
  const [isUnescapeHovered, setIsUnescapeHovered] = useState(false);

  // Common entity mappings
  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    '¢': '&cent;',
    '£': '&pound;',
    '¥': '&yen;',
    '€': '&euro;',
    '©': '&copy;',
    '®': '&reg;'
  };

  const handleConvert = (currentMode: 'escape' | 'unescape') => {
    if (!input || input.trim() === '') {
      setOutput('');
      return;
    }

    setLastAction(currentMode);

    if (currentMode === 'escape') {
      // Escape characters to HTML Entities
      const escaped = input.replace(/[&<>"'¢£¥€©®]/g, (char) => htmlEntities[char] || char);
      setOutput(escaped);
    } else {
      // Unescape HTML Entities back to characters
      let unescaped = input;
      // Replace named entities
      Object.entries(htmlEntities).forEach(([char, entity]) => {
        unescaped = unescaped.replace(new RegExp(entity, 'g'), char);
      });
      // Replace decimal entities (e.g. &#60;)
      unescaped = unescaped.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
      // Replace hex entities (e.g. &#x3c;)
      unescaped = unescaped.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      
      setOutput(unescaped);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInputEmpty = !input || input.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>HTML / XML Entity Converter</h2>
      <p style={styles.subtitle}>
        Escape special characters to HTML/XML entities or unescape them back into normal text tags.
      </p>

      <div style={styles.splitRow}>
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Source Code / Text Input</label>
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (val.trim() === '') {
                setOutput('');
              }
            }}
            style={styles.textarea}
            placeholder="Enter HTML tags, text, or escaped entities..."
          />
          
          {/* Action Buttons Row */}
          <div style={styles.btnRow}>
            <button
              onClick={() => handleConvert('escape')}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsEscapeHovered(true)}
              onMouseLeave={() => setIsEscapeHovered(false)}
              style={{
                ...styles.primaryButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isEscapeHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Escape Text
            </button>
            <button
              onClick={() => handleConvert('unescape')}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsUnescapeHovered(true)}
              onMouseLeave={() => setIsUnescapeHovered(false)}
              style={{
                ...styles.secondaryButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(44, 44, 53, 0.4)'
                  : (isUnescapeHovered ? '#3a3a47' : 'var(--bg-sidebar, #1e1e24)'),
                color: isInputEmpty ? 'var(--text-secondary)' : 'var(--text-primary)',
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Unescape Entities
            </button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>
              {lastAction === 'escape' ? 'Escaped Entity Output' : 'Plain Text / Tag Output'}
            </label>
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
            placeholder="Result will appear here after clicking an action button..."
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
    gap: '12px',
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
    outline: 'none'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #3a3a45)',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease, color 0.15s ease',
    outline: 'none'
  }
};

