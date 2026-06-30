import React, { useState, useEffect } from 'react';
import { Play, Pause, Copy, Info } from 'lucide-react';

export const DateEpochConverter: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Epoch to Date conversion states
  const [epochInput, setEpochInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [epochUnit, setEpochUnit] = useState<'s' | 'ms'>('s');
  const [decodedLocal, setDecodedLocal] = useState('');
  const [decodedUtc, setDecodedUtc] = useState('');
  const [decodedIso, setDecodedIso] = useState('');
  const [epochError, setEpochError] = useState<string | null>(null);

  // Date to Epoch conversion states
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('06');
  const [day, setDay] = useState('24');
  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('20');
  const [second, setSecond] = useState('00');

  const [resultEpochS, setResultEpochS] = useState<number | null>(null);
  const [resultEpochMs, setResultEpochMs] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isHoveredEpoch, setIsHoveredEpoch] = useState(false);
  const [isHoveredDate, setIsHoveredDate] = useState(false);

  // Live timer tick
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleConvertToDate = () => {
    setEpochError(null);
    setDecodedLocal('');
    setDecodedUtc('');
    setDecodedIso('');

    const trimmed = epochInput.trim();
    if (!trimmed) return;

    const val = parseInt(trimmed);
    if (isNaN(val) || val < 0) {
      setEpochError('Invalid epoch timestamp. Please enter a positive integer.');
      return;
    }

    const ms = epochUnit === 's' ? val * 1000 : val;
    const d = new Date(ms);
    
    if (isNaN(d.getTime())) {
      setEpochError('Invalid date conversion. Check timestamp values.');
    } else {
      setDecodedLocal(d.toString());
      setDecodedUtc(d.toUTCString());
      setDecodedIso(d.toISOString());
    }
  };

  const handleConvertToEpoch = () => {
    setDateError(null);
    setResultEpochS(null);
    setResultEpochMs(null);

    const yVal = parseInt(year.trim());
    const mVal = parseInt(month.trim()) - 1;
    const dVal = parseInt(day.trim());
    const hVal = parseInt(hour.trim());
    const minVal = parseInt(minute.trim());
    const sVal = parseInt(second.trim());

    if (
      isNaN(yVal) || isNaN(mVal) || isNaN(dVal) ||
      isNaN(hVal) || isNaN(minVal) || isNaN(sVal) ||
      yVal < 1970 || mVal < 0 || mVal > 11 || dVal < 1 || dVal > 31 ||
      hVal < 0 || hVal > 23 || minVal < 0 || minVal > 59 || sVal < 0 || sVal > 59
    ) {
      setDateError('Invalid date values. Please check all slot values.');
      return;
    }

    const d = new Date(yVal, mVal, dVal, hVal, minVal, sVal);
    if (isNaN(d.getTime())) {
      setDateError('Invalid date conversion.');
    } else {
      const ms = d.getTime();
      setResultEpochS(Math.floor(ms / 1000));
      setResultEpochMs(ms);
    }
  };

  const fillCurrentTime = () => {
    const d = new Date();
    setYear(d.getFullYear().toString());
    setMonth((d.getMonth() + 1).toString().padStart(2, '0'));
    setDay(d.getDate().toString().padStart(2, '0'));
    setHour(d.getHours().toString().padStart(2, '0'));
    setMinute(d.getMinutes().toString().padStart(2, '0'));
    setSecond(d.getSeconds().toString().padStart(2, '0'));
  };

  // Perform initial formatting on component mount
  useEffect(() => {
    handleConvertToDate();
    handleConvertToEpoch();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isEpochEmpty = !epochInput.trim();
  const isDateEmpty = !year.trim() || !month.trim() || !day.trim() || !hour.trim() || !minute.trim() || !second.trim();

  // Clear outputs instantly if any slot is cleared
  useEffect(() => {
    if (isDateEmpty) {
      setResultEpochS(null);
      setResultEpochMs(null);
      setDateError(null);
    }
  }, [year, month, day, hour, minute, second]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Date & Epoch Converter</h2>
      <p style={styles.subtitle}>
        Convert timestamp epoch values (seconds/milliseconds) to human-readable date formats and vice versa.
      </p>

      {/* Live Time Display Section */}
      <div style={styles.liveBar}>
        <div style={styles.liveInfo}>
          <span style={styles.liveDot}></span>
          <span>
            <strong>Current Epoch:</strong> {Math.floor(now.getTime() / 1000)} (s) &bull; {now.getTime()} (ms)
          </span>
        </div>
        <div style={styles.liveControls}>
          <button onClick={() => setIsLive(!isLive)} style={styles.liveButton}>
            {isLive ? (
              <>
                <Pause size={12} style={{ marginRight: 4 }} /> Pause Live
              </>
            ) : (
              <>
                <Play size={12} style={{ marginRight: 4 }} /> Resume Live
              </>
            )}
          </button>
        </div>
      </div>

      <div style={styles.splitRow}>
        {/* Epoch to Date Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Convert Epoch to Date</label>
          <div style={styles.formCard}>
            <div style={styles.inputRow}>
              <input
                type="text"
                value={epochInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setEpochInput(val);
                  if (!val.trim()) {
                    setDecodedLocal('');
                    setDecodedUtc('');
                    setDecodedIso('');
                    setEpochError(null);
                  }
                }}
                style={styles.input}
                placeholder="Enter epoch timestamp..."
              />
              <select
                value={epochUnit}
                onChange={(e) => setEpochUnit(e.target.value as 's' | 'ms')}
                style={styles.select}
              >
                <option value="s">Seconds</option>
                <option value="ms">Milliseconds</option>
              </select>
            </div>

            <button
              onClick={handleConvertToDate}
              disabled={isEpochEmpty}
              onMouseEnter={() => !isEpochEmpty && setIsHoveredEpoch(true)}
              onMouseLeave={() => setIsHoveredEpoch(false)}
              style={{
                ...styles.primaryButton,
                backgroundColor: isEpochEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isHoveredEpoch ? 'var(--accent-blue-hover)' : 'var(--accent-blue)'),
                opacity: isEpochEmpty ? 0.6 : 1,
                cursor: isEpochEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Convert to Date
            </button>

            {epochError && (
              <div style={styles.errorCard}>
                <Info size={14} style={{ marginRight: 6 }} />
                {epochError}
              </div>
            )}

            <div style={styles.resultsList}>
              <div style={styles.resultItem}>
                <div style={styles.resultMeta}>Local Date String</div>
                <div style={styles.resultValueContainer}>
                  <span style={styles.resultVal}>{decodedLocal || '-'}</span>
                  {decodedLocal && decodedLocal !== 'Invalid epoch timestamp' && (
                    <button
                      onClick={() => handleCopy(decodedLocal, 'local')}
                      style={styles.copyBtn}
                    >
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedText === 'local' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.resultItem}>
                <div style={styles.resultMeta}>UTC Date String</div>
                <div style={styles.resultValueContainer}>
                  <span style={styles.resultVal}>{decodedUtc || '-'}</span>
                  {decodedUtc && (
                    <button
                      onClick={() => handleCopy(decodedUtc, 'utc')}
                      style={styles.copyBtn}
                    >
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedText === 'utc' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.resultItem}>
                <div style={styles.resultMeta}>ISO 8601 Date</div>
                <div style={styles.resultValueContainer}>
                  <span style={styles.resultVal}>{decodedIso || '-'}</span>
                  {decodedIso && (
                    <button
                      onClick={() => handleCopy(decodedIso, 'iso')}
                      style={styles.copyBtn}
                    >
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedText === 'iso' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date to Epoch Panel */}
        <div style={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={styles.panelLabel}>Convert Date to Epoch</label>
            <button onClick={fillCurrentTime} style={styles.nowBtn}>
              Set to Now
            </button>
          </div>
          <div style={styles.formCard}>
            <div style={styles.slotRow}>
              <input
                type="text"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                style={{ ...styles.slotInput, ...styles.yearInput }}
                placeholder="YYYY"
              />
              <span style={styles.slotDelimiter}>-</span>
              <input
                type="text"
                maxLength={2}
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
                style={styles.slotInput}
                placeholder="MM"
              />
              <span style={styles.slotDelimiter}>-</span>
              <input
                type="text"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))}
                style={styles.slotInput}
                placeholder="DD"
              />
              <span style={{ ...styles.slotDelimiter, margin: '0 4px' }}> </span>
              <input
                type="text"
                maxLength={2}
                value={hour}
                onChange={(e) => setHour(e.target.value.replace(/\D/g, ''))}
                style={styles.slotInput}
                placeholder="HH"
              />
              <span style={styles.slotDelimiter}>:</span>
              <input
                type="text"
                maxLength={2}
                value={minute}
                onChange={(e) => setMinute(e.target.value.replace(/\D/g, ''))}
                style={styles.slotInput}
                placeholder="mm"
              />
              <span style={styles.slotDelimiter}>:</span>
              <input
                type="text"
                maxLength={2}
                value={second}
                onChange={(e) => setSecond(e.target.value.replace(/\D/g, ''))}
                style={styles.slotInput}
                placeholder="ss"
              />
            </div>

            <button
              onClick={handleConvertToEpoch}
              disabled={isDateEmpty}
              onMouseEnter={() => !isDateEmpty && setIsHoveredDate(true)}
              onMouseLeave={() => setIsHoveredDate(false)}
              style={{
                ...styles.secondaryButton,
                backgroundColor: isDateEmpty
                  ? 'var(--bg-sidebar)'
                  : (isHoveredDate ? 'var(--border-color)' : 'var(--bg-window)'),
                opacity: isDateEmpty ? 0.6 : 1,
                cursor: isDateEmpty ? 'not-allowed' : 'pointer',
                borderColor: 'var(--border-color)'
              }}
            >
              Convert to Epoch
            </button>

            {dateError && (
              <div style={styles.errorCard}>
                <Info size={14} style={{ marginRight: 6 }} />
                {dateError}
              </div>
            )}

            <div style={styles.resultsList}>
              <div style={styles.resultItem}>
                <div style={styles.resultMeta}>Epoch (Seconds)</div>
                <div style={styles.resultValueContainer}>
                  <span style={styles.resultVal}>
                    {resultEpochS !== null ? resultEpochS.toString() : '-'}
                  </span>
                  {resultEpochS !== null && (
                    <button
                      onClick={() => handleCopy(resultEpochS.toString(), 'epochS')}
                      style={styles.copyBtn}
                    >
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedText === 'epochS' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.resultItem}>
                <div style={styles.resultMeta}>Epoch (Milliseconds)</div>
                <div style={styles.resultValueContainer}>
                  <span style={styles.resultVal}>
                    {resultEpochMs !== null ? resultEpochMs.toString() : '-'}
                  </span>
                  {resultEpochMs !== null && (
                    <button
                      onClick={() => handleCopy(resultEpochMs.toString(), 'epochMs')}
                      style={styles.copyBtn}
                    >
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedText === 'epochMs' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
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
  liveBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '13px'
  },
  liveInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent-green)',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px var(--accent-green)'
  },
  liveControls: {
    display: 'flex'
  },
  liveButton: {
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
  splitRow: {
    display: 'flex',
    gap: '16px',
    flex: 1
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
  formCard: {
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1
  },
  inputRow: {
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  dateInput: {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  select: {
    padding: '6px 8px',
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
    justifyContent: 'center',
    padding: '8px 16px',
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
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    outline: 'none',
    width: '100%'
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultMeta: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  resultValueContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px'
  },
  resultVal: {
    fontSize: '12px',
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
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '8px'
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
  nowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  slotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-window)',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    justifyContent: 'center'
  },
  slotInput: {
    width: '40px',
    border: 'none',
    background: 'none',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--text-primary)',
    outline: 'none',
    padding: '2px 0'
  },
  yearInput: {
    width: '55px'
  },
  slotDelimiter: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    userSelect: 'none'
  }
};
