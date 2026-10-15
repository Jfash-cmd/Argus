'use client';

import { Search, DollarSign } from 'lucide-react';

interface SearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  minPrize: string;
  onMinPrizeChange: (val: string) => void;
}

export function SearchBar({
  search,
  onSearchChange,
  minPrize,
  onMinPrizeChange,
}: SearchBarProps) {
  return (
    <div style={{
      borderTop: '1px solid var(--border-hairline)',
      borderBottom: '1px solid var(--border-hairline)',
      padding: '0.85rem 0',
      marginBottom: '2rem',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="SEARCH BY KEYWORD, ECOSYSTEM, OR SKILL..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mono-label"
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem 0.55rem 2.2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-light)',
            borderRadius: '2px',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.2rem 0.6rem', border: '1px solid var(--border-hairline)' }}>
        <DollarSign size={14} color="var(--accent-coral)" />
        <span className="mono-label" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>MIN:</span>
        <input
          type="number"
          placeholder="0"
          value={minPrize}
          onChange={(e) => onMinPrizeChange(e.target.value)}
          className="mono-label"
          style={{ width: '65px', background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '0.75rem' }}
        />
      </div>
    </div>
  );
}
