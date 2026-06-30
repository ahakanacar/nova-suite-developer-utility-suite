import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface SystemError {
  code: string;
  message: string;
  technicalDetails?: string;
  timestamp: number;
  retryAction?: () => Promise<void> | void;
}

interface ErrorContextType {
  error: SystemError | null;
  setError: (err: SystemError | null) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setErrorState] = useState<SystemError | null>(null);

  const setError = (err: SystemError | null) => {
    setErrorState(err);
    if (err) {
      console.error(`[SystemError] [${err.code}] ${err.message}`, err.technicalDetails);
    }
  };

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
      {error && <MacErrorDialog error={error} onClose={() => setError(null)} />}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/* macOS Native style Dialog Alert Modal */
const MacErrorDialog: React.FC<{ error: SystemError; onClose: () => void }> = ({ error, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!error.retryAction) return;
    try {
      setIsRetrying(true);
      await error.retryAction();
      onClose();
    } catch (err) {
      console.error('Retry action failed', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <AlertCircle size={36} color="var(--accent-red)" />
          </div>
          
          <div style={styles.textContainer}>
            <h3 style={styles.title}>System Notification</h3>
            <p style={styles.message}>{error.message}</p>
            
            {error.technicalDetails && (
              <div style={styles.detailsSection}>
                <button 
                  onClick={() => setShowDetails(!showDetails)} 
                  style={styles.detailsToggle}
                >
                  {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                </button>
                {showDetails && (
                  <pre style={styles.technicalBlock}>
                    Code: {error.code}
                    {"\n"}Time: {new Date(error.timestamp).toISOString()}
                    {"\n\n"}{error.technicalDetails}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons footer */}
        <div style={styles.footer}>
          {error.retryAction && (
            <button 
              onClick={handleRetry} 
              disabled={isRetrying}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              <RotateCcw size={12} style={{ marginRight: 4 }} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button onClick={onClose} style={{ ...styles.button, ...styles.buttonPrimary }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: 'var(--font-family)',
    backdropFilter: 'blur(4px)'
  },
  dialog: {
    width: '380px',
    backgroundColor: 'var(--bg-window)',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  content: {
    padding: '20px',
    display: 'flex',
    gap: '16px'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  textContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  message: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  detailsSection: {
    marginTop: '8px'
  },
  detailsToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontSize: '11px',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    fontWeight: 500
  },
  technicalBlock: {
    marginTop: '6px',
    padding: '8px',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    maxHeight: '100px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-main)',
    borderTop: '1px solid var(--border-color)'
  },
  button: {
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPrimary: {
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff'
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  }
};
