import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

export const StringTransformer: React.FC = () => {
  const defaultText = "Merhaba NovaSuite, bu Türkçe karakter içeren test metnidir.";

  const [input, setInput] = useState(defaultText);
  const [format, setFormat] = useState<'camelCase' | 'snake_case' | 'PascalCase' | 'UPPERCASE' | 'lowercase'>('camelCase');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const slugifyText = (text: string): string => {
    let str = text.trim().toLowerCase();
    
    // Map Turkish characters
    const turkishMap: Record<string, string> = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'â': 'a', 'î': 'i', 'û': 'u'
    };
    
    str = str.split('').map((char) => turkishMap[char] || char).join('');
    
    // Replace spaces and non-alphanumeric with hyphens
    str = str.replace(/[^a-z0-9\s-]/g, ''); // Remove special characters
    str = str.replace(/\s+/g, '-');        // Replace spaces with hyphens
    str = str.replace(/-+/g, '-');         // Collapse multiple hyphens
    str = str.replace(/^-+|-+$/g, '');     // Trim hyphens from ends
    
    return str;
  };

  const transformText = (text: string, caseFormat: string): string => {
    const lines = text.split('\n');
    const transformedLines = lines.map(line => {
      if (caseFormat === 'UPPERCASE') {
        return line.toUpperCase();
      }
      if (caseFormat === 'lowercase') {
        return line.toLowerCase();
      }

      const cleanLine = line.replace(/[çğışöüÇĞIŞÖÜ]/g, (char) => {
        const map: Record<string, string> = {
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ş': 's', 'ö': 'o', 'ü': 'u',
          'Ç': 'C', 'Ğ': 'G', 'I': 'I', 'Ş': 'S', 'Ö': 'O', 'Ü': 'U'
        };
        return map[char] || char;
      });

      const words = cleanLine.split(/[\s_-]+/).filter((w) => w.length > 0);
      if (words.length === 0) return '';
      
      switch (caseFormat) {
        case 'camelCase':
          return words.map((w, idx) => {
            const clean = w.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            if (idx === 0) return clean;
            return clean.charAt(0).toUpperCase() + clean.slice(1);
          }).join('');
          
        case 'snake_case':
          return words.map((w) => w.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')).join('_');
          
        case 'PascalCase':
          return words.map((w) => {
            const clean = w.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            return clean.charAt(0).toUpperCase() + clean.slice(1);
          }).join('');
          
        default:
          return line;
      }
    });

    return transformedLines.join('\n');
  };

  const handleTransform = () => {
    if (!input.trim()) return;
    const res = transformText(input, format);
    setOutput(res);
  };

  const handleSlugify = () => {
    if (!input.trim()) return;
    const res = slugifyText(input);
    setOutput(res);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim() === '') {
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const isInputEmpty = !input || input.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Advanced String Transformer & Slugifier</h2>
      <p style={styles.subtitle}>
        Transform text patterns into camelCase, snake_case, PascalCase, or create clean, Turkish-character-free slugs for URLs.
      </p>

      <div style={styles.splitRow}>
        {/* Left Input & Config */}
        <div style={styles.panel}>
          <div style={styles.configRow}>
            <label style={styles.panelLabel}>Target Case Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              style={styles.select}
            >
              <option value="camelCase">camelCase</option>
              <option value="snake_case">snake_case</option>
              <option value="PascalCase">PascalCase</option>
              <option value="UPPERCASE">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
            </select>
          </div>

          <label style={styles.panelLabel}>Raw Metin Input</label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Enter raw text here..."
          />
          
          {/* Action Buttons */}
          <div style={styles.btnRow}>
            <button
              onClick={handleTransform}
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
              <RefreshCw size={14} style={{ marginRight: 6 }} /> Transform Case
            </button>
            <button
              onClick={handleSlugify}
              disabled={isInputEmpty}
              style={{
                ...styles.secondaryButton,
                cursor: isInputEmpty ? 'not-allowed' : 'pointer',
                opacity: isInputEmpty ? 0.5 : 1
              }}
            >
              Slugify Text
            </button>
          </div>
        </div>

        {/* Right Output */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Transformed Output</label>
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
          
          {output ? (
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
              Transformed text will appear here...
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
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    outline: 'none'
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
  }
};
