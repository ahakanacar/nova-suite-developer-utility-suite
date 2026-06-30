import React, { useState, useEffect } from 'react';
import { Copy, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface DecodedJwt {
  header: any;
  payload: any;
  isValid: boolean;
  error?: string | null;
}

export const JwtDebugger: React.FC = () => {
  // Classic dummy JWT for demonstration
  const defaultToken = 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI4MjE3NjY0MDB9." +
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const [token, setToken] = useState(defaultToken);
  const [decoded, setDecoded] = useState<DecodedJwt>({ header: null, payload: null, isValid: false });
  const [copied, setCopied] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const base64UrlDecode = (str: string) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    // Safe multi-byte UTF-8 decoding
    const raw = atob(base64);
    const utf8 = Array.from(raw)
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('');
    return JSON.parse(decodeURIComponent(utf8));
  };

  const handleDecode = () => {
    if (!token.trim()) {
      setDecoded({ header: null, payload: null, isValid: false, error: null });
      return;
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setDecoded({
        header: null,
        payload: null,
        isValid: false,
        error: 'JWT must consist of exactly 3 parts separated by dots (.)'
      });
      return;
    }

    try {
      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      setDecoded({
        header,
        payload,
        isValid: true,
        error: null
      });
    } catch (err: any) {
      setDecoded({
        header: null,
        payload: null,
        isValid: false,
        error: 'Failed to decode token parts: ' + err.message
      });
    }
  };

  useEffect(() => {
    handleDecode();
  }, []);

  const handleCopy = (text: string, type: 'header' | 'payload') => {
    if (!text) return;
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getExpirationStatus = () => {
    if (!decoded.isValid || !decoded.payload || !decoded.payload.exp) {
      return null;
    }

    const expTime = decoded.payload.exp * 1000;
    const now = Date.now();
    const expDate = new Date(expTime);
    const isExpired = now > expTime;

    return {
      dateStr: expDate.toLocaleString(),
      isExpired,
      timeLeft: Math.round(Math.abs(expTime - now) / 60000) // in minutes
    };
  };

  const expStatus = getExpirationStatus();
  const isInputEmpty = !token.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>JWT Debugger</h2>
      <p style={styles.subtitle}>
        Decode and debug JSON Web Tokens. View structured headers, claims payload parameters, and expiration timings.
      </p>

      <div style={styles.splitLayout}>
        {/* Token Input Panel */}
        <div style={styles.leftPanel}>
          <label style={styles.panelLabel}>Encoded Token</label>
          <textarea
            value={token}
            onChange={(e) => {
              const val = e.target.value;
              setToken(val);
              if (!val.trim()) {
                setDecoded({ header: null, payload: null, isValid: false, error: null });
              }
            }}
            disabled={false}
            readOnly={false}
            style={styles.tokenTextarea}
            placeholder="Paste your JWT here..."
          />
          
          <button
            onClick={handleDecode}
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
            Decode Token
          </button>

          {decoded.error && (
            <div style={styles.errorCard}>
              <AlertCircle size={16} style={{ marginRight: 6, flexShrink: 0 }} />
              <span>{decoded.error}</span>
            </div>
          )}
          {decoded.isValid && expStatus && (
            <div style={expStatus.isExpired ? styles.expiredCard : styles.activeCard}>
              <Clock size={16} style={{ marginRight: 6, flexShrink: 0 }} />
              <div>
                <strong>Expiration time (exp): </strong>
                {expStatus.dateStr}
                <span style={{ marginLeft: 6 }}>
                  ({expStatus.isExpired ? `Expired ${expStatus.timeLeft} minutes ago` : `Expires in ${expStatus.timeLeft} minutes`})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Decoded Content View */}
        <div style={styles.rightPanel}>
          {decoded.isValid ? (
            <>
              {/* Header Block */}
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={{ ...styles.blockTitle, color: 'var(--accent-red)' }}>HEADER: ALGORITHM & TOKEN TYPE</span>
                  <button
                    onClick={() => handleCopy(decoded.header, 'header')}
                    style={styles.copyBtn}
                    disabled={!decoded.isValid}
                  >
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copied === 'header' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{ ...styles.preCode, borderLeftColor: 'var(--accent-red)' }}>
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              {/* Payload Block */}
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={{ ...styles.blockTitle, color: 'var(--accent-blue)' }}>PAYLOAD: DATA / CLAIMS</span>
                  <button
                    onClick={() => handleCopy(decoded.payload, 'payload')}
                    style={styles.copyBtn}
                    disabled={!decoded.isValid}
                  >
                    <Copy size={12} style={{ marginRight: 4 }} />
                    {copied === 'payload' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{ ...styles.preCode, borderLeftColor: 'var(--accent-blue)' }}>
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>

              {/* Signature Block */}
              <div style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={{ ...styles.blockTitle, color: 'var(--accent-green)' }}>VERIFY SIGNATURE</span>
                </div>
                <div style={{ ...styles.signaturePlaceholder, borderLeftColor: 'var(--accent-green)' }}>
                  <ShieldCheck size={16} color="var(--accent-green)" style={{ marginRight: 6 }} />
                  <span>HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), signature_secret )</span>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.placeholderContainer}>
              <p style={styles.placeholderText}>Decoded token contents will appear here.</p>
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
  splitLayout: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '400px'
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rightPanel: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  panelLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  tokenTextarea: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'none',
    border: '1px solid var(--border-color)',
    wordBreak: 'break-all'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
    outline: 'none',
    width: '100%'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.15)'
  },
  expiredCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.15)'
  },
  activeCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    color: 'var(--accent-green)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(52, 199, 89, 0.15)'
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  blockTitle: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px'
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
  preCode: {
    margin: 0,
    padding: '10px 12px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid #fff',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '12px',
    overflowX: 'auto',
    color: 'var(--text-primary)'
  },
  signaturePlaceholder: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid #fff',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'var(--text-muted)',
    overflowX: 'auto'
  },
  placeholderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '24px'
  },
  placeholderText: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  }
};
