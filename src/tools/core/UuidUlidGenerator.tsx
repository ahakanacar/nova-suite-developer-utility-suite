import React, { useState } from 'react';
import { Copy, Info } from 'lucide-react';

export const UuidUlidGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHoveredUuid, setIsHoveredUuid] = useState(false);
  
  // ULID Decode States
  const [decodeInput, setDecodeInput] = useState('');
  const [decodedDate, setDecodedDate] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // High entropy cryptographic UUID v4 generator
  const generateUuid = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // Set UUID v4 variant/version bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx

    const hex: string[] = [];
    for (let i = 0; i < 16; i++) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }

    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join('')
    ].join('-');
  };

  // ULID Base32 characters map
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  
  // Custom ULID generator using timestamp and high entropy random values
  const generateUlid = (): string => {
    const time = Date.now();
    const timeChars = new Array(10);
    let tempTime = time;

    // Encode timestamp (48 bits) to 10 base32 characters
    for (let i = 9; i >= 0; i--) {
      const mod = tempTime % 32;
      timeChars[i] = ENCODING[mod];
      tempTime = Math.floor(tempTime / 32);
    }

    // Encode randomness (80 bits) to 16 base32 characters
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);
    const randomChars = new Array(16);
    for (let i = 0; i < 16; i++) {
      const randIdx = randomBytes[i % 10] % 32;
      randomChars[i] = ENCODING[randIdx];
    }

    return timeChars.join('') + randomChars.join('');
  };

  const handleGenerate = (idType: 'uuid' | 'ulid') => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(idType === 'uuid' ? generateUuid() : generateUlid());
    }
    setOutput(list);
  };

  const handleCopy = () => {
    if (output.length === 0) return;
    navigator.clipboard.writeText(output.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Decode ULID timestamp
  const handleDecode = () => {
    setDecodeError(null);
    setDecodedDate(null);

    const inputClean = decodeInput.trim().toUpperCase();
    if (inputClean.length !== 26) {
      setDecodeError('Invalid 26-character ULID format.');
      return;
    }

    // Check for invalid base32 characters
    const regex = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;
    if (!regex.test(inputClean)) {
      setDecodeError('Invalid 26-character ULID format.');
      return;
    }

    // Parse the first 10 time-based characters
    const timePart = inputClean.substring(0, 10);
    let timestamp = 0;
    for (let i = 0; i < 10; i++) {
      const char = timePart[i];
      const val = ENCODING.indexOf(char);
      timestamp = (timestamp * 32) + val;
    }

    if (isNaN(timestamp) || timestamp <= 0) {
      setDecodeError('Invalid 26-character ULID format.');
    } else {
      const date = new Date(timestamp);
      setDecodedDate(date.toLocaleString() + ` (${timestamp} ms)`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>UUID / ULID Generator</h2>
      <p style={styles.subtitle}>
        Generate cryptographically secure UUID v4 or Sortable ULIDs, and decode timestamps from existing ULIDs.
      </p>

      {/* Control Configuration Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.selectGroup}>
          <span style={styles.controlLabel}>Generate Count</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>1 Item</option>
            <option value={5}>5 Items</option>
            <option value={10}>10 Items</option>
            <option value={50}>50 Items</option>
            <option value={100}>100 Items</option>
          </select>

          <button
            onClick={() => handleGenerate('uuid')}
            onMouseEnter={() => setIsHoveredUuid(true)}
            onMouseLeave={() => setIsHoveredUuid(false)}
            style={{
              ...styles.primaryButton,
              backgroundColor: isHoveredUuid ? 'var(--accent-blue-hover)' : 'var(--accent-blue)'
            }}
          >
            Generate UUID v4
          </button>
          <button
            onClick={() => handleGenerate('ulid')}
            style={styles.secondaryButton}
          >
            Generate ULID
          </button>
        </div>
      </div>

      <div style={styles.splitRow}>
        {/* Output list panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Generated Identifiers</label>
            {output.length > 0 && (
              <button onClick={handleCopy} style={styles.copyButton}>
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? 'Copied List' : 'Copy All'}
              </button>
            )}
          </div>
          <div style={styles.outputBox}>
            {output.length > 0 ? (
              output.map((id, index) => (
                <div key={index} style={styles.outputItem}>
                  {id}
                </div>
              ))
            ) : (
              <div style={styles.emptyText}>Click generate to create unique secure identifiers.</div>
            )}
          </div>
        </div>

        {/* Decoder panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>ULID Timestamp Decoder</label>
          <div style={styles.decodeBox}>
            <div style={styles.decodeInputRow}>
              <input
                type="text"
                value={decodeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setDecodeInput(val);
                  if (!val.trim()) {
                    setDecodedDate(null);
                    setDecodeError(null);
                  }
                }}
                style={styles.inputField}
                placeholder="Enter 26-char ULID (e.g. 01ARZ3NDEK...)"
              />
              <button
                onClick={handleDecode}
                disabled={!decodeInput.trim()}
                style={{
                  ...styles.secondaryButton,
                  opacity: !decodeInput.trim() ? 0.6 : 1,
                  cursor: !decodeInput.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Decode
              </button>
            </div>

            {decodeError && (
              <div style={styles.errorCard}>
                <Info size={14} style={{ marginRight: 6 }} />
                {decodeError}
              </div>
            )}

            {decodedDate && (
              <div style={styles.successCard}>
                <Info size={14} style={{ marginRight: 6 }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Decoded Timestamp</div>
                  <strong style={{ fontSize: '13px' }}>{decodedDate}</strong>
                </div>
              </div>
            )}
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
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  modeToggleGroup: {
    display: 'flex',
    backgroundColor: 'var(--bg-window)',
    padding: '2px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  tabButton: {
    padding: '4px 12px',
    border: 'none',
    background: 'none',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  activeTabButton: {
    padding: '4px 12px',
    border: 'none',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    cursor: 'pointer'
  },
  selectGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
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
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
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
  outputBox: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    padding: '12px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  outputItem: {
    padding: '6px 8px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
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
  decodeBox: {
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  decodeInputRow: {
    display: 'flex',
    gap: '8px'
  },
  inputField: {
    flex: 1,
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '11px',
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
    border: '1px solid rgba(52, 199, 89, 0.15)'
  }
};
