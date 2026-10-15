'use client';

import { RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onSync: () => void;
  refreshing: boolean;
  totalCount: number;
}

export function HeroBanner({ onSync, refreshing, totalCount }: HeroBannerProps) {
  return (
    <div style={{ marginBottom: '3rem', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.4rem' }}>
            // REAL-TIME OPPORTUNITY STREAM &bull; {totalCount} INDEXED
          </div>
          <h1 className="heading-main" style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>
            DISCOVER HIGH-YIELD OPPORTUNITIES
          </h1>
          <div className="heading-accent" style={{ marginTop: '0.25rem' }}>
            curated intelligence for hackathons, bounties, freelance gigs, and grants
          </div>
        </div>

        <button
          onClick={onSync}
          disabled={refreshing}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-light)',
            padding: '0.6rem 1.25rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'REFRESHING SOURCES...' : 'RUN SCRAPERS NOW'}
        </button>
      </div>
    </div>
  );
}
