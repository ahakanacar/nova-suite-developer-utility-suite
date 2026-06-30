import React, { useState } from 'react';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';

export const CronExpressionBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cronToHuman' | 'humanToCron'>('cronToHuman');
  const [input, setInput] = useState('0 */6 * * 1-5');
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const parseCronToHuman = (cron: string): string => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error('Invalid cron format');
    }
    const [min, hour, dom, month, dow] = parts;

    // Strict regex validation for valid cron characters
    const validCronFieldRegex = /^[0-9\*\/\-,]+$/;
    if (!parts.every(p => validCronFieldRegex.test(p))) {
      throw new Error('Invalid cron format');
    }

    // Boundary validations
    const validateFieldBoundaries = (val: string, max: number, minVal = 0) => {
      if (val === '*') return;
      const subparts = val.split(/[,\-\/]/);
      for (const sp of subparts) {
        if (sp === '*' || sp === '') continue;
        const num = Number(sp);
        if (isNaN(num) || num < minVal || num > max) {
          throw new Error('Out of bounds');
        }
      }
    };

    validateFieldBoundaries(min, 59);
    validateFieldBoundaries(hour, 23);
    validateFieldBoundaries(dom, 31, 1);
    validateFieldBoundaries(month, 12, 1);
    validateFieldBoundaries(dow, 7);

    const parseField = (
      val: string,
      name: string,
      every: string,
      namesMap?: Record<string, string>
    ): string => {
      if (val === '*') return every;
      if (val.startsWith('*/')) {
        const num = val.substring(2);
        if (isNaN(Number(num))) throw new Error('Invalid step value');
        return `every ${num} ${name}s`;
      }
      if (val.includes('-')) {
        const [start, end] = val.split('-');
        const startName = namesMap?.[start] || start;
        const endName = namesMap?.[end] || end;
        return `from ${startName} through ${endName}`;
      }
      const list = val.split(',').map(item => namesMap?.[item] || item);
      return `at ${list.join(', ')}`;
    };

    const monthNames: Record<string, string> = {
      '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June',
      '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December'
    };

    const dowNames: Record<string, string> = {
      '0': 'Sunday', '7': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
      '4': 'Thursday', '5': 'Friday', '6': 'Saturday'
    };


    let description = '';
    if (min === '*' && hour === '*') {
      description += 'Every minute';
    } else if (min !== '*' && hour === '*') {
      description += `At minute ${min} of every hour`;
    } else if (min === '*' && hour !== '*') {
      const hVal = hour.startsWith('*/') ? `every ${hour.substring(2)} hours` : `hour ${hour}`;
      description += `Every minute past ${hVal}`;
    } else {
      const mVal = min.includes(',') ? `minutes ${min}` : `minute ${min}`;
      const hVal = hour.startsWith('*/') ? `every ${hour.substring(2)} hours` : `hour ${hour}`;
      description += `At ${mVal} past ${hVal}`;
    }

    if (dom !== '*') {
      description += `, on day ${dom} of the month`;
    }
    if (month !== '*') {
      const mDesc = month.includes('-') ? parseField(month, '', '', monthNames) : `in ${parseField(month, '', '', monthNames).replace('at ', '')}`;
      description += `, ${mDesc}`;
    }
    if (dow !== '*') {
      const dDesc = dow.includes('-') ? parseField(dow, '', '', dowNames) : `on ${parseField(dow, '', '', dowNames).replace('at ', '')}`;
      description += `, ${dDesc}`;
    }

    return description.trim();
  };

  const parseHumanToCron = (text: string): string => {
    const t = text.trim().toLowerCase();
    if (!t) throw new Error('Empty expression');

    const dows: Record<string, string> = {
      sunday: '0', sun: '0',
      monday: '1', mon: '1',
      tuesday: '2', tue: '2',
      wednesday: '3', wed: '3',
      thursday: '4', thu: '4',
      friday: '5', fri: '5',
      saturday: '6', sat: '6'
    };

    const minutesMatch = t.match(/every\s+(\d+)\s+minutes?/);
    if (minutesMatch) {
      return `*/${minutesMatch[1]} * * * *`;
    }

    if (t === 'every hour') {
      return '0 * * * *';
    }

    if (t === 'every day at midnight' || t === 'at midnight') {
      return '0 0 * * *';
    }

    let minute = '0';
    let hour = '*';
    let dow = '*';

    const timeMatch = t.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm) {
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
      }
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        hour = h.toString();
        minute = m.toString();
      } else {
        throw new Error('Invalid time range');
      }
    }

    for (const [day, val] of Object.entries(dows)) {
      if (t.includes(day)) {
        dow = val;
        break;
      }
    }

    if (hour === '*' && dow === '*' && minute === '0') {
      if (t.includes('every day')) {
        return '0 * * * *';
      }
      throw new Error('Invalid phrase');
    }

    return `${minute} ${hour} * * ${dow}`;
  };

  const handleBuild = () => {
    if (!input.trim()) return;
    setErrorMsg('');
    try {
      const lines = input.split('\n');
      const results = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        try {
          if (activeTab === 'cronToHuman') {
            return parseCronToHuman(trimmed);
          } else {
            return parseHumanToCron(trimmed);
          }
        } catch (err) {
          return '[Invalid Format]';
        }
      });

      const nonEmptyLines = results.filter(r => r !== '');
      if (nonEmptyLines.length > 0 && nonEmptyLines.every(r => r === '[Invalid Format]')) {
        setErrorMsg('Invalid cron format or text expression!');
        setOutput('');
      } else {
        setOutput(results.join('\n'));
      }
    } catch (err) {
      setErrorMsg('Invalid cron format or text expression!');
      setOutput('');
    }
  };

  const handleTabChange = (tab: 'cronToHuman' | 'humanToCron') => {
    setActiveTab(tab);
    setInput(tab === 'cronToHuman' ? '0 */6 * * 1-5' : 'Every Monday at 9 AM');
    setOutput('');
    setErrorMsg('');
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim() === '') {
      setOutput('');
      setErrorMsg('');
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
      <h2 style={styles.title}>Cron Expression Builder</h2>
      <p style={styles.subtitle}>
        Convert cron strings into readable human explanations, or convert text expressions into valid cron patterns.
      </p>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => handleTabChange('cronToHuman')}
          style={{
            ...styles.tabButton,
            borderBottomColor: activeTab === 'cronToHuman' ? '#863bff' : 'transparent',
            color: activeTab === 'cronToHuman' ? '#863bff' : 'var(--text-secondary)'
          }}
        >
          Cron to Human Text
        </button>
        <button
          onClick={() => handleTabChange('humanToCron')}
          style={{
            ...styles.tabButton,
            borderBottomColor: activeTab === 'humanToCron' ? '#863bff' : 'transparent',
            color: activeTab === 'humanToCron' ? '#863bff' : 'var(--text-secondary)'
          }}
        >
          Human Text to Cron
        </button>
      </div>

      <div style={styles.splitRow}>
        {/* Left Input & Config */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>
            {activeTab === 'cronToHuman' ? 'Cron Expression' : 'Human Text Expression'}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder={
              activeTab === 'cronToHuman'
                ? 'e.g. 0 */6 * * 1-5'
                : 'e.g. Every Monday at 9 AM'
            }
          />
          
          <button
            onClick={handleBuild}
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
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Build Cron Expression
          </button>
        </div>

        {/* Right Output */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Result Output</label>
            {output && !errorMsg && (
              <button
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  color: copied ? '#22c55e' : 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            )}
          </div>
          
          {errorMsg ? (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          ) : output ? (
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
              Expression result will appear here...
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
  tabsRow: {
    display: 'flex',
    gap: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  tabButton: {
    padding: '8px 4px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s, color 0.2s'
  },
  splitRow: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '360px'
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
    outline: 'none',
    marginTop: '4px'
  },
  copyButton: {
    background: 'none',
    border: 'none',
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
  },
  errorBox: {
    flex: 1,
    border: '1px solid #f87171',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#f87171',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 500
  }
};
