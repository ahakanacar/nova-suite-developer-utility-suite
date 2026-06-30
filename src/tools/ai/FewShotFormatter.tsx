import React, { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

type FormatType = 'openai' | 'anthropic' | 'raw';

export const FewShotFormatter: React.FC = () => {
  const defaultRawInput = 
    `User: Translate "hello" to French\n` +
    `Assistant: Bonjour\n` +
    `---\n` +
    `User: Translate "goodbye" to French\n` +
    `Assistant: Au revoir`;

  const [rawInput, setRawInput] = useState(defaultRawInput);
  const [format, setFormat] = useState<FormatType>('openai');
  const [formattedResults, setFormattedResults] = useState<Record<FormatType, string>>({
    openai: '',
    anthropic: '',
    raw: ''
  });
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [audited, setAudited] = useState(false);

  const parseRawIntoMessages = (text: string): { role: 'user' | 'assistant'; content: string }[] => {
    const lines = text.split('\n');
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    let currentRole: 'user' | 'assistant' | null = null;
    let currentContent: string[] = [];

    const commitMessage = () => {
      if (currentRole && currentContent.length > 0) {
        messages.push({
          role: currentRole,
          content: currentContent.join('\n').trim()
        });
      }
      currentContent = [];
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('---')) {
        commitMessage();
        currentRole = null;
        return;
      }

      const userMatch = line.match(/^(?:user|input):\s*(.*)/i);
      const assistantMatch = line.match(/^(?:assistant|output):\s*(.*)/i);

      if (userMatch) {
        commitMessage();
        currentRole = 'user';
        currentContent.push(userMatch[1]);
      } else if (assistantMatch) {
        commitMessage();
        currentRole = 'assistant';
        currentContent.push(assistantMatch[1]);
      } else {
        if (currentRole) {
          currentContent.push(line);
        }
      }
    });

    commitMessage();
    return messages;
  };

  const handleFormat = () => {
    if (!rawInput.trim()) return;

    const messages = parseRawIntoMessages(rawInput);
    if (messages.length === 0) {
      setFormattedResults({
        openai: '// Error: No valid examples parsed.',
        anthropic: '// Error: No valid examples parsed.',
        raw: '// Error: No valid examples parsed.'
      });
      setAudited(true);
      return;
    }

    // OpenAI format
    const openaiStr = JSON.stringify(messages, null, 2);

    // Anthropic format (XML)
    let anthropicStr = '<examples>\n';
    for (let i = 0; i < messages.length; i += 2) {
      const userMsg = messages[i];
      const assistantMsg = messages[i + 1];
      if (userMsg && userMsg.role === 'user') {
        anthropicStr += '  <example>\n';
        anthropicStr += `    <user>${userMsg.content}</user>\n`;
        if (assistantMsg && assistantMsg.role === 'assistant') {
          anthropicStr += `    <assistant>${assistantMsg.content}</assistant>\n`;
        } else {
          anthropicStr += `    <assistant></assistant>\n`;
        }
        anthropicStr += '  </example>\n';
      }
    }
    anthropicStr += '</examples>';

    // Raw format
    const rawStr = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    setFormattedResults({
      openai: openaiStr,
      anthropic: anthropicStr,
      raw: rawStr
    });
    setAudited(true);
  };

  const handleInputChange = (val: string) => {
    setRawInput(val);
    if (val.trim() === '') {
      setFormattedResults({
        openai: '',
        anthropic: '',
        raw: ''
      });
      setAudited(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = formattedResults[format];
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isInputEmpty = !rawInput || rawInput.trim() === '';
  const currentOutput = formattedResults[format];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Few-Shot Prompt Formatter</h2>
      <p style={styles.subtitle}>
        Structure LLM inputs by formatting custom training examples into standard payload schemas.
      </p>

      <div className="split-row" style={styles.splitRow}>
        {/* Input Panel */}
        <div style={styles.panel}>
          <label style={styles.label}>Raw Examples Input</label>
          <textarea
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              ...styles.textarea,
              overflowY: 'auto'
            }}
            placeholder="User: Translate 'hello' to French&#10;Assistant: Bonjour&#10;---&#10;User: Translate 'goodbye' to French&#10;Assistant: Au revoir"
          />

          <button
            onClick={handleFormat}
            disabled={isInputEmpty}
            onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              ...styles.formatButton,
              backgroundColor: isInputEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isBtnHovered
                  ? '#732be6'
                  : '#863bff',
              cursor: isInputEmpty ? 'not-allowed' : 'pointer',
              opacity: isInputEmpty ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Format Few-Shot Prompt
          </button>
        </div>

        {/* Output Panel */}
        <div style={styles.previewPanel}>
          <div style={styles.previewHeader}>
            <div style={styles.formatsGroup}>
              <button 
                onClick={() => setFormat('openai')} 
                style={{ ...styles.formatTab, ...(format === 'openai' ? styles.formatTabActive : {}) }}
              >
                OpenAI JSON
              </button>
              <button 
                onClick={() => setFormat('anthropic')} 
                style={{ ...styles.formatTab, ...(format === 'anthropic' ? styles.formatTabActive : {}) }}
              >
                Anthropic XML
              </button>
              <button 
                onClick={() => setFormat('raw')} 
                style={{ ...styles.formatTab, ...(format === 'raw' ? styles.formatTabActive : {}) }}
              >
                Raw Text
              </button>
            </div>
            
            {audited && currentOutput && (
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

          <pre style={{
            ...styles.outputBlock,
            cursor: currentOutput ? 'pointer' : 'default',
            borderColor: copied ? '#22c55e' : 'var(--border-color)',
            transform: copied ? 'scale(1.01)' : 'scale(1)'
          }}
          onClick={handleCopy}
          >
            <code>{currentOutput || 'Formatted few-shot result will appear here...'}</code>
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
    flex: 1,
    minHeight: '400px'
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  previewPanel: {
    width: '340px',
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
    border: '1px solid var(--border-color)',
    overflowY: 'auto'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '32px'
  },
  formatsGroup: {
    display: 'flex',
    gap: '4px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '2px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  formatTab: {
    padding: '3px 8px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    outline: 'none'
  },
  formatTabActive: {
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  copyButton: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '4px 8px',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
    cursor: 'pointer'
  },
  outputBlock: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap'
  },
  formatButton: {
    padding: '10px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    marginTop: '10px',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    outline: 'none',
    textAlign: 'center',
    width: '100%'
  }
};
