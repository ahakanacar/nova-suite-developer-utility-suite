import React, { useState } from 'react';

export const CssUnitConverter: React.FC = () => {
  const [basePx, setBasePx] = useState<number>(16);
  const [viewportWidth, setViewportWidth] = useState<number>(1920);
  const [viewportHeight, setViewportHeight] = useState<number>(1080);
  
  // Single active input value and its unit type
  const [inputValue, setInputValue] = useState<string>('16');
  const [inputUnit, setInputUnit] = useState<'px' | 'rem' | 'em' | 'percent' | 'vw' | 'vh'>('px');

  // Outputs state
  const [pxVal, setPxVal] = useState<number | null>(16);
  const [remVal, setRemVal] = useState<number | null>(1);
  const [emVal, setEmVal] = useState<number | null>(1);
  const [percentVal, setPercentVal] = useState<number | null>(100);
  const [vwVal, setVwVal] = useState<number | null>(0.8333);
  const [vhVal, setVhVal] = useState<number | null>(1.4815);

  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleConvert = () => {
    const valNum = parseFloat(inputValue);
    if (isNaN(valNum)) return;

    let absolutePx = 0;

    // Convert everything to absolute PX first
    switch (inputUnit) {
      case 'px':
        absolutePx = valNum;
        break;
      case 'rem':
      case 'em':
        absolutePx = valNum * basePx;
        break;
      case 'percent':
        absolutePx = (valNum / 100) * basePx;
        break;
      case 'vw':
        absolutePx = (valNum / 100) * viewportWidth;
        break;
      case 'vh':
        absolutePx = (valNum / 100) * viewportHeight;
        break;
    }

    // Set all state values relative to absolute PX
    setPxVal(Number(absolutePx.toFixed(2)));
    setRemVal(Number((absolutePx / basePx).toFixed(4)));
    setEmVal(Number((absolutePx / basePx).toFixed(4)));
    setPercentVal(Number(((absolutePx / basePx) * 100).toFixed(2)));
    setVwVal(Number(((absolutePx / viewportWidth) * 100).toFixed(4)));
    setVhVal(Number(((absolutePx / viewportHeight) * 100).toFixed(4)));
  };

  const isInputEmpty = !inputValue || inputValue.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CSS Unit Converter</h2>
      <p style={styles.subtitle}>
        Convert layout units between px, rem, em, %, vw, and vh based on your target base parameters.
      </p>

      {/* Global Configuration Bar */}
      <div style={styles.configBar}>
        <div style={styles.configField}>
          <label style={styles.configLabel}>Base Font Size (px)</label>
          <input
            type="number"
            value={basePx}
            onChange={(e) => setBasePx(Math.max(1, parseInt(e.target.value) || 16))}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.configField}>
          <label style={styles.configLabel}>Viewport Width (px)</label>
          <input
            type="number"
            value={viewportWidth}
            onChange={(e) => setViewportWidth(Math.max(1, parseInt(e.target.value) || 1920))}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.configField}>
          <label style={styles.configLabel}>Viewport Height (px)</label>
          <input
            type="number"
            value={viewportHeight}
            onChange={(e) => setViewportHeight(Math.max(1, parseInt(e.target.value) || 1080))}
            style={styles.numberInput}
          />
        </div>
      </div>

      {/* Input panel & dynamic results layout */}
      <div style={styles.splitRow}>
        {/* Converter Inputs */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Unit Input</label>
          <div style={styles.formCard}>
            <div style={styles.inputRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);
                  if (val.trim() === '') {
                    setPxVal(null);
                    setRemVal(null);
                    setEmVal(null);
                    setPercentVal(null);
                    setVwVal(null);
                    setVhVal(null);
                  }
                }}
                style={styles.input}
                placeholder="Enter value..."
              />
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as any)}
                style={styles.select}
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
                <option value="em">em</option>
                <option value="percent">%</option>
                <option value="vw">vw</option>
                <option value="vh">vh</option>
              </select>
            </div>
            
            {/* Action Button */}
            <div style={styles.btnRow}>
              <button
                onClick={handleConvert}
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
                Convert Units
              </button>
            </div>
          </div>
        </div>

        {/* Converter Outputs Matrix */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Conversion Matrix</label>
          <div style={styles.matrixContainer}>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Pixels (px)</span>
              <span style={styles.matrixValue}>{pxVal !== null ? `${pxVal} px` : '-'}</span>
            </div>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Root Em (rem)</span>
              <span style={styles.matrixValue}>{remVal !== null ? `${remVal} rem` : '-'}</span>
            </div>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Parent Em (em)</span>
              <span style={styles.matrixValue}>{emVal !== null ? `${emVal} em` : '-'}</span>
            </div>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Percent (%)</span>
              <span style={styles.matrixValue}>{percentVal !== null ? `${percentVal} %` : '-'}</span>
            </div>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Viewport Width (vw)</span>
              <span style={styles.matrixValue}>{vwVal !== null ? `${vwVal} vw` : '-'}</span>
            </div>
            <div style={styles.matrixRow}>
              <span style={styles.matrixLabel}>Viewport Height (vh)</span>
              <span style={styles.matrixValue}>{vhVal !== null ? `${vhVal} vh` : '-'}</span>
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
  configBar: {
    display: 'flex',
    gap: '16px',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  configField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  configLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  numberInput: {
    padding: '4px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '130px'
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
    justifyContent: 'center',
    gap: '16px',
    flex: 1
  },
  inputRow: {
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100px'
  },
  matrixContainer: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  },
  matrixRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px dashed var(--border-color)'
  },
  matrixLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  matrixValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start'
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

