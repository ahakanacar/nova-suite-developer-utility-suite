import React, { useState } from 'react';
import { Copy, Upload, FileCheck } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('Hello NovaSuite!');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);

  const handleConvert = (currentMode: 'encode' | 'decode') => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (currentMode === 'encode') {
        // Support multi-byte UTF-8 characters safely using encodeURIComponent -> escape sequence base64
        const utf8Bytes = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        });
        setOutput(btoa(utf8Bytes));
      } else {
        // Decode base64 and recover multi-byte character representation safely
        const binary = atob(input.trim());
        const utf8 = Array.from(binary)
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('');
        setOutput(decodeURIComponent(utf8));
      }
    } catch (err: any) {
      setError(currentMode === 'decode' ? 'Invalid Base64 syntax for decoding.' : err.message);
      setOutput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileDetails({ name: file.name, size: file.size });
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setInput(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInputEmpty = !input.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Base64 Encoder / Decoder</h2>
      <p style={styles.subtitle}>
        Encode text/files into Base64 format or decode binary strings back to plain text.
      </p>

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <span style={styles.controlLabel}>Load File Data</span>
        {/* File Uploader */}
        <label style={styles.uploadButton}>
          <Upload size={14} style={{ marginRight: 6 }} />
          Upload File
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {fileDetails && (
        <div style={styles.fileDetailsBar}>
          <FileCheck size={14} color="var(--accent-blue)" style={{ marginRight: 6 }} />
          <span>
            Loaded file: <strong>{fileDetails.name}</strong> ({Math.round(fileDetails.size / 1024)} KB)
          </span>
        </div>
      )}

      {error && <div style={styles.errorCard}>{error}</div>}

      {/* Editor Split View */}
      <div style={styles.splitRow}>
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Source Input</label>
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
            placeholder="Enter source text or Base64 string here..."
          />
          <div style={styles.btnRow}>
            <button
              onClick={() => handleConvert('encode')}
              disabled={isInputEmpty}
              style={{
                ...styles.primaryButton,
                opacity: isInputEmpty ? 0.6 : 1,
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Encode to Base64
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
              Decode to Plain Text
            </button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Result Output</label>
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
  controlLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
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
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  fileDetailsBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRadius: '6px',
    fontSize: '12px',
    border: '1px solid var(--border-color)'
  },
  errorCard: {
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
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
  }
};
