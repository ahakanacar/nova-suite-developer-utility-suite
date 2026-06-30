import React, { useState, useEffect } from 'react';
import { getEncoding } from 'js-tiktoken';
import fallbackPrices from '../../data/model_prices.json';

interface ModelPrice {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface ContextVisualizerProps {
  modelPrices?: ModelPrice[];
}

export const ContextVisualizer: React.FC<ContextVisualizerProps> = ({ modelPrices }) => {
  const [models, setModels] = useState<ModelPrice[]>(modelPrices || fallbackPrices);
  const [selectedModelId, setSelectedModelId] = useState('google/gemini-3.5-flash');

  // Input states
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [ragContext, setRagContext] = useState('');
  const [maxOutputTokens, setMaxOutputTokens] = useState(2048);
  const [isHovered, setIsHovered] = useState(false);

  // Calculated token states
  const [tokenStats, setTokenStats] = useState({
    system: 0,
    user: 0,
    rag: 0
  });

  // Sync state if prop changes dynamically
  useEffect(() => {
    if (modelPrices) {
      setModels(modelPrices);
    }
  }, [modelPrices]);

  // Load fallback cache if props not provided
  useEffect(() => {
    if (!modelPrices) {
      const cachedData = localStorage.getItem('novasuite_model_prices');
      if (cachedData) {
        try {
          setModels(JSON.parse(cachedData));
        } catch (err) {
          console.error('Failed to parse model prices in ContextVisualizer', err);
        }
      }
    }
  }, [modelPrices]);

  const handleVisualize = () => {
    try {
      const encoding = getEncoding('cl100k_base');
      setTokenStats({
        system: encoding.encode(systemPrompt).length,
        user: encoding.encode(userPrompt).length,
        rag: encoding.encode(ragContext).length
      });
    } catch (err) {
      console.error('Context visualizer token counting error:', err);
    }
  };

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];
  const limit = selectedModel.context_length;

  const totalInputTokens = tokenStats.system + tokenStats.user + tokenStats.rag;
  const totalTokens = totalInputTokens + maxOutputTokens;
  
  // Logical Fix: Overflow occurs if total tokens exceed model limit, OR if inputs exceed user defined output token budget.
  const isOverflow = totalTokens > limit || totalInputTokens > maxOutputTokens;

  // Percentage calculations for stacked bar
  const getPercent = (val: number) => Math.min(100, (val / limit) * 100);
  
  const systemPercent = getPercent(tokenStats.system);
  const userPercent = getPercent(tokenStats.user);
  const ragPercent = getPercent(tokenStats.rag);
  const outputPercent = getPercent(maxOutputTokens);
  const remainingPercent = Math.max(0, 100 - (systemPercent + userPercent + ragPercent + outputPercent));

  const isAllEmpty = !systemPrompt.trim() && !userPrompt.trim() && !ragContext.trim();

  return (
    <div style={styles.container}>
      {/* Visual Header Stacked Progress Bar */}
      <div style={styles.header}>
        <div style={styles.headerTitleRow}>
          <h2 style={styles.title}>Context Budget Visualizer</h2>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            style={styles.select}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.context_length.toLocaleString()} limit)
              </option>
            ))}
          </select>
        </div>

        {/* macOS style Stacked Progress bar */}
        <div style={{
          ...styles.progressBarContainer,
          border: isOverflow ? '1px solid var(--accent-red)' : '1px solid var(--border-color)'
        }}>
          {isOverflow ? (
            <div style={{ ...styles.progressSegment, width: '100%', backgroundColor: 'var(--accent-red)' }} />
          ) : (
            <>
              <div style={{ ...styles.progressSegment, width: `${systemPercent}%`, backgroundColor: '#5856d6' }} title="System" />
              <div style={{ ...styles.progressSegment, width: `${userPercent}%`, backgroundColor: 'var(--accent-blue)' }} title="User" />
              <div style={{ ...styles.progressSegment, width: `${ragPercent}%`, backgroundColor: 'var(--accent-green)' }} title="RAG Context" />
              <div style={{ ...styles.progressSegment, width: `${outputPercent}%`, backgroundColor: 'var(--accent-yellow)' }} title="Max Output" />
              <div style={{ ...styles.progressSegment, width: `${remainingPercent}%`, backgroundColor: 'rgba(0,0,0,0.05)' }} title="Free space" />
            </>
          )}
        </div>

        {/* Legend / Status metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <span style={{ ...styles.badgeDot, backgroundColor: '#5856d6' }} />
            <span style={styles.metricLabel}>System ({tokenStats.system.toLocaleString()})</span>
          </div>
          <div style={styles.metricItem}>
            <span style={{ ...styles.badgeDot, backgroundColor: 'var(--accent-blue)' }} />
            <span style={styles.metricLabel}>User ({tokenStats.user.toLocaleString()})</span>
          </div>
          <div style={styles.metricItem}>
            <span style={{ ...styles.badgeDot, backgroundColor: 'var(--accent-green)' }} />
            <span style={styles.metricLabel}>RAG ({tokenStats.rag.toLocaleString()})</span>
          </div>
          <div style={styles.metricItem}>
            <span style={{ ...styles.badgeDot, backgroundColor: 'var(--accent-yellow)' }} />
            <span style={styles.metricLabel}>Max Output ({maxOutputTokens.toLocaleString()})</span>
          </div>
          <div style={styles.totalMetric}>
            Total: <span style={{
              fontWeight: 600,
              color: isOverflow ? 'var(--accent-red)' : 'var(--text-primary)'
            }}>{totalTokens.toLocaleString()}</span> / {limit.toLocaleString()}
          </div>
        </div>

        {/* Capacity error warning */}
        {isOverflow && (
          <div style={styles.alert}>
            {totalInputTokens > maxOutputTokens 
              ? `Warning: Input tokens (${totalInputTokens.toLocaleString()}) exceed your defined output budget (${maxOutputTokens.toLocaleString()})!`
              : `Warning: Context window capacity exceeded! Limit is ${limit.toLocaleString()} tokens.`}
          </div>
        )}
      </div>

      {/* Editor grids */}
      <div style={styles.editorsGrid}>
        <div style={styles.editorCol}>
          <label style={styles.editorLabel}>System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter instructions defining agent behaviors..."
            style={styles.textarea}
          />
        </div>
        <div style={styles.editorCol}>
          <label style={styles.editorLabel}>User Prompt</label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter user prompt or request queries..."
            style={styles.textarea}
          />
        </div>
      </div>

      <div style={styles.editorsGridSecond}>
        <div style={styles.editorCol}>
          <label style={styles.editorLabel}>RAG Context Documents</label>
          <textarea
            value={ragContext}
            onChange={(e) => setRagContext(e.target.value)}
            placeholder="Paste text snippets retrieved from database or local files..."
            style={styles.textarea}
          />
        </div>
        <div style={styles.controlCol}>
          <label style={styles.editorLabel}>Max Completion Tokens</label>
          <input
            type="number"
            value={maxOutputTokens}
            onChange={(e) => setMaxOutputTokens(Math.max(1, parseInt(e.target.value) || 0))}
            style={styles.inputNumber}
          />
          <p style={styles.helpText}>
            Set the maximum token budget reserved for generating model output completions.
          </p>

          {/* Visualize Budget Button */}
          <button
            onClick={handleVisualize}
            disabled={isAllEmpty}
            onMouseEnter={() => !isAllEmpty && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              ...styles.visualizeButton,
              backgroundColor: isAllEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isHovered
                  ? 'var(--accent-blue-hover)'
                  : 'var(--accent-blue)',
              cursor: isAllEmpty ? 'not-allowed' : 'pointer',
              opacity: isAllEmpty ? 0.6 : 1
            }}
          >
            Visualize Budget
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-inner)',
    backgroundColor: 'var(--bg-sidebar)'
  },
  headerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600
  },
  select: {
    padding: '4px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none'
  },
  progressBarContainer: {
    height: '16px',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex'
  },
  progressSegment: {
    height: '100%',
    transition: 'width 0.25s ease'
  },
  metricsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    fontSize: '12px'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  metricLabel: {
    color: 'var(--text-secondary)'
  },
  totalMetric: {
    marginLeft: 'auto',
    fontWeight: 500
  },
  alert: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    color: 'var(--accent-red)',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.2)'
  },
  editorsGrid: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '140px'
  },
  editorsGridSecond: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '140px'
  },
  editorCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  controlCol: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
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
    fontFamily: 'inherit',
    fontSize: '12px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none'
  },
  inputNumber: {
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  helpText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  visualizeButton: {
    padding: '10px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    marginTop: '12px',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    outline: 'none',
    textAlign: 'center'
  }
};

