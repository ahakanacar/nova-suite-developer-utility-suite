import React, { useState } from 'react';
import { Copy, ArrowLeft } from 'lucide-react';

interface ColorStats {
  hex: string;
  rgb: string;
  hsl: string;
}

export const ColorPickerTool: React.FC = () => {
  const [color, setColor] = useState('#007aff'); // Default Apple Blue
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const [stats, setStats] = useState<ColorStats>({
    hex: '#007aff',
    rgb: 'rgb(0, 122, 255)',
    hsl: 'hsl(211, 100%, 50%)'
  });

  const [palette, setPalette] = useState<string[]>([
    '#99caff',
    '#4da3ff',
    '#007aff',
    '#004fa3',
    '#00244d',
    '#ff8500'
  ]);

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
      throw new Error("Invalid hex length");
    }
    
    return { r, g, b };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
    
    const toHex = (x: number) => x.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleGenerate = () => {
    setError(null);
    const cleanColor = color.trim();
    if (!cleanColor) {
      setStats({ hex: '-', rgb: '-', hsl: '-' });
      setPalette([]);
      return;
    }

    try {
      let hex = cleanColor;
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }

      const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
      if (!hexRegex.test(hex)) {
        throw new Error("Invalid Hex color");
      }

      const { r, g, b } = hexToRgb(hex);
      const { h, s, l } = rgbToHsl(r, g, b);

      setStats({
        hex: hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${h}, ${s}%, ${l}%)`
      });

      // Generate palette variations (tints and shades in Hex)
      const variations = [
        hslToHex(h, s, Math.min(90, l + 30)),
        hslToHex(h, s, Math.min(80, l + 15)),
        hex,
        hslToHex(h, s, Math.max(10, l - 15)),
        hslToHex(h, s, Math.max(5, l - 30)),
        // Complementary color
        hslToHex((h + 180) % 360, s, l)
      ];
      setPalette(variations);
    } catch (err) {
      setError("Invalid format! Use a valid hex code (e.g. #007aff or 007aff).");
    }
  };

  const handleInputChange = (val: string) => {
    setColor(val);
    if (val.trim() === '') {
      setError(null);
      setStats({ hex: '-', rgb: '-', hsl: '-' });
      setPalette([]);
    }
  };

  const handleCopy = (text: string, type: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1000);
  };

  const isInputEmpty = !color || color.trim() === '';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Color Picker & Palette Builder</h2>
      <p style={styles.subtitle}>
        Convert color values between HEX, RGB, and HSL codes, and generate tint/shade palette variations.
      </p>

      <div style={styles.splitRow}>
        {/* Color Input Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Select Base Color</label>
          <div style={styles.formCard}>
            <div style={styles.pickerRow}>
              <input
                type="color"
                value={color.startsWith('#') && (color.trim().length === 7 || color.trim().length === 4) ? color : '#000000'}
                onChange={(e) => handleInputChange(e.target.value)}
                style={styles.colorCirclePicker}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleInputChange(e.target.value)}
                style={styles.inputField}
                placeholder="#007aff"
              />
            </div>

            <div style={styles.statsList}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>HEX</span>
                <div style={styles.statValBox}>
                  <span style={styles.statVal}>{stats.hex}</span>
                  {stats.hex !== '-' && (
                    <button onClick={() => handleCopy(stats.hex, 'hex')} style={styles.copyBtn}>
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedType === 'hex' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.statItem}>
                <span style={styles.statLabel}>RGB</span>
                <div style={styles.statValBox}>
                  <span style={styles.statVal}>{stats.rgb}</span>
                  {stats.rgb !== '-' && (
                    <button onClick={() => handleCopy(stats.rgb, 'rgb')} style={styles.copyBtn}>
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedType === 'rgb' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.statItem}>
                <span style={styles.statLabel}>HSL</span>
                <div style={styles.statValBox}>
                  <span style={styles.statVal}>{stats.hsl}</span>
                  {stats.hsl !== '-' && (
                    <button onClick={() => handleCopy(stats.hsl, 'hsl')} style={styles.copyBtn}>
                      <Copy size={12} style={{ marginRight: 4 }} />
                      {copiedType === 'hsl' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <div style={styles.errorText}>{error}</div>}

            {/* Action Button Row */}
            <div style={styles.btnRow}>
              <button
                onClick={handleGenerate}
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
                Generate Palette
              </button>
            </div>
          </div>
        </div>

        {/* Palette Generator Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Generated Color Palette</label>
          <div style={styles.paletteContainer}>
            {palette.length > 0 ? (
              palette.map((c, index) => {
                const isCopied = copiedType === `pal-${index}`;
                return (
                  <div
                    key={index}
                    onClick={() => handleCopy(c, `pal-${index}`)}
                    style={{
                      ...styles.paletteCard,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div
                      style={{
                        ...styles.palettePreview,
                        backgroundColor: c
                      }}
                    />
                    <div style={styles.paletteLabelBox}>
                      <span style={styles.paletteLabelText}>
                        {index === 2 ? 'Base Color' : index === 5 ? 'Complementary' : `Variation #${index + 1}`}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputChange(c);
                          }}
                          style={styles.setBaseBtn}
                          title="Set as base color"
                        >
                          <ArrowLeft size={11} style={{ marginRight: 2 }} />
                          Set Base
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(c, `pal-${index}`);
                          }}
                          style={{
                            ...styles.copyBtn,
                            color: isCopied ? '#22c55e' : 'var(--accent-blue)'
                          }}
                        >
                          <Copy size={11} style={{ marginRight: 3 }} />
                          {isCopied ? 'Copied! ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.emptyPalettePlaceholder}>
                Generate a palette to view variations.
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
    gap: '16px',
    flex: 1
  },
  pickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  colorCirclePicker: {
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    backgroundColor: 'transparent'
  },
  inputField: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  statValBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px'
  },
  statVal: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)'
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
  setBaseBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  paletteContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    flex: 1,
    overflowY: 'auto'
  },
  paletteCard: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column'
  },
  palettePreview: {
    height: '60px',
    width: '100%'
  },
  paletteLabelBox: {
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  paletteLabelText: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
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
  },
  errorText: {
    fontSize: '11px',
    color: 'red',
    marginTop: '-4px'
  },
  emptyPalettePlaceholder: {
    gridColumn: 'span 2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    height: '140px'
  }
};


