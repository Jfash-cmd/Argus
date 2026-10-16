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
    <div className="search-bar-row">
      <div className="search-input-wrapper">
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="SEARCH BY KEYWORD, ECOSYSTEM, OR SKILL..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mono-label search-input-field"
        />
      </div>

      <div className="min-prize-wrapper">
        <DollarSign size={15} color="var(--accent-coral)" />
        <span className="mono-label" style={{ color: 'var(--text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
          MIN:
        </span>
        <input
          type="number"
          placeholder="0"
          value={minPrize}
          onChange={(e) => onMinPrizeChange(e.target.value)}
          className="mono-label min-prize-input"
        />
      </div>
    </div>
  );
}
