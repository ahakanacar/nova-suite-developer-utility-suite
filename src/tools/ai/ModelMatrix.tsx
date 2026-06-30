import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Search, Database } from 'lucide-react';
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

type SortField = 'name' | 'context_length' | 'prompt' | 'completion';
type SortOrder = 'asc' | 'desc';

export const ModelMatrix: React.FC = () => {
  const [models, setModels] = useState<ModelPrice[]>(fallbackPrices);
  const [isUsingCached, setIsUsingCached] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Load prices from cache or fallback on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('novasuite_model_prices');
    if (cachedData) {
      try {
        setModels(JSON.parse(cachedData));
        setIsUsingCached(true);
      } catch (err) {
        console.error('Failed to parse cached prices in ModelMatrix', err);
      }
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort and filter models dataset
  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedModels = [...filteredModels].sort((a, b) => {
    let aVal: any = a[sortField as keyof ModelPrice] || '';
    let bVal: any = b[sortField as keyof ModelPrice] || '';

    // Handle prices nested paths
    if (sortField === 'prompt') {
      aVal = parseFloat(a.pricing.prompt);
      bVal = parseFloat(b.pricing.prompt);
    } else if (sortField === 'completion') {
      aVal = parseFloat(a.pricing.completion);
      bVal = parseFloat(b.pricing.completion);
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' 
      ? (aVal as number) - (bVal as number) 
      : (bVal as number) - (aVal as number);
  });

  return (
    <div style={styles.container}>
      {/* Top Controls panel */}
      <div style={styles.header}>
        <div style={styles.titleCol}>
          <h2 style={styles.title}>Model Comparison Matrix</h2>
          <p style={styles.subtitle}>
            Explore and filter technical capacities, context limits, and cost scales of active LLM models.
          </p>
        </div>

        {/* Local archive badge info */}
        {isUsingCached && (
          <div style={styles.archiveBadge}>
            <Database size={12} style={{ marginRight: 4 }} />
            Viewing local archive data
          </div>
        )}
      </div>

      {/* Search Input bar */}
      <div style={styles.searchContainer}>
        <Search size={14} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by model name or provider id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      {/* Grid Comparison Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={styles.th}>
                <div style={styles.thContent}>
                  Model Name <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('context_length')} style={{ ...styles.th, width: '150px' }}>
                <div style={styles.thContent}>
                  Context Length <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('prompt')} style={{ ...styles.th, width: '130px' }}>
                <div style={styles.thContent}>
                  Prompt ($/M) <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('completion')} style={{ ...styles.th, width: '130px' }}>
                <div style={styles.thContent}>
                  Output ($/M) <ArrowUpDown size={12} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedModels.length > 0 ? (
              sortedModels.map((m) => (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.modelName}>{m.name}</div>
                    <div style={styles.modelId}>{m.id}</div>
                  </td>
                  <td style={styles.td}>
                    {m.context_length.toLocaleString()} tokens
                  </td>
                  <td style={styles.td}>
                    ${(parseFloat(m.pricing.prompt) * 1e6).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    ${(parseFloat(m.pricing.completion) * 1e6).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={styles.noResults}>
                  No models match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  title: {
    fontSize: '18px',
    fontWeight: 600
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  archiveBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    userSelect: 'none'
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  searchBar: {
    width: '100%',
    padding: '8px 12px 8px 34px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  tableWrapper: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-window)',
    overflow: 'auto',
    minHeight: '260px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    textAlign: 'left'
  },
  th: {
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none'
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '12px 16px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle'
  },
  modelName: {
    fontWeight: 500
  },
  modelId: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  noResults: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-muted)'
  }
};
