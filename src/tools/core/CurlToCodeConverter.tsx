import React, { useState } from 'react';
import { Copy, FileCode } from 'lucide-react';

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string | null;
}

export const CurlToCodeConverter: React.FC = () => {
  const defaultCurl = `curl 'https://api.novasuite.dev/v1/data' \\
  -H 'Authorization: Bearer ns_secret_key_2026' \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"status":"active","query":"premium_metrics"}'`;

  const [curlInput, setCurlInput] = useState(defaultCurl);
  const [targetFormat, setTargetFormat] = useState<'fetch' | 'axios' | 'python'>('fetch');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const parseCurl = (curl: string): ParsedCurl => {
    const cleanCurl = curl.replace(/\\\n/g, ' ').trim();
    
    // Extract URL
    let url = 'https://api.example.com';
    const urlRegex = /(https?:\/\/[^\s'"]+)/i;
    const urlMatch = cleanCurl.match(urlRegex);
    if (urlMatch) {
      url = urlMatch[1].replace(/['"]+$/g, '').replace(/^['"]+/g, '');
    }

    // Extract Method
    let method = 'GET';
    if (/-X\s+(\w+)/i.test(cleanCurl)) {
      const match = cleanCurl.match(/-X\s+(\w+)/i);
      if (match) method = match[1].toUpperCase();
    } else if (/--request\s+(\w+)/i.test(cleanCurl)) {
      const match = cleanCurl.match(/--request\s+(\w+)/i);
      if (match) method = match[1].toUpperCase();
    } else if (/-d\s+|--data\s+|--data-raw\s+|--data-binary\s+/i.test(cleanCurl)) {
      method = 'POST';
    }

    // Extract Headers
    const headers: Record<string, string> = {};
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cleanCurl)) !== null) {
      const parts = headerMatch[1].split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        headers[key] = val;
      }
    }

    // Fallback search for headers without outer quotes or mixed quotes
    if (Object.keys(headers).length === 0) {
      const fallbackHeaderRegex = /(?:-H|--header)\s+([^\s'"]+)/g;
      let fbMatch;
      while ((fbMatch = fallbackHeaderRegex.exec(cleanCurl)) !== null) {
        const parts = fbMatch[1].split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          headers[key] = val;
        }
      }
    }

    // Extract Data
    let data: string | null = null;
    const dataRegex = /(?:-d|--data|--data-raw|--data-binary)\s+["']([\s\S]*?)["']/i;
    const dataMatch = cleanCurl.match(dataRegex);
    if (dataMatch) {
      data = dataMatch[1];
    } else {
      const unquotedDataRegex = /(?:-d|--data|--data-raw|--data-binary)\s+([^\s]+)/i;
      const unquotedDataMatch = cleanCurl.match(unquotedDataRegex);
      if (unquotedDataMatch) {
        data = unquotedDataMatch[1];
      }
    }

    return { url, method, headers, data };
  };

  const generateFetch = (parsed: ParsedCurl): string => {
    let code = `const url = '${parsed.url}';\n`;
    const options: any = {
      method: parsed.method
    };
    if (Object.keys(parsed.headers).length > 0) {
      options.headers = parsed.headers;
    }
    if (parsed.data) {
      options.body = parsed.data;
    }
    
    code += `const options = ${JSON.stringify(options, null, 2)};\n\n`;
    code += `fetch(url, options)\n`;
    code += `  .then(res => res.json())\n`;
    code += `  .then(json => console.log(json))\n`;
    code += `  .catch(err => console.error(err));`;
    return code;
  };

  const generateAxios = (parsed: ParsedCurl): string => {
    let code = `import axios from 'axios';\n\n`;
    const config: any = {
      method: parsed.method.toLowerCase(),
      url: parsed.url
    };
    if (Object.keys(parsed.headers).length > 0) {
      config.headers = parsed.headers;
    }
    if (parsed.data) {
      try {
        config.data = JSON.parse(parsed.data);
      } catch {
        config.data = parsed.data;
      }
    }
    
    code += `const config = ${JSON.stringify(config, null, 2)};\n\n`;
    code += `axios(config)\n`;
    code += `  .then(response => {\n`;
    code += `    console.log(response.data);\n`;
    code += `  })\n`;
    code += `  .catch(error => {\n`;
    code += `    console.error(error);\n`;
    code += `  });`;
    return code;
  };

  const generatePython = (parsed: ParsedCurl): string => {
    let code = `import requests\n\n`;
    code += `url = "${parsed.url}"\n\n`;
    
    if (Object.keys(parsed.headers).length > 0) {
      code += `headers = {\n`;
      Object.entries(parsed.headers).forEach(([k, v]) => {
        code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
      });
      code += `}\n\n`;
    } else {
      code += `headers = {}\n\n`;
    }

    if (parsed.data) {
      try {
        const jsonParsed = JSON.parse(parsed.data);
        code += `data = ${JSON.stringify(jsonParsed, null, 4)}\n\n`;
        code += `response = requests.${parsed.method.toLowerCase()}(\n`;
        code += `    url,\n`;
        code += `    headers=headers,\n`;
        code += `    json=data\n`;
        code += `)\n`;
      } catch {
        code += `data = "${parsed.data.replace(/"/g, '\\"')}"\n\n`;
        code += `response = requests.${parsed.method.toLowerCase()}(\n`;
        code += `    url,\n`;
        code += `    headers=headers,\n`;
        code += `    data=data\n`;
        code += `)\n`;
      }
    } else {
      code += `response = requests.${parsed.method.toLowerCase()}(url, headers=headers)\n`;
    }
    
    code += `\nprint(response.status_code)\n`;
    code += `print(response.text)`;
    return code;
  };

  const handleConvert = () => {
    setError(null);
    setOutput('');

    const cleanInput = curlInput.trim();
    if (!cleanInput) return;

    if (!cleanInput.toLowerCase().startsWith('curl')) {
      setError('Failed to parse cURL. Please ensure it is a valid cURL command.');
      return;
    }

    try {
      const parsed = parseCurl(cleanInput);
      let codeOutput = '';

      if (targetFormat === 'fetch') {
        codeOutput = generateFetch(parsed);
      } else if (targetFormat === 'axios') {
        codeOutput = generateAxios(parsed);
      } else if (targetFormat === 'python') {
        codeOutput = generatePython(parsed);
      }

      setOutput(codeOutput);
    } catch (err: any) {
      setError('Failed to parse cURL. Please ensure it is a valid cURL command.');
    }
  };

  const handleInputChange = (val: string) => {
    setCurlInput(val);
    if (val.trim() === '') {
      setOutput('');
      setError(null);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const isInputEmpty = !curlInput || curlInput.trim() === '';

  // Initial code generation run on mount if output is not set
  React.useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFormat]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>cURL to Code Converter</h2>
      <p style={styles.subtitle}>
        Deconstruct raw HTTP cURL commands into clean executable Fetch, Axios, or Python Requests code blocks.
      </p>

      <div style={styles.splitRow}>
        {/* Left cURL Input Panel */}
        <div style={styles.panel}>
          <label style={styles.panelLabel}>Raw cURL Input</label>
          <textarea
            value={curlInput}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Paste your curl command here (e.g. curl https://api.example.com)..."
          />
          
          {/* Action Button */}
          <div style={styles.btnRow}>
            <button
              onClick={handleConvert}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.actionButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isBtnHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              <FileCode size={14} style={{ marginRight: 6 }} /> Convert cURL
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.tabSelector}>
              <button
                onClick={() => setTargetFormat('fetch')}
                style={targetFormat === 'fetch' ? styles.activeTab : styles.tab}
              >
                Fetch
              </button>
              <button
                onClick={() => setTargetFormat('axios')}
                style={targetFormat === 'axios' ? styles.activeTab : styles.tab}
              >
                Axios
              </button>
              <button
                onClick={() => setTargetFormat('python')}
                style={targetFormat === 'python' ? styles.activeTab : styles.tab}
              >
                Python
              </button>
            </div>
            {output && (
              <button
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  color: copied ? '#22c55e' : 'var(--accent-blue)'
                }}
              >
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            )}
          </div>

          {error ? (
            <div style={styles.errorBox}>
              {error}
            </div>
          ) : output ? (
            <pre
              onClick={handleCopy}
              style={{
                ...styles.outputPre,
                cursor: 'pointer',
                borderColor: copied ? '#22c55e' : 'var(--border-color)',
                transform: copied ? 'scale(1.01)' : 'scale(1)'
              }}
            >
              <code>{output}</code>
            </pre>
          ) : (
            <div style={styles.emptyOutputBox}>
              Converted code will appear here...
            </div>
          )}
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
    flex: 1,
    minHeight: '400px'
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  panelLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  tabSelector: {
    display: 'flex',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '2px',
    gap: '2px'
  },
  tab: {
    padding: '4px 10px',
    border: 'none',
    background: 'none',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '4px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  activeTab: {
    padding: '4px 10px',
    border: 'none',
    backgroundColor: 'var(--bg-window)',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    color: 'var(--text-primary)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
    border: '1px solid var(--border-color)'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: '6px',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
    outline: 'none',
    width: '100%'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  outputPre: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '16px 20px',
    overflowY: 'auto',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: 0,
    transition: 'transform 0.15s ease, border-color 0.15s ease'
  },
  emptyOutputBox: {
    flex: 1,
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  errorBox: {
    flex: 1,
    border: '1px solid rgba(255, 59, 48, 0.15)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--accent-red)',
    padding: '16px 20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }
};
