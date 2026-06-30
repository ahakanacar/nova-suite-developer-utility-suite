import React, { useState } from 'react';
import { Eye, Code } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const MarkdownPreviewer: React.FC = () => {
  const defaultMarkdown = 
    "# NovaSuite Markdown Previewer\n\n" +
    "A clean split-pane markdown visualizer with premium styling.\n\n" +
    "## Features\n" +
    "- Live dynamic HTML render\n" +
    "- Support headers, lists, tables\n" +
    "- Code highlight blocks\n\n" +
    "### Code Block Example\n" +
    "```javascript\n" +
    "const app = () => {\n" +
    "  console.log('Premium macOS Visuals!');\n" +
    "};\n" +
    "```\n\n" +
    "### Table Sample\n" +
    "| Feature | Status |\n" +
    "| :--- | :--- |\n" +
    "| React TS | Active |\n" +
    "| CSS Styling | Fluid |";

  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // Initial render of default markdown
  const initialHtml = DOMPurify.sanitize(
    marked.parse(defaultMarkdown, { gfm: true, breaks: true }) as string
  );
  const [renderedHtml, setRenderedHtml] = useState<string>(initialHtml);

  const handleRender = () => {
    if (markdown.trim() === '') {
      setRenderedHtml('');
      return;
    }
    const cleanHtml = DOMPurify.sanitize(
      marked.parse(markdown, { gfm: true, breaks: true }) as string
    );
    setRenderedHtml(cleanHtml);
  };

  const handleInputChange = (val: string) => {
    setMarkdown(val);
    if (val.trim() === '') {
      setRenderedHtml('');
    }
  };

  const isInputEmpty = !markdown || markdown.trim() === '';

  const markdownStyles = `
    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    .markdown-body th, .markdown-body td {
      border: 1px solid var(--border-color, #e1e4e8);
      padding: 8px 12px;
    }
    .markdown-body th {
      background-color: var(--bg-sidebar, #f6f8fa);
      font-weight: 600;
    }
    .markdown-body pre {
      background-color: var(--bg-main, #f6f8fa);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
      overflow: auto;
      margin-bottom: 16px;
    }
    .markdown-body code {
      font-family: monospace;
      font-size: 85%;
      background-color: rgba(27,31,35,0.05);
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    .markdown-body pre code {
      background-color: transparent;
      padding: 0;
    }
    .markdown-body ul, .markdown-body ol {
      padding-left: 2em;
      margin-bottom: 16px;
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3 {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.3em;
      margin-top: 24px;
      margin-bottom: 16px;
    }
  `;

  return (
    <div style={styles.container}>
      <style>{markdownStyles}</style>
      <h2 style={styles.title}>Markdown Previewer</h2>
      <p style={styles.subtitle}>
        Write GitHub-flavored Markdown on the left and see the rendered HTML preview on the right.
      </p>

      {/* Editor viewport layout */}
      <div style={styles.splitRow}>
        {/* Input Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>Markdown Input</label>
            <Code size={14} color="var(--text-muted)" />
          </div>
          <textarea
            value={markdown}
            onChange={(e) => handleInputChange(e.target.value)}
            style={styles.textarea}
            placeholder="Write your markdown structure..."
          />
          
          {/* Action Button Row */}
          <div style={styles.btnRow}>
            <button
              onClick={handleRender}
              disabled={isInputEmpty}
              onMouseEnter={() => !isInputEmpty && setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.primaryButton,
                backgroundColor: isInputEmpty
                  ? 'rgba(134, 59, 255, 0.4)'
                  : (isBtnHovered ? '#732be6' : '#863bff'),
                cursor: isInputEmpty ? 'not-allowed' : 'pointer'
              }}
            >
              Render Preview
            </button>
          </div>
        </div>

        {/* HTML Preview Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <label style={styles.panelLabel}>HTML Preview</label>
            <Eye size={14} color="var(--text-muted)" />
          </div>
          {renderedHtml ? (
            <div
              className="markdown-body"
              style={styles.previewBox}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <div style={styles.emptyPreviewBox}>
              Markdown preview will appear here.
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
  previewBox: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-sidebar)',
    padding: '16px 20px',
    overflowY: 'auto',
    fontSize: '13px',
    lineHeight: '1.6',
    color: 'var(--text-primary)'
  },
  emptyPreviewBox: {
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
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px'
  },
  primaryButton: {
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
    outline: 'none'
  }
};

