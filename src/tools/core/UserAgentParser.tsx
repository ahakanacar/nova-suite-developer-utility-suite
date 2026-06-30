import React, { useState } from 'react';
import { Laptop } from 'lucide-react';

interface ParsedUa {
  browser: string;
  os: string;
  device: string;
  engine: string;
}

export const UserAgentParser: React.FC = () => {
  const [uaInput, setUaInput] = useState(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  const [parsed, setParsed] = useState<ParsedUa>({
    browser: 'Chrome',
    os: 'macOS',
    device: 'Desktop',
    engine: 'Webkit (Blink)'
  });

  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const parseUserAgent = (ua: string) => {
    if (!ua || ua.trim() === '') {
      setParsed({ browser: '-', os: '-', device: '-', engine: '-' });
      return;
    }

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';
    let engine = 'Unknown';

    // 1. Detect OS
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua) && !/like mac os x/i.test(ua)) os = 'macOS';
    else if (/iphone|ipad|ipod/i.test(ua)) {
      os = 'iOS';
      device = 'Mobile/Tablet';
    } else if (/android/i.test(ua)) {
      os = 'Android';
      device = 'Mobile/Tablet';
    } else if (/linux/i.test(ua)) os = 'Linux';

    // 2. Detect Browser
    if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/chrome|crios/i.test(ua)) {
      if (/edg/i.test(ua)) browser = 'Edge';
      else if (/opr/i.test(ua)) browser = 'Opera';
      else browser = 'Chrome';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/trident|msie/i.test(ua)) browser = 'Internet Explorer';

    // 3. Detect Engine
    if (/applewebkit/i.test(ua)) engine = 'Webkit (Blink)';
    else if (/gecko/i.test(ua) && !/like gecko/i.test(ua)) engine = 'Gecko';
    else if (/presto/i.test(ua)) engine = 'Presto';
    else if (/trident/i.test(ua)) engine = 'Trident';

    setParsed({ browser, os, device, engine });
  };

  const handleParse = () => {
    parseUserAgent(uaInput);
  };

  const handleDetectSelf = () => {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const selfUa = navigator.userAgent;
      setUaInput(selfUa);
      parseUserAgent(selfUa); // Run immediately (macro exception)
    }
  };

  const handleInputChange = (val: string) => {
    setUaInput(val);
    if (val.trim() === '') {
      setParsed({
        browser: '-',
        os: '-',
        device: '-',
        engine: '-'
      });
    }
  };

  const isInputEmpty = !uaInput || uaInput.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Agent Parser</h2>
      <p style={styles.subtitle}>
        Deconstruct raw user agent strings to extract OS details, browser brands, engine configurations, and device targets.
      </p>

      {/* Control bar */}
      <div style={styles.controlsBar}>
        <button onClick={handleDetectSelf} style={styles.primaryButton}>
          <Laptop size={14} style={{ marginRight: 6 }} /> Detect My Browser
        </button>
      </div>

      <div style={styles.splitRow}>
        {/* Input Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw User Agent String</label>
          <textarea
            value={uaInput}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Paste user agent string here..."
          />
          
          {/* Action Button Row */}
          <div style={styles.btnRow}>
            <button
              onClick={handleParse}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.actionButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isBtnHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Parse User Agent
            </button>
          </div>
        </div>

        {/* Results Metadata List */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Extracted Metrics</label>
          <div style={styles.resultsContainer}>
            <div style={styles.resultItem}>
              <span style={styles.resultMeta}>Browser Brand</span>
              <span style={styles.resultValue}>{parsed.browser}</span>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultMeta}>Operating System</span>
              <span style={styles.resultValue}>{parsed.os}</span>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultMeta}>Device Category</span>
              <span style={styles.resultValue}>{parsed.device}</span>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultMeta}>Rendering Engine</span>
              <span style={styles.resultValue}>{parsed.engine}</span>
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
    backgroundColor: 'var(--bg-sidebar)'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
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
  resultsContainer: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px dashed var(--border-color)'
  },
  resultMeta: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  resultValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent-blue)'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px'
  },
  actionButton: {
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

