import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export const CryptographicHasher: React.FC = () => {
  const [input, setInput] = useState('Hello NovaSuite');
  const [casing, setCasing] = useState<'lower' | 'upper'>('lower');
  
  // Hash outputs
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [md5Hash, setMd5Hash] = useState('');

  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // Helper: MD5 algorithm local implementation (safe, standalone)
  const calculateMd5 = (str: string): string => {
    let k = [
      0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
      0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
      0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
      0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
      0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
      0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
      0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
      0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    let r = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    
    let bytes = new TextEncoder().encode(str);
    let words: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
      words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    let bitLen = bytes.length * 8;
    words[bitLen >> 5] |= 0x80 << (bitLen % 32);
    words[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen;

    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;

    for (let i = 0; i < words.length; i += 16) {
      let a = h0, b = h1, c = h2, d = h3;
      for (let j = 0; j < 64; j++) {
        let f = 0, g = 0;
        if (j < 16) {
          f = (b & c) | (~b & d);
          g = j;
        } else if (j < 32) {
          f = (d & b) | (~d & c);
          g = (5 * j + 1) % 16;
        } else if (j < 48) {
          f = b ^ c ^ d;
          g = (3 * j + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          g = (7 * j) % 16;
        }
        let temp = d;
        d = c;
        c = b;
        let rotateLeft = (num: number, cnt: number) => (num << cnt) | (num >>> (32 - cnt));
        b = b + rotateLeft(a + f + k[j] + (words[i + g] || 0), r[j]);
        a = temp;
      }
      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
    }

    let result = [h0, h1, h2, h3].map((val) => {
      let hex = '';
      for (let i = 0; i < 4; i++) {
        hex += ((val >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
      }
      return hex;
    }).join('');
    
    return result;
  };

  // Convert buffer to hex string
  const bufToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleGenerateHashes = () => {
    if (!input || input.trim() === '') {
      setSha256Hash('');
      setSha512Hash('');
      setSha1Hash('');
      setMd5Hash('');
      return;
    }

    const encode = new TextEncoder().encode(input);

    // Dynamic browser native SubtleCrypto hashes
    crypto.subtle.digest('SHA-256', encode).then((buf) => {
      setSha256Hash(bufToHex(buf));
    });

    crypto.subtle.digest('SHA-512', encode).then((buf) => {
      setSha512Hash(bufToHex(buf));
    });

    crypto.subtle.digest('SHA-1', encode).then((buf) => {
      setSha1Hash(bufToHex(buf));
    });

    // MD5 local fallback
    setMd5Hash(calculateMd5(input));
  };

  const handleCopy = (text: string, algo: string) => {
    if (!text) return;
    const formatted = casing === 'lower' ? text.toLowerCase() : text.toUpperCase();
    navigator.clipboard.writeText(formatted);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  const formatHash = (text: string) => {
    return casing === 'lower' ? text.toLowerCase() : text.toUpperCase();
  };

  const isInputEmpty = !input || input.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Cryptographic Hasher</h2>
      <p style={styles.subtitle}>
        Compute cryptographic hash digests including MD5, SHA-1, SHA-256, and SHA-512 in the browser safely.
      </p>

      {/* Configuration bar */}
      <div style={styles.controlsBar}>
        <div style={styles.controlField}>
          <label style={styles.controlLabel}>Case Format</label>
          <select
            value={casing}
            onChange={(e) => setCasing(e.target.value as 'lower' | 'upper')}
            style={styles.select}
          >
            <option value="lower">Lowercase Hex</option>
            <option value="upper">Uppercase Hex</option>
          </select>
        </div>
      </div>

      <div style={styles.splitRow}>
        {/* Source Text Input */}
        <div style={styles.leftPanel}>
          <label style={styles.panelLabel}>Plain Text Input</label>
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (val.trim() === '') {
                setSha256Hash('');
                setSha512Hash('');
                setSha1Hash('');
                setMd5Hash('');
              }
            }}
            style={styles.textarea}
            placeholder="Enter plain text to hash..."
          />
          
          {/* Action Row */}
          <div style={styles.btnRow}>
            <button
              onClick={handleGenerateHashes}
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
              Generate Hashes
            </button>
          </div>
        </div>

        {/* Hashes Output List */}
        <div style={styles.rightPanel}>
          <label style={styles.panelLabel}>Computed Digests</label>
          <div style={styles.hashesContainer}>
            {/* SHA-256 */}
            <div style={styles.hashCard}>
              <div style={styles.hashMeta}>
                <span>SHA-256</span>
                {sha256Hash && (
                  <button onClick={() => handleCopy(sha256Hash, 'sha256')} style={styles.copyBtn}>
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copiedAlgo === 'sha256' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={styles.hashValue}>{sha256Hash ? formatHash(sha256Hash) : '-'}</div>
            </div>

            {/* SHA-512 */}
            <div style={styles.hashCard}>
              <div style={styles.hashMeta}>
                <span>SHA-512</span>
                {sha512Hash && (
                  <button onClick={() => handleCopy(sha512Hash, 'sha512')} style={styles.copyBtn}>
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copiedAlgo === 'sha512' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={{ ...styles.hashValue, fontSize: '10px' }}>
                {sha512Hash ? formatHash(sha512Hash) : '-'}
              </div>
            </div>

            {/* SHA-1 */}
            <div style={styles.hashCard}>
              <div style={styles.hashMeta}>
                <span>SHA-1</span>
                {sha1Hash && (
                  <button onClick={() => handleCopy(sha1Hash, 'sha1')} style={styles.copyBtn}>
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copiedAlgo === 'sha1' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={styles.hashValue}>{sha1Hash ? formatHash(sha1Hash) : '-'}</div>
            </div>

            {/* MD5 */}
            <div style={styles.hashCard}>
              <div style={styles.hashMeta}>
                <span>MD5</span>
                {md5Hash && (
                  <button onClick={() => handleCopy(md5Hash, 'md5')} style={styles.copyBtn}>
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copiedAlgo === 'md5' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={styles.hashValue}>{md5Hash ? formatHash(md5Hash) : '-'}</div>
            </div>
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
    minHeight: '340px'
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  rightPanel: {
    flex: 1.3,
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
  hashesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    overflowY: 'auto'
  },
  hashCard: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  hashMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  hashValue: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    wordBreak: 'break-all'
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
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
    outline: 'none'
  }
};

