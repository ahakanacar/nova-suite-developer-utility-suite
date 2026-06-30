import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ChunkItem {
  index: number;
  text: string;
  overlapPrefix: string;
  bodyText: string;
  overlapSuffix: string;
}

export const ChunkSplitter: React.FC = () => {
  const [text, setText] = useState(
    "Large Language Models (LLMs) require retrieval augmentation (RAG) to reference external private documents. " +
    "When chunking these documents, we use a sliding window with a specific chunk size and overlap size. " +
    "This ensures that context is not lost at the boundaries of the chunks when the retriever matches embeddings."
  );
  const [chunkSize, setChunkSize] = useState(100);
  const [overlapSize, setOverlapSize] = useState(25);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleSplit = () => {
    if (chunkSize < 10) {
      setErrorMsg('Chunk size must be at least 10 characters.');
      setChunks([]);
      return;
    }
    if (overlapSize >= chunkSize) {
      setErrorMsg('Overlap size cannot exceed or equal chunk size.');
      setChunks([]);
      return;
    }
    setErrorMsg(null);

    if (!text.trim()) {
      setChunks([]);
      return;
    }

    const list: ChunkItem[] = [];
    let start = 0;
    let idx = 1;
    const stride = chunkSize - overlapSize;

    while (start < text.length) {
      const end = Math.min(text.length, start + chunkSize);
      const chunkStr = text.substring(start, end);

      // Determine overlapping boundaries
      let overlapPrefix = '';
      let bodyText = chunkStr;
      let overlapSuffix = '';

      // If not the first chunk, the beginning overlaps with the previous chunk
      if (start > 0 && overlapSize > 0) {
        overlapPrefix = chunkStr.substring(0, overlapSize);
        bodyText = chunkStr.substring(overlapSize);
      }

      // If not the last chunk, the ending overlaps with the next chunk
      if (end < text.length && overlapSize > 0) {
        const boundary = bodyText.length - overlapSize;
        overlapSuffix = bodyText.substring(boundary);
        bodyText = bodyText.substring(0, boundary);
      }

      list.push({
        index: idx++,
        text: chunkStr,
        overlapPrefix,
        bodyText,
        overlapSuffix
      });

      // Break to avoid infinite loops if stride is 0 or negative
      if (stride <= 0) break;
      
      start += stride;
    }

    setChunks(list);
  };

  // Perform initial split calculation on component mount
  useEffect(() => {
    handleSplit();
  }, []);

  const isTextEmpty = !text.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>RAG Chunk Splitter Visualizer</h2>
      <p style={styles.subtitle}>
        Simulate sliding window document partitioning and preview overlap boundaries.
      </p>

      {/* Configuration Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.controlField}>
          <label style={styles.controlLabel}>Chunk Size (Chars)</label>
          <input
            type="number"
            value={chunkSize || ''}
            onChange={(e) => setChunkSize(parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
        <div style={styles.controlField}>
          <label style={styles.controlLabel}>Overlap Size (Chars)</label>
          <input
            type="number"
            value={overlapSize || ''}
            onChange={(e) => setOverlapSize(parseInt(e.target.value) || 0)}
            style={styles.numberInput}
          />
        </div>
      </div>

      {errorMsg && (
        <div style={styles.errorCard}>
          <AlertTriangle size={16} color="var(--accent-red)" style={{ marginRight: 6 }} />
          {errorMsg}
        </div>
      )}

      <div style={styles.splitRow}>
        {/* Source Textarea */}
        <div style={styles.panel}>
          <label style={styles.label}>Source Document Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
            placeholder="Paste your source document contents here..."
          />

          <button
            onClick={handleSplit}
            disabled={isTextEmpty}
            onMouseEnter={() => !isTextEmpty && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              ...styles.splitButton,
              backgroundColor: isTextEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isHovered
                  ? 'var(--accent-blue-hover)'
                  : 'var(--accent-blue)',
              cursor: isTextEmpty ? 'not-allowed' : 'pointer',
              opacity: isTextEmpty ? 0.6 : 1
            }}
          >
            Split & Visualize
          </button>
        </div>

        {/* Chunks Viewport */}
        <div style={styles.panel}>
          <label style={styles.label}>Generated Text Chunks ({chunks.length})</label>
          <div style={styles.chunksViewport}>
            {chunks.length > 0 ? (
              chunks.map((item) => (
                <div key={item.index} style={styles.chunkCard}>
                  <div style={styles.chunkHeader}>Chunk #{item.index}</div>
                  <div style={styles.chunkBody}>
                    {item.overlapPrefix && (
                      <span style={styles.overlapHighlight} title="Overlaps with previous chunk">
                        {item.overlapPrefix}
                      </span>
                    )}
                    <span>{item.bodyText}</span>
                    {item.overlapSuffix && (
                      <span style={styles.overlapHighlight} title="Overlaps with next chunk">
                        {item.overlapSuffix}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyViewport}>
                Provide valid document text and configurations to view chunk separations.
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
    gap: '16px',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)'
  },
  controlField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  controlLabel: {
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
    width: '120px'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    color: 'var(--accent-red)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.15)'
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
  label: {
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
    fontFamily: 'inherit',
    fontSize: '12px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none',
    border: '1px solid var(--border-color)'
  },
  chunksViewport: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px'
  },
  chunkCard: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  chunkHeader: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  chunkBody: {
    fontSize: '12px',
    lineHeight: '1.4',
    color: 'var(--text-primary)',
    wordBreak: 'break-all'
  },
  overlapHighlight: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderBottom: '2px solid var(--accent-blue)',
    fontWeight: 500,
    color: 'var(--accent-blue)'
  },
  emptyViewport: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '24px'
  },
  splitButton: {
    padding: '10px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    marginTop: '10px',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    outline: 'none',
    textAlign: 'center'
  }
};
