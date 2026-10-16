'use client';

import { Check, Send, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface FilterFormProps {
  filter: { keywords: string[]; categories: string[]; min_prize: number };
  onFilterChange: (newFilter: { keywords: string[]; categories: string[]; min_prize: number }) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  savedSuccess: boolean;
  user: any;
}

export function FilterForm({ filter, onFilterChange, onSave, saving, savedSuccess, user }: FilterFormProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const allCategories = ['web3_hackathon', 'web2_hackathon', 'bounty', 'freelance', 'grant'];
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ArgusOpportunityBot';
  const deepLink = user?.auth_token 
    ? `https://t.me/${botUsername}?start=${user.auth_token}`
    : `https://t.me/${botUsername}`;

  const toggleCategory = (cat: string) => {
    const categories = filter.categories.includes(cat)
      ? filter.categories.filter(c => c !== cat)
      : [...filter.categories, cat];
    onFilterChange({ ...filter, categories });
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw = newKeyword.trim().toLowerCase();
    if (!filter.keywords.includes(kw)) {
      onFilterChange({ ...filter, keywords: [...filter.keywords, kw] });
    }
    setNewKeyword('');
  };

  return (
    <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', padding: '1.5rem' }}>
      <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.4rem' }}>
        // ALERT FILTER MATRIX
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Preferences &amp; Routing</h3>

      <div style={{ marginBottom: '1.25rem' }}>
        <div className="mono-label" style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}>CATEGORIES</div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {allCategories.map(cat => {
            const active = filter.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="mono-label"
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '2px',
                  border: active ? '1px solid var(--accent-coral)' : '1px solid var(--border-hairline)',
                  background: active ? 'rgba(231, 96, 63, 0.15)' : 'transparent',
                  color: active ? 'var(--accent-coral)' : 'var(--text-muted)',
                }}
              >
                {cat.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div className="mono-label" style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}>KEYWORDS</div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <input
            type="text"
            placeholder="e.g. solana, rust, python"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addKeyword()}
            className="mono-label"
            style={{ flex: 1, padding: '0.45rem 0.65rem', background: '#171915', border: '1px solid var(--border-hairline)', color: 'var(--text-light)', fontSize: '0.75rem' }}
          />
          <button onClick={addKeyword} className="mono-label" style={{ padding: '0.45rem 0.75rem', background: 'transparent', border: '1px solid var(--border-hairline)', color: 'var(--text-light)', fontSize: '0.7rem' }}>
            ADD
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {filter.keywords.map(kw => (
            <span key={kw} className="mono-label" style={{ background: 'rgba(231, 96, 63, 0.1)', color: 'var(--accent-coral)', padding: '0.15rem 0.45rem', border: '1px solid rgba(231, 96, 63, 0.25)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              #{kw} <button onClick={() => onFilterChange({ ...filter, keywords: filter.keywords.filter(k => k !== kw) })} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer' }}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="mono-label" style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}>MIN REWARD ($ USD)</div>
        <input
          type="number"
          value={filter.min_prize}
          onChange={e => onFilterChange({ ...filter, min_prize: Number(e.target.value) })}
          className="mono-label"
          style={{ width: '100%', padding: '0.45rem 0.65rem', background: '#171915', border: '1px solid var(--border-hairline)', color: 'var(--text-light)', fontSize: '0.75rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={onSave}
          disabled={saving}
          className="mono-label"
          style={{ flex: 1, padding: '0.65rem', background: savedSuccess ? '#10b981' : 'var(--accent-coral)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          {savedSuccess && <Check size={14} />}
          {saving ? 'SYNCING...' : savedSuccess ? 'PREFERENCES SAVED' : 'SAVE PREFERENCES'}
        </button>

        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label"
          style={{ padding: '0.65rem 0.85rem', border: '1px solid var(--border-hairline)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
        >
          <Send size={12} color="var(--accent-coral)" />
          OPEN BOT <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
