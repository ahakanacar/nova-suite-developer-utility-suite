import React, { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface SchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
}

interface ParsedSchema {
  name: string;
  description?: string;
  parameters?: {
    type: string;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
  };
}

export const SchemaValidator: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    name: "get_weather",
    description: "Get the current weather for a given location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA"
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "The temperature unit to return"
        },
        forecast_days: {
          type: "integer",
          description: "Number of days for forecast lookup"
        },
        include_humidity: {
          type: "boolean",
          description: "Include relative humidity percentage in output"
        }
      },
      required: ["location"]
    }
  }, null, 2));

  const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audited, setAudited] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isHovered, setIsHovered] = useState(false);

  const handleValidate = () => {
    try {
      if (!jsonInput.trim()) {
        setParsedSchema(null);
        setErrorMsg(null);
        setAudited(false);
        return;
      }
      const data = JSON.parse(jsonInput);
      
      // Basic validation of OpenAI function calling format
      if (!data.name) {
        throw new Error('Function schema must contain a top-level "name" property.');
      }
      
      setParsedSchema(data);
      setErrorMsg(null);
      setAudited(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid JSON syntax');
      setAudited(true);
    }
  };

  const handleTextChange = (val: string) => {
    setJsonInput(val);
    if (val.trim() === '') {
      setParsedSchema(null);
      setErrorMsg(null);
      setAudited(false);
    }
  };

  const handleInputChange = (key: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const isInputEmpty = !jsonInput.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tool Schema Validator & Previewer</h2>
      <p style={styles.subtitle}>
        Validate LLM function calling declarations and preview interactive client-side forms.
      </p>

      <div className="split-row" style={styles.splitRow}>
        {/* JSON Editor panel */}
        <div style={styles.editorPanel}>
          <label style={styles.label}>Raw Schema/JSON Input</label>
          <textarea
            value={jsonInput}
            onChange={(e) => handleTextChange(e.target.value)}
            style={{
              ...styles.textarea,
              border: audited && errorMsg ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
              overflowY: 'auto'
            }}
            placeholder="Paste your JSON function spec here..."
          />

          <button
            onClick={handleValidate}
            disabled={isInputEmpty}
            onMouseEnter={() => !isInputEmpty && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              ...styles.validateButton,
              backgroundColor: isInputEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isHovered
                  ? '#732be6'
                  : '#863bff',
              cursor: isInputEmpty ? 'not-allowed' : 'pointer',
              opacity: isInputEmpty ? 0.6 : 1
            }}
          >
            Validate Schema
          </button>
        </div>

        {/* Dynamic Visual Form Preview panel */}
        <div style={styles.previewPanel}>
          <label style={styles.label}>Validation Output</label>
          <div style={styles.formContainer}>
            {audited ? (
              <div style={styles.formContent}>
                {errorMsg ? (
                  <div style={styles.errorBanner}>
                    <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                ) : (
                  <div style={styles.successCard}>
                    <CheckCircle size={14} color="#22c55e" style={{ marginRight: 6, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Schema Validated Successfully</span>
                  </div>
                )}

                {parsedSchema && !errorMsg && (
                  <>
                    <div style={styles.formHeader}>
                      <h3 style={styles.formTitle}>{parsedSchema.name}</h3>
                      {parsedSchema.description && (
                        <p style={styles.formDesc}>{parsedSchema.description}</p>
                      )}
                    </div>

                    {parsedSchema.parameters?.properties && (
                      <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
                        {Object.entries(parsedSchema.parameters.properties).map(([key, prop]) => {
                          const isRequired = parsedSchema.parameters?.required?.includes(key);
                          const currentVal = formValues[key] !== undefined ? formValues[key] : '';

                          return (
                            <div key={key} style={styles.formField}>
                              <label style={styles.fieldLabel}>
                                {key} {isRequired && <span style={styles.requiredStar}>*</span>}
                              </label>

                              {prop.enum ? (
                                <select
                                  value={currentVal}
                                  onChange={(e) => handleInputChange(key, e.target.value)}
                                  style={styles.fieldInput}
                                >
                                  <option value="">Select option...</option>
                                  {prop.enum.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : prop.type === 'boolean' ? (
                                <div style={styles.checkboxWrapper}>
                                  <input
                                    type="checkbox"
                                    checked={!!currentVal}
                                    onChange={(e) => handleInputChange(key, e.target.checked)}
                                    style={styles.checkbox}
                                    id={`check-${key}`}
                                  />
                                  <label htmlFor={`check-${key}`} style={styles.checkboxLabel}>
                                    Enable {key}
                                  </label>
                                </div>
                              ) : prop.type === 'integer' || prop.type === 'number' ? (
                                <input
                                  type="number"
                                  value={currentVal}
                                  onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
                                  style={styles.fieldInput}
                                  placeholder={`Enter ${prop.type}...`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) => handleInputChange(key, e.target.value)}
                                  style={styles.fieldInput}
                                  placeholder="Enter string..."
                                />
                              )}

                              {prop.description && (
                                <span style={styles.fieldHelp}>{prop.description}</span>
                              )}
                            </div>
                          );
                        })}
                      </form>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div style={styles.emptyPreview}>
                Validation report will appear here...
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
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  previewPanel: {
    width: '320px',
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
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    outline: 'none',
    resize: 'none',
    transition: 'border-color 0.15s ease'
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    color: 'var(--accent-red)',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    border: '1px solid rgba(255, 59, 48, 0.2)',
    display: 'flex',
    alignItems: 'center'
  },
  successCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center'
  },
  formContainer: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    overflowY: 'auto',
    padding: '16px'
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formHeader: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  },
  formTitle: {
    fontSize: '14px',
    fontWeight: 600
  },
  formDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  requiredStar: {
    color: 'var(--accent-red)'
  },
  fieldInput: {
    padding: '6px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-window)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%'
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 0'
  },
  checkbox: {
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '12px',
    cursor: 'pointer'
  },
  fieldHelp: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  emptyPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  validateButton: {
    padding: '10px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    outline: 'none',
    textAlign: 'center'
  }
};
