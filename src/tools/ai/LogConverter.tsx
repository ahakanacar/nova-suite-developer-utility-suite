import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle } from 'lucide-react';
import LogWorker from './logConverter.worker?worker';

export const LogConverter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputJsonl, setOutputJsonl] = useState('');
  const [stats, setStats] = useState<{ success: number; skipped: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Instantiate background Web Worker
    workerRef.current = new LogWorker();

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { outputJsonl, successfulRows, skippedRows, error } = e.data;
      setIsProcessing(false);

      if (error) {
        console.error('Worker processing error:', error);
        return;
      }

      setOutputJsonl(outputJsonl);
      setStats({ success: successfulRows, skipped: skippedRows });
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleProcessLogs = (textToProcess: string) => {
    if (!textToProcess.trim() || !workerRef.current) return;
    setIsProcessing(true);
    setStats(null);
    workerRef.current.postMessage({ rawText: textToProcess });
  };

  // Handle local file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        handleProcessLogs(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        handleProcessLogs(text);
      };
      reader.readAsText(file);
    }
  };

  const downloadBlob = () => {
    if (!outputJsonl) return;
    const blob = new Blob([outputJsonl], { type: 'application/x-jsonlines;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fine_tuning_dataset.jsonl');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log to Fine-Tuning Dataset Converter</h2>
      <p style={styles.subtitle}>
        Import raw JSON or simple chatbot logs and convert them to OpenAI Fine-Tuning chat dataset format (.jsonl).
      </p>

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          ...styles.dropzone,
          borderColor: isDragOver ? 'var(--accent-blue)' : 'var(--border-color)',
          backgroundColor: isDragOver ? 'var(--bg-sidebar-hover)' : 'var(--bg-sidebar)'
        }}
      >
        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
        <span style={styles.dropText}>Drag and drop log file here (.log, .json, .txt)</span>
        <span style={styles.dropSub}>or click to select from files</span>
        <input
          type="file"
          accept=".json,.log,.txt"
          onChange={handleFileSelect}
          style={styles.fileInput}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={styles.fileButton}>
          Browse Files
        </label>
      </div>

      <div style={styles.splitRow}>
        <div style={styles.panel}>
          <label style={styles.label}>Paste Raw Log Content (Fallback)</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={styles.textarea}
            placeholder='{"prompt": "Hi", "completion": "Hello"}&#10;{"prompt": "Query", "completion": "Response"}'
          />
          <button
            onClick={() => handleProcessLogs(inputText)}
            disabled={isProcessing || !inputText.trim()}
            style={{
              ...styles.processButton,
              opacity: !inputText.trim() ? 0.6 : 1
            }}
          >
            {isProcessing ? 'Processing in background...' : 'Convert Log Data'}
          </button>
        </div>

        {/* Processing Stats Card */}
        <div style={styles.panel}>
          <label style={styles.label}>Conversion Status & Output</label>
          <div style={styles.statusBox}>
            {stats ? (
              <div style={styles.statsCard}>
                <div style={styles.statsHeader}>
                  <CheckCircle size={18} color="var(--accent-green)" />
                  <span style={styles.statsTitle}>Dataset Succeeded</span>
                </div>
                <div style={styles.statsMetrics}>
                  <div style={styles.metric}>
                    <span>Successfully formatted:</span>
                    <strong>{stats.success} rows</strong>
                  </div>
                  <div style={styles.metric}>
                    <span>Malformed skipped:</span>
                    <strong>{stats.skipped} rows</strong>
                  </div>
                </div>
                <button onClick={downloadBlob} style={styles.downloadButton}>
                  <Download size={14} style={{ marginRight: 6 }} />
                  Download FT Dataset (.jsonl)
                </button>

                <div style={styles.previewContainer}>
                  <label style={styles.previewLabel}>Dataset Preview (.jsonl)</label>
                  <pre style={styles.previewCode}>
                    {outputJsonl || '// No output data generated yet.'}
                  </pre>
                </div>
              </div>
            ) : isProcessing ? (
              <div style={styles.loadingState}>
                <FileText size={28} style={{ color: 'var(--accent-blue)', animation: 'pulse 1.5s infinite' }} />
                <span>Parsing logs with background worker threads...</span>
              </div>
            ) : (
              <div style={styles.loadingState}>
                <FileText size={28} style={{ color: 'var(--text-muted)' }} />
                <span>Upload a log file or paste raw content to start generation.</span>
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
  dropzone: {
    padding: '24px',
    border: '2px dashed var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    position: 'relative'
  },
  dropText: {
    fontSize: '13px',
    fontWeight: 500
  },
  dropSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
    marginBottom: '10px'
  },
  fileInput: {
    display: 'none'
  },
  fileButton: {
    padding: '5px 12px',
    backgroundColor: 'var(--bg-window)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-element)'
  },
  splitRow: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minHeight: '240px'
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
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none',
    border: '1px solid var(--border-color)'
  },
  processButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none'
  },
  statusBox: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  },
  statsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    width: '100%'
  },
  statsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statsTitle: {
    fontSize: '14px',
    fontWeight: 600
  },
  statsMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    width: '100%',
    maxWidth: '220px'
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: 'var(--accent-green)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'var(--shadow-element)'
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    marginTop: '10px'
  },
  previewLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    alignSelf: 'flex-start'
  },
  previewCode: {
    width: '100%',
    maxHeight: '180px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    textAlign: 'left'
  }
};
