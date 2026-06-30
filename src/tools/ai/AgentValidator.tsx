import React, { useState, useEffect } from 'react';
import { safeParseYaml } from '../../utils/yaml';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ValidationError {
  type: 'syntax' | 'validation';
  line?: number;
  message: string;
}

export const AgentValidator: React.FC = () => {
  const [yamlInput, setYamlInput] = useState(
    `# CrewAI Agent Manifest Example\n` +
    `agent_name: "Lead Research Analyst"\n` +
    `role: "Senior Market Researcher"\n` +
    `goal: "Identify emerging tech trends in AI chip manufacturing"\n` +
    `backstory: "Experienced analyst with a background in semiconductor intelligence."`
  );

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleValidate = () => {
    if (!yamlInput.trim()) {
      setErrors([]);
      setIsValid(false);
      return;
    }

    const { data, error } = safeParseYaml(yamlInput);

    if (error) {
      setErrors([
        {
          type: 'syntax',
          line: error.line,
          message: `YAML Syntax Error: ${error.message} (Line ${error.line}, Col ${error.column})`
        }
      ]);
      setIsValid(false);
      return;
    }

    const validationErrors: ValidationError[] = [];

    // Verify agent definition objects
    if (!data || typeof data !== 'object') {
      validationErrors.push({
        type: 'validation',
        message: 'Manifest root must define a structured object mapping.'
      });
    } else {
      const keys = Object.keys(data);
      
      const hasName = keys.includes('agent_name') || keys.includes('name');
      const hasRole = keys.includes('role');
      const hasGoal = keys.includes('goal');
      const hasBackstory = keys.includes('backstory');

      if (!hasName) {
        validationErrors.push({
          type: 'validation',
          message: 'Missing mandatory key: "agent_name" or "name".'
        });
      }
      if (!hasRole) {
        validationErrors.push({
          type: 'validation',
          message: 'Missing mandatory key: "role".'
        });
      }
      if (!hasGoal) {
        validationErrors.push({
          type: 'validation',
          message: 'Missing mandatory key: "goal".'
        });
      }
      if (!hasBackstory) {
        validationErrors.push({
          type: 'validation',
          message: 'Missing key: "backstory" (highly recommended for CrewAI agent agents).'
        });
      }
    }

    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
  };

  // Perform initial validation on component mount
  useEffect(() => {
    handleValidate();
  }, []);

  const isYamlEmpty = !yamlInput.trim();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Agent Config Manifest Validator</h2>
      <p style={styles.subtitle}>
        Validate CrewAI and AutoGen agent YAML declarations against deployment requirements.
      </p>

      <div style={styles.splitRow}>
        {/* Editor panel */}
        <div style={styles.panel}>
          <label style={styles.label}>YAML Manifest Input</label>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            style={{
              ...styles.textarea,
              border: errors.some(e => e.type === 'syntax')
                ? '1px solid var(--accent-red)'
                : errors.length > 0
                ? '1px solid var(--accent-yellow)'
                : '1px solid var(--border-color)'
            }}
            placeholder="Paste your agent configuration YAML here..."
          />

          <button
            onClick={handleValidate}
            disabled={isYamlEmpty}
            onMouseEnter={() => !isYamlEmpty && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              ...styles.validateButton,
              backgroundColor: isYamlEmpty
                ? 'rgba(134, 59, 255, 0.4)'
                : isHovered
                  ? 'var(--accent-blue-hover)'
                  : 'var(--accent-blue)',
              cursor: isYamlEmpty ? 'not-allowed' : 'pointer',
              opacity: isYamlEmpty ? 0.6 : 1
            }}
          >
            Validate Manifest
          </button>
        </div>

        {/* Validation Status panel */}
        <div style={styles.panel}>
          <label style={styles.label}>Validation Checklist</label>
          <div style={styles.statusBox}>
            {isValid ? (
              <div style={styles.successCard}>
                <CheckCircle2 size={36} color="var(--accent-green)" />
                <h3 style={styles.statusTitle}>Valid Agent Manifest</h3>
                <p style={styles.statusDesc}>
                  The agent config passes all syntax checks and includes required parameters.
                </p>
              </div>
            ) : errors.length > 0 ? (
              <div style={styles.errorsContainer}>
                {errors.map((err, idx) => {
                  const isSyntax = err.type === 'syntax';
                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.errorCard,
                        backgroundColor: isSyntax ? 'rgba(255, 59, 48, 0.08)' : 'rgba(255, 204, 0, 0.08)',
                        border: isSyntax ? '1px solid rgba(255, 59, 48, 0.15)' : '1px solid rgba(255, 204, 0, 0.2)'
                      }}
                    >
                      {isSyntax ? (
                        <ShieldAlert size={16} color="var(--accent-red)" style={{ marginTop: 2 }} />
                      ) : (
                        <AlertTriangle size={16} color="var(--accent-yellow)" style={{ marginTop: 2 }} />
                      )}
                      <div style={styles.errorTextGroup}>
                        <span style={styles.errorText}>{err.message}</span>
                        {err.line && (
                          <span style={styles.errorLineInfo}>Syntax break at line {err.line}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyStatus}>
                Paste an agent configuration manifest to run the validations checklist.
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
  statusBox: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    overflowY: 'auto',
    padding: '16px'
  },
  successCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    gap: '8px'
  },
  statusTitle: {
    fontSize: '14px',
    fontWeight: 600
  },
  statusDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    maxWidth: '260px',
    lineHeight: '1.4'
  },
  errorsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  errorCard: {
    padding: '10px 12px',
    borderRadius: '6px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  errorTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  errorText: {
    fontSize: '12px',
    fontWeight: 500
  },
  errorLineInfo: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  emptyStatus: {
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
