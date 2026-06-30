import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { computeLineDiff } from '../../utils/diff';
import type { DiffChange } from '../../utils/diff';

export const TextDiffChecker: React.FC = () => {
  const [original, setOriginal] = useState('const user = {\n  name: "NovaSuite",\n  active: false,\n  roles: ["admin"]\n};');
  const [modified, setModified] = useState('const user = {\n  name: "NovaSuite App",\n  active: true,\n  roles: ["admin", "developer"],\n  version: "1.0.0"\n};');
  const [diffResult, setDiffResult] = useState<DiffChange[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const handleCompare = () => {
    if (!original.trim() || !modified.trim()) {
      setDiffResult([]);
      return;
    }
    const result = computeLineDiff(original, modified);
    setDiffResult(result);
  };

  // Perform initial comparison on component mount
  useEffect(() => {
    handleCompare();
  }, []);

  interface AlignedLine {
    type: 'added' | 'removed' | 'unchanged' | 'empty';
    value: string;
    lineNumber?: number;
  }

  interface AlignedRow {
    left: AlignedLine;
    right: AlignedLine;
  }

  const alignDiffs = (changes: DiffChange[]): AlignedRow[] => {
    const rows: AlignedRow[] = [];
    let idx = 0;
    while (idx < changes.length) {
      if (changes[idx].type === 'unchanged') {
        rows.push({
          left: {
            type: 'unchanged',
            value: changes[idx].value,
            lineNumber: changes[idx].oldLineNumber
          },
          right: {
            type: 'unchanged',
            value: changes[idx].value,
            lineNumber: changes[idx].newLineNumber
          }
        });
        idx++;
      } else {
        // Gather consecutive changes
        const removed: DiffChange[] = [];
        const added: DiffChange[] = [];
        while (idx < changes.length && changes[idx].type !== 'unchanged') {
          if (changes[idx].type === 'removed') {
            removed.push(changes[idx]);
          } else if (changes[idx].type === 'added') {
            added.push(changes[idx]);
          }
          idx++;
        }

        const maxLen = Math.max(removed.length, added.length);
        for (let k = 0; k < maxLen; k++) {
          rows.push({
            left: k < removed.length ? {
              type: 'removed',
              value: removed[k].value,
              lineNumber: removed[k].oldLineNumber
            } : {
              type: 'empty',
              value: ''
            },
            right: k < added.length ? {
              type: 'added',
              value: added[k].value,
              lineNumber: added[k].newLineNumber
            } : {
              type: 'empty',
              value: ''
            }
          });
        }
      }
    }
    return rows;
  };

  const alignedRows = alignDiffs(diffResult);
  const isInputEmpty = !original.trim() || !modified.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Text Diff Checker</h2>
      <p style={styles.subtitle}>
        Compare two text structures side-by-side. Highlights line insertions, deletions, and modifications using shared LCS algorithm.
      </p>

      {/* Editor Panels */}
      <div style={styles.editorRow}>
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Original Text</label>
          <textarea
            value={original}
            onChange={(e) => {
              const val = e.target.value;
              setOriginal(val);
              if (!val.trim() || !modified.trim()) {
                setDiffResult([]);
              }
            }}
            style={styles.textarea}
            placeholder="Paste original text here..."
          />
        </div>

        <div style={styles.panel}>
          <label style={styles.panelLabel}>Modified Text</label>
          <textarea
            value={modified}
            onChange={(e) => {
              const val = e.target.value;
              setModified(val);
              if (!val.trim() || !original.trim()) {
                setDiffResult([]);
              }
            }}
            style={styles.textarea}
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      {/* Action Button Row */}
      <div style={styles.btnRow}>
        <button
          onClick={handleCompare}
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
          Compare Texts
        </button>
      </div>

      {/* Diff Viewport Title */}
      <div style={styles.viewportHeader}>
        <ArrowLeftRight size={14} style={{ marginRight: 6 }} />
        <span style={styles.panelLabel}>Side-by-Side Comparison (Synchronized Scroll)</span>
      </div>

      {/* Side by Side Diff Viewer / Placeholder */}
      {diffResult.length > 0 ? (
        <div style={styles.diffWrapper}>
          <div style={styles.diffPaneCombined}>
            {alignedRows.map((row, idx) => {
              const isLeftEmpty = row.left.type === 'empty';
              const isLeftRemoved = row.left.type === 'removed';
              
              const isRightEmpty = row.right.type === 'empty';
              const isRightAdded = row.right.type === 'added';

              return (
                <div key={idx} style={styles.diffRow}>
                  {/* Left Cell (Original) */}
                  <div
                    style={{
                      ...styles.diffCell,
                      ...(isLeftRemoved ? styles.removedLine : {}),
                      ...(isLeftEmpty ? styles.emptyLine : {})
                    }}
                  >
                    {!isLeftEmpty ? (
                      <>
                        <span style={styles.lineNumber}>{row.left.lineNumber || ''}</span>
                        <span style={styles.indicator}>{isLeftRemoved ? '-' : ' '}</span>
                        <pre style={styles.preText}>{row.left.value}</pre>
                      </>
                    ) : (
                      <div style={{ minHeight: '1.5em' }} />
                    )}
                  </div>

                  {/* Vertical Divider */}
                  <div style={styles.verticalDivider} />

                  {/* Right Cell (Modified) */}
                  <div
                    style={{
                      ...styles.diffCell,
                      ...(isRightAdded ? styles.addedLine : {}),
                      ...(isRightEmpty ? styles.emptyLine : {})
                    }}
                  >
                    {!isRightEmpty ? (
                      <>
                        <span style={styles.lineNumber}>{row.right.lineNumber || ''}</span>
                        <span style={styles.indicator}>{isRightAdded ? '+' : ' '}</span>
                        <pre style={styles.preText}>{row.right.value}</pre>
                      </>
                    ) : (
                      <div style={{ minHeight: '1.5em' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.placeholderContainer}>
          <p style={styles.placeholderText}>Compare text structures to view details.</p>
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
  editorRow: {
    display: 'flex',
    gap: '16px',
    height: '160px',
    minHeight: '140px'
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  panelLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  textarea: {
    flex: 1,
    padding: '10px 12px',
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
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
    outline: 'none'
  },
  viewportHeader: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px'
  },
  diffWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    minHeight: '260px'
  },
  diffPaneCombined: {
    flex: 1,
    backgroundColor: 'var(--bg-main)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  diffRow: {
    display: 'flex',
    width: '100%',
    minHeight: '20px',
    alignItems: 'stretch'
  },
  diffCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflow: 'hidden'
  },
  verticalDivider: {
    width: '1px',
    backgroundColor: 'var(--border-color)',
    alignSelf: 'stretch'
  },
  lineNumber: {
    width: '28px',
    color: 'var(--text-muted)',
    textAlign: 'right',
    marginRight: '8px',
    fontSize: '10px',
    userSelect: 'none'
  },
  indicator: {
    width: '12px',
    marginRight: '6px',
    userSelect: 'none',
    fontWeight: 700
  },
  preText: {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    flex: 1
  },
  removedLine: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    color: 'var(--accent-red)'
  },
  addedLine: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    color: 'var(--accent-green)'
  },
  emptyLine: {
    backgroundColor: 'var(--bg-sidebar)',
    opacity: 0.4
  },
  placeholderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '24px',
    minHeight: '260px'
  },
  placeholderText: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  }
};
