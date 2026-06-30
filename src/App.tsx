import React, { useEffect, useState } from 'react';
import { MacWindow } from './components/MacWindow';
import { ErrorProvider, useError } from './context/ErrorContext';
import fallbackPrices from './data/model_prices.json';
import { getToolById } from './registry/toolRegistry';
import { getStorageItem, setStorageItem } from './utils/storage';

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

const NovaSuiteApp: React.FC = () => {
  const { setError } = useError();
  const [activeToolId, setActiveToolId] = useState<string>('token-calculator');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [prices, setPrices] = useState<ModelPrice[]>(fallbackPrices);

  // Monitor network status dynamically
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle prices data hydration on mount and trigger auto-sync if online
  useEffect(() => {
    const hydrateData = async () => {
      const cachedData = await getStorageItem('novasuite_model_prices');
      const cachedTimestamp = await getStorageItem('novasuite_last_updated');
      
      if (cachedData && cachedTimestamp) {
        try {
          setPrices(JSON.parse(cachedData));
          setLastUpdated(cachedTimestamp);
        } catch (err) {
          console.error('Failed to parse cached prices', err);
        }
      }

      // Auto-trigger sync on launch if user is online
      if (navigator.onLine) {
        handleSync();
      }
    };

    hydrateData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate minor visual delay for premium feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (navigator.onLine) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          // Normalize OpenRouter schema
          const normalized: ModelPrice[] = result.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            context_length: m.context_length,
            pricing: {
              prompt: m.pricing?.prompt || '0',
              completion: m.pricing?.completion || '0'
            },
            architecture: {
              tokenizer: m.architecture?.tokenizer || 'Other'
            }
          }));

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          setPrices(normalized);
          setLastUpdated(timestamp);
          await setStorageItem('novasuite_model_prices', JSON.stringify(normalized));
          await setStorageItem('novasuite_last_updated', timestamp);
          setIsOffline(false);
        }
      } catch (err: any) {
        setError({
          code: 'SYNC_FAILED',
          message: 'Unable to sync latest pricing data from OpenRouter.',
          technicalDetails: err?.message || String(err),
          timestamp: Date.now()
        });
      } finally {
        setIsSyncing(false);
      }
    } else {
      setIsSyncing(false);
      setIsOffline(true);
      setError({
        code: 'NETWORK_OFFLINE',
        message: 'No internet connection detected. Sync operation cancelled.',
        timestamp: Date.now()
      });
    }
  };


  const activeTool = getToolById(activeToolId);
  const ToolComponent = activeTool ? activeTool.component as React.ComponentType<any> : null;

  return (
    <MacWindow
      activeToolId={activeToolId}
      onSelectTool={setActiveToolId}
      isOffline={isOffline}
      lastUpdated={lastUpdated}
      onSync={handleSync}
      isSyncing={isSyncing}
    >
      {ToolComponent ? (
        <ToolComponent modelPrices={prices} />
      ) : (
        <div style={styles.container}>
          <h2 style={styles.title}>Nova Suite Loaded</h2>
          <p style={styles.subtitle}>
            Core framework rehydrated successfully. Loaded {prices.length} models.
          </p>
          <div style={styles.modelList}>
            {prices.slice(0, 3).map((p) => (
              <div key={p.id} style={styles.modelCard}>
                <div style={styles.modelHeader}>
                  <span style={styles.modelName}>{p.name}</span>
                  <span style={styles.modelContext}>{p.context_length.toLocaleString()} tokens</span>
                </div>
                <div style={styles.modelPricing}>
                  Prompt: ${parseFloat(p.pricing.prompt) * 1e6}/M | Completion: ${parseFloat(p.pricing.completion) * 1e6}/M
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MacWindow>
  );
};

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <NovaSuiteApp />
    </ErrorProvider>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  modelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
    maxWidth: '450px'
  },
  modelCard: {
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  modelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modelName: {
    fontSize: '12px',
    fontWeight: 600
  },
  modelContext: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  modelPricing: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  }
};

export default App;
