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
  architecture?: {
    tokenizer?: string;
  };
}

interface TokenCalculatorProps {
  modelPrices?: ModelPrice[];
}

export const TokenCalculator: React.FC<TokenCalculatorProps> = ({ modelPrices }) => {
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState(0);
  const [models, setModels] = useState<ModelPrice[]>(fallbackPrices);
  const [selectedModelId, setSelectedModelId] = useState('google/gemini-3.5-flash');
  const [calculatedModelId, setCalculatedModelId] = useState('google/gemini-3.5-flash');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);

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
          console.error('Failed to parse model prices in TokenCalculator', err);
        }
      }
    }
  }, [modelPrices]);

  const handleCalculate = () => {
    if (!text.trim()) return;
    try {
      // Standard GPT-4/Cl100k tokenizer as base (standard fallback for general counting)
      const encoding = getEncoding('cl100k_base');
      const tokenCount = encoding.encode(text).length;
      setTokens(tokenCount);
      setCalculatedModelId(selectedModelId);
    } catch (err) {
      console.error('Token calculation error:', err);
    }
  };

  const activeModelForStats = models.find((m) => m.id === calculatedModelId) || models[0];

  // Filtering logic for model dropdown
  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pricing rates based on active model used for calculation
  const promptPriceRate = parseFloat(activeModelForStats.pricing.prompt);
  const completionPriceRate = parseFloat(activeModelForStats.pricing.completion);

  const estimatedPromptCost = tokens * promptPriceRate;
  const estimatedCompletionCost = tokens * completionPriceRate;

  const isTextEmpty = !text.trim();

  const handleInputChange = (val: string) => {
    setText(val);
    if (val.trim() === '') {
      setTokens(0);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        {/* Input Area */}
        <div style={styles.editorPanel}>
          <label style={styles.label}>Input Text Prompt</label>
          <textarea
            value={text}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type or paste your prompt content here to calculate tokens and cost details..."
            style={styles.textarea}
          />
        </div>

        {/* Configuration Side Panel */}
        <div style={styles.configPanel}>
          <label style={styles.label}>Select Target Model</label>
          <input
            type="text"
            placeholder="Filter models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchBar}
          />
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            style={styles.select}
            size={5}
          >
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isTextEmpty}
            onMouseEnter={() => !isTextEmpty && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              ...styles.calculateButton,
              backgroundColor: isTextEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isHovered
                  ? '#732be6'
                  : '#863bff',
              cursor: isTextEmpty ? 'not-allowed' : 'pointer',
              opacity: isTextEmpty ? 0.6 : 1
            }}
          >
            Calculate Tokens & Cost
          </button>

          {/* Cost details card */}
          <div style={styles.statsCard}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Token Count</span>
              <span style={styles.statVal}>{tokens.toLocaleString()}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Context Limit</span>
              <span style={styles.statVal}>
                {activeModelForStats.context_length.toLocaleString()}
              </span>
            </div>
            
            <div style={styles.divider} />

            <div style={styles.statRow}>
              <span style={styles.statLabel}>Est. Prompt Cost</span>
              <span style={styles.statVal}>
                ${estimatedPromptCost.toFixed(6)}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Est. Output Cost</span>
              <span style={styles.statVal}>
                ${estimatedCompletionCost.toFixed(6)}
              </span>
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
    height: '100%',
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)'
  },
  row: {
    display: 'flex',
    gap: '20px',
    height: '100%'
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  configPanel: {
    width: '260px',
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
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-inner)',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '13px',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'none',
    transition: 'border-color 0.15s ease',
    overflowY: 'auto'
  },
  searchBar: {
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  select: {
    flex: 1,
    padding: '6px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    overflowY: 'auto'
  },
  calculateButton: {
    padding: '10px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease, opacity 0.15s ease, transform 0.1s ease',
    outline: 'none'
  },
  statsCard: {
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-inner)',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  statLabel: {
    color: 'var(--text-secondary)'
  },
  statVal: {
    fontWeight: 600
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '4px 0'
  }
};

