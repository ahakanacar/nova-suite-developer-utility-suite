import React from 'react';
import { RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { getRegisteredTools, CATEGORY_LABELS } from '../registry/toolRegistry';

interface MacWindowProps {
  children?: React.ReactNode;
  activeToolId?: string;
  onSelectTool?: (id: string) => void;
  isOffline?: boolean;
  lastUpdated?: string | null;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  children,
  activeToolId,
  onSelectTool,
  isOffline = false,
  lastUpdated = null,
  onSync,
  isSyncing = false
}) => {
  const tools = getRegisteredTools();

  // Group tools by category
  const aiTools = tools.filter((t) => t.category === 'ai');
  const coreTools = tools.filter((t) => t.category === 'core');

  return (
    <div style={styles.windowContainer}>
      {/* Sidebar Section */}
      <aside style={styles.sidebar}>
        {/* Sidebar Header Title (Brand Styling with Purple SVG) */}
        <div style={styles.brandLogo}>
          <svg style={styles.brandIconSvg} viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
          </svg>
          <span style={styles.brandText}>Nova Suite</span>
        </div>
        
        {/* Sidebar Navigation Menu */}
        <nav style={styles.navMenu}>
          {aiTools.length > 0 && (
            <>
              <div style={styles.sectionHeader}>{CATEGORY_LABELS.ai}</div>
              {aiTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTool?.(t.id)}
                  style={{
                    ...styles.navItem,
                    ...(activeToolId === t.id ? styles.navItemActive : {})
                  }}
                >
                  {t.name}
                </div>
              ))}
            </>
          )}

          {coreTools.length > 0 && (
            <>
              <div style={styles.sectionHeader}>{CATEGORY_LABELS.core}</div>
              {coreTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTool?.(t.id)}
                  style={{
                    ...styles.navItem,
                    ...(activeToolId === t.id ? styles.navItemActive : {})
                  }}
                >
                  {t.name}
                </div>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main Workspace Frame */}
      <main style={styles.mainFrame}>
        {/* Header Ribbon bar */}
        <header style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <span style={styles.headerStatusText}>
              {isOffline ? 'Offline Mode' : 'Model Prices Synced'}
            </span>
          </div>

          <div style={styles.headerRight}>
            {lastUpdated && (
              <span style={styles.timestampLabel}>
                Synced: {lastUpdated}
              </span>
            )}
            <button
              onClick={onSync}
              disabled={isSyncing}
              style={{
                ...styles.syncButton,
                cursor: isSyncing ? 'not-allowed' : 'pointer'
              }}
              title="Synchronize model prices"
            >
              <RefreshCw
                size={14}
                style={{
                  ...styles.syncIcon,
                  animation: isSyncing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </header>

        {/* Offline Alert Bar */}
        {isOffline && (
          <div style={styles.offlineBanner}>
            {lastUpdated ? (
              <>
                <CloudOff size={14} style={{ marginRight: 6 }} />
                Offline Mode: Using cached rates from {lastUpdated}
              </>
            ) : (
              <>
                <CloudOff size={14} style={{ marginRight: 6 }} />
                Offline Mode: Using bundled archive rates
              </>
            )}
          </div>
        )}

        {/* Content Wrapper */}
        <section style={styles.contentArea}>
          {children || (
            <div style={styles.placeholderContainer}>
              <Cloud size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <h2 style={{ fontWeight: 500, fontSize: 18, marginBottom: 6 }}>Welcome to NovaSuite</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
                Select a tool from the sidebar to begin processing prompts, schemas, or datasets.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

/* Styles object for native macOS layouts without external tailwind */
const styles: { [key: string]: React.CSSProperties } = {
  windowContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'var(--bg-window)',
    overflow: 'hidden',
    fontFamily: 'var(--font-family)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  },
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--bg-sidebar)',
    backdropFilter: 'var(--blur-vibrancy)',
    borderRight: '1px solid var(--border-color)',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none'
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 8px 16px 8px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '12px'
  },
  brandIconSvg: {
    width: '20px',
    height: '20px',
    flexShrink: 0
  },
  brandText: {
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  trafficLights: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    paddingLeft: '8px',
    marginBottom: '16px'
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
    flex: 1
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    padding: '8px 8px 4px 8px',
    marginTop: '8px'
  },
  navItem: {
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  navItemActive: {
    backgroundColor: 'var(--bg-sidebar-active)',
    fontWeight: 500
  },
  mainFrame: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-window)'
  },
  headerBar: {
    height: '48px',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  headerStatusText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: 500
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  timestampLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  syncButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontWeight: 500,
    outline: 'none',
    transition: 'background-color 0.15s ease'
  },
  syncIcon: {
    transition: 'transform 0.15s ease'
  },
  offlineBanner: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    color: 'var(--text-primary)',
    padding: '8px 20px',
    fontSize: '12px',
    fontWeight: 500,
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center'
  },
  contentArea: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    position: 'relative'
  },
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-primary)'
  }
};
