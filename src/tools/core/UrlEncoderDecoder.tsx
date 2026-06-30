import React, { useState, useEffect } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';

interface QueryParam {
  key: string;
  value: string;
}

export const UrlEncoderDecoder: React.FC = () => {
  const [input, setInput] = useState('https://novasuite.dev/search?q=developer tools&category=core&mode=dark');
  const [output, setOutput] = useState('');
  const [spaceMode, setSpaceMode] = useState<'20' | 'plus'>('20');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse parameters from a URL string manually
  const parseQueryParams = (urlText: string) => {
    try {
      let queryString = '';
      if (urlText.includes('?')) {
        queryString = urlText.split('?')[1];
      } else if (urlText.includes('=')) {
        queryString = urlText;
      }

      if (!queryString) {
        setQueryParams([]);
        return;
      }

      const params = new URLSearchParams(queryString);
      const parsedParams: QueryParam[] = [];
      params.forEach((value, key) => {
        parsedParams.push({ key, value });
      });
      setQueryParams(parsedParams);
    } catch {
      setQueryParams([]);
    }
  };

  const getRebuiltUrl = () => {
    if (queryParams.length === 0) return input;
    const searchParams = new URLSearchParams();
    queryParams.forEach((p) => {
      if (p.key) searchParams.append(p.key, p.value);
    });
    const searchStr = searchParams.toString();
    const baseUrl = input.includes('?') ? input.split('?')[0] : input;
    return baseUrl + (searchStr ? '?' + searchStr : '');
  };

  const handleConvert = (currentMode: 'encode' | 'decode') => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      setQueryParams([]);
      return;
    }
    try {
      if (currentMode === 'encode') {
        const targetUrl = getRebuiltUrl();
        setInput(targetUrl); // Sync textarea visually with rebuilt parameters
        let result = encodeURIComponent(targetUrl);
        if (spaceMode === 'plus') {
          result = result.replace(/%20/g, '+');
        }
        setOutput(result);
      } else {
        const cleaned = spaceMode === 'plus' ? input.replace(/\+/g, ' ') : input;
        const decoded = decodeURIComponent(cleaned);
        setOutput(decoded);
        
        // Parse parameters only after successful decoding
        parseQueryParams(decoded);
      }
    } catch {
      setError('Invalid URI sequence. Please check your URL input.');
      setOutput('');
    }
  };

  // Perform initial formatting and param parsing on component mount
  useEffect(() => {
    handleConvert('encode');
    // Also parse query parameters initially for the default URL value
    parseQueryParams(input);
  }, []);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateParam = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...queryParams];
    updated[index][field] = val;
    setQueryParams(updated);
  };

  const deleteParam = (index: number) => {
    const updated = queryParams.filter((_, i) => i !== index);
    setQueryParams(updated);
  };

  const addParam = () => {
    const updated = [...queryParams, { key: 'key', value: 'value' }];
    setQueryParams(updated);
  };

  const isInputEmpty = !input.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>URL Encoder / Decoder</h2>
      <p style={styles.subtitle}>
        Percent-encode or decode URLs/strings and visualize/edit query parameters directly.
      </p>

      {/* Configuration Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.spaceSelectGroup}>
          <span style={styles.controlLabel}>Spaces as:</span>
          <select
            value={spaceMode}
            onChange={(e) => setSpaceMode(e.target.value as '20' | 'plus')}
            style={styles.select}
          >
            <option value="20">%20</option>
            <option value="plus">+</option>
          </select>
        </div>
      </div>

      {error && <div style={styles.errorCard}>{error}</div>}

      {/* Editor Split Layout */}
      <div style={styles.splitRow}>
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Input URL / String</label>
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (!val.trim()) {
                setOutput('');
                setQueryParams([]);
                setError(null);
              }
            }}
            style={styles.textarea}
            placeholder="Enter URL or string..."
          />
          <div style={styles.btnRow}>
            <button
              onClick={() => handleConvert('encode')}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                ...styles.primaryButton,
                backgroundColor: isInputEmpty 
                  ? 'rgba(134, 59, 255, 0.4)' 
                  : (isHovered ? 'var(--accent-blue-hover)' : 'var(--accent-blue)'),
                opacity: isInputEmpty ? 0.6 : 1,
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Encode URL
            </button>
            <button
              onClick={() => handleConvert('decode')}
              disabled={isInputEmpty}
              style={{
                ...styles.secondaryButton,
                opacity: isInputEmpty ? 0.6 : 1,
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Decode URL
            </button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Encoded / Decoded Output</label>
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
            placeholder="Result will appear here..."
          />
        </div>
      </div>

      {/* Query Parameters Visual Editor Section */}
      {queryParams.length > 0 && (
        <div style={styles.paramSection}>
          <div style={styles.paramHeaderRow}>
            <label style={styles.panelLabel}>Query Parameters Editor</label>
            <button onClick={addParam} style={styles.addButton}>
              <Plus size={12} style={{ marginRight: 4 }} /> Add Param
            </button>
          </div>

          <div style={styles.paramTable}>
            {queryParams.map((param, index) => (
              <div key={index} style={styles.paramRow}>
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateParam(index, 'key', e.target.value)}
                  style={styles.paramInput}
                  placeholder="Key"
                />
                <span style={styles.paramDelimiter}>=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateParam(index, 'value', e.target.value)}
                  style={styles.paramInput}
                  placeholder="Value"
                />
                <button onClick={() => deleteParam(index)} style={styles.deleteButton}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
    padding: '10px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-blue)',
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
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
    outline: 'none'
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  spaceSelectGroup: {
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
    minHeight: '200px'
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
  paramSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  paramHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  paramTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '150px',
    overflowY: 'auto'
  },
  paramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  paramInput: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  paramDelimiter: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: 600
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-red)',
    cursor: 'pointer',
    padding: '4px'
  },
  errorCard: {
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.15)'
  }
};
