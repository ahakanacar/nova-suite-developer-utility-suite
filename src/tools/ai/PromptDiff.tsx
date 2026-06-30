import React, { useState } from 'react';
import { computeLineDiff, computeWordDiff } from '../../utils/diff';
import type { DiffChange, WordDiffToken } from '../../utils/diff';

export const PromptDiff: React.FC = () => {
  const [oldPrompt, setOldPrompt] = useState('// System Prompt v1\nYou are an assistant.\nFocus on speed and simplicity.\nAlways respond in Turkish.');
  const [newPrompt, setNewPrompt] = useState('// System Prompt v2\nYou are a helpful assistant.\nFocus on speed, security and clean code.\nAlways respond in English.');
  const [diffResult, setDiffResult] = useState<DiffChange[] | null>(null);

  const handleCompare = () => {
    const results = computeLineDiff(oldPrompt, newPrompt);
    setDiffResult(results);
  };

  // Align lines for side-by-side split visualization
  const leftLines: (DiffChange | null)[] = [];
  const rightLines: (DiffChange | null)[] = [];

  if (diffResult) {
    let i = 0;
    while (i < diffResult.length) {
      if (diffResult[i].type === 'unchanged') {
        leftLines.push(diffResult[i]);
        rightLines.push(diffResult[i]);
        i++;
      } else {
        // Collect a contiguous block of changes (removed and added)
        const removedBlock: DiffChange[] = [];
        const addedBlock: DiffChange[] = [];
        
        while (i < diffResult.length && diffResult[i].type !== 'unchanged') {
          if (diffResult[i].type === 'removed') {
            removedBlock.push(diffResult[i]);
          } else {
            addedBlock.push(diffResult[i]);
          }
          i++;
        }
        
        const maxLen = Math.max(removedBlock.length, addedBlock.length);
        for (let k = 0; k < maxLen; k++) {
          leftLines.push(removedBlock[k] || null);
          rightLines.push(addedBlock[k] || null);
        }
      }
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Prompt Diff & Version Checker</h2>
      <p style={styles.subtitle}>
        Compare edits between two prompt versions side-by-side.
      </p>

      {/* Editor Inputs Panel */}
      <div style={styles.editorsRow}>
        <div style={styles.editorCol}>
          <label style={styles.editorLabel}>Original Version (v1)</label>
          <textarea
            value={oldPrompt}
            onChange={(e) => setOldPrompt(e.target.value)}
            placeholder="Enter original prompt text..."
            style={styles.textarea}
          />
        </div>
        <div style={styles.editorCol}>
          <label style={styles.editorLabel}>Modified Version (v2)</label>
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Enter modified prompt text..."
            style={styles.textarea}
          />
        </div>
      </div>

      {/* Action Button */}
      <div style={styles.actionsRow}>
        <button onClick={handleCompare} style={styles.compareButton}>
          Compare Versions
        </button>
      </div>

      {/* Xcode-style Split Diff Viewer */}
      {diffResult && (
        <div style={styles.diffWrapper}>
          <div style={styles.diffHeader}>
            <div style={styles.diffHeaderCol}>Original File</div>
            <div style={styles.diffHeaderCol}>Modified File</div>
          </div>
          
          <div style={styles.diffBody}>
            <div style={styles.diffRowsContainer}>
              {leftLines.map((leftLine, idx) => {
                const rightLine = rightLines[idx];
                const isPairedMod = !!(leftLine && rightLine && leftLine.type === 'removed' && rightLine.type === 'added');
                
                let wordDiffTokens: WordDiffToken[] = [];
                if (isPairedMod && leftLine && rightLine) {
                  wordDiffTokens = computeWordDiff(leftLine.value, rightLine.value);
                }
                
                return (
                  <div key={`diff-row-${idx}`} style={styles.diffRow}>
                    {/* Left Cell (Original) */}
                    <div style={{
                      ...styles.diffRowCell,
                      backgroundColor: leftLine 
                        ? (leftLine.type === 'removed' ? 'rgba(255, 59, 48, 0.08)' : 'transparent')
                        : 'var(--bg-sidebar)'
                    }}>
                      {leftLine ? (
                        <>
                          <span style={styles.lineNumber}>{leftLine.oldLineNumber}</span>
                          <span style={{
                            ...styles.lineText,
                            color: leftLine.type === 'removed' ? 'var(--accent-red)' : 'var(--text-primary)'
                          }}>
                            {leftLine.type === 'removed' ? '- ' : '  '}
                            {isPairedMod ? (
                              wordDiffTokens
                                .filter(t => t.type !== 'added')
                                .map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    style={t.type === 'removed' ? styles.wordHighlightRemoved : undefined}
                                  >
                                    {t.value}
                                  </span>
                                ))
                            ) : (
                              leftLine.value
                            )}
                          </span>
                        </>
                      ) : (
                        <div style={styles.emptyPlaceholderLine} />
                      )}
                    </div>

                    {/* Vertical Divider */}
                    <div style={styles.verticalDivider} />

                    {/* Right Cell (Modified) */}
                    <div style={{
                      ...styles.diffRowCell,
                      backgroundColor: rightLine 
                        ? (rightLine.type === 'added' ? 'rgba(52, 199, 89, 0.08)' : 'transparent')
                        : 'var(--bg-sidebar)'
                    }}>
                      {rightLine ? (
                        <>
                          <span style={styles.lineNumber}>{rightLine.newLineNumber}</span>
                          <span style={{
                            ...styles.lineText,
                            color: rightLine.type === 'added' ? 'var(--accent-green)' : 'var(--text-primary)'
                          }}>
                            {rightLine.type === 'added' ? '+ ' : '  '}
                            {isPairedMod ? (
                              wordDiffTokens
                                .filter(t => t.type !== 'removed')
                                .map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    style={t.type === 'added' ? styles.wordHighlightAdded : undefined}
                                  >
                                    {t.value}
                                  </span>
                                ))
                            ) : (
                              rightLine.value
                            )}
                          </span>
                        </>
                      ) : (
                        <div style={styles.emptyPlaceholderLine} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
  editorsRow: {
    display: 'flex',
    gap: '16px',
    height: '180px'
  },
  editorCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  editorLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  textarea: {
    flex: 1,
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none'
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  compareButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.15s ease'
  },
  diffWrapper: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '220px'
  },
  diffHeader: {
    height: '32px',
    backgroundColor: 'var(--bg-sidebar)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    userSelect: 'none'
  },
  diffHeaderCol: {
    flex: 1,
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '16px'
  },
  diffBody: {
    flex: 1,
    overflowY: 'auto',
    position: 'relative'
  },
  diffRowsContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: '600px'
  },
  diffRow: {
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.03)'
  },
  diffRowCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    fontFamily: 'monospace',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxSizing: 'border-box'
  },
  verticalDivider: {
    width: '1px',
    backgroundColor: 'var(--border-color)',
    alignSelf: 'stretch',
    flexShrink: 0
  },
  lineNumber: {
    width: '40px',
    textAlign: 'right',
    paddingRight: '10px',
    color: 'var(--text-muted)',
    fontSize: '10px',
    borderRight: '1px solid var(--border-color)',
    marginRight: '10px',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    backgroundColor: 'rgba(0,0,0,0.01)'
  },
  lineText: {
    flex: 1,
    padding: '2px 0',
    paddingRight: '10px',
    lineHeight: '1.5'
  },
  emptyPlaceholderLine: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'var(--bg-sidebar)',
    opacity: 0.2,
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)'
  },
  wordHighlightRemoved: {
    backgroundColor: 'rgba(255, 59, 48, 0.28)',
    borderRadius: '2px',
    fontWeight: 600,
    padding: '1px 2px'
  },
  wordHighlightAdded: {
    backgroundColor: 'rgba(52, 199, 89, 0.28)',
    borderRadius: '2px',
    fontWeight: 600,
    padding: '1px 2px'
  }
};
