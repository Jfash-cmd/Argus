'use client';

import { RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onSync: () => void;
  refreshing: boolean;
  totalCount: number;
}

export function HeroBanner({ onSync, refreshing, totalCount }: HeroBannerProps) {
  return (
    <div style={{ paddingTop: '2.5rem', marginBottom: '3.5rem' }}>
      {/* Top Meta Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="mono-label" style={{ color: 'var(--accent-coral)', fontSize: '0.72rem', letterSpacing: '0.12em' }}>
          // REAL-TIME OPPORTUNITY STREAM &bull; {totalCount} INDEXED
        </div>

        <button
          onClick={onSync}
          disabled={refreshing}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-light)',
            padding: '0.45rem 1rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'REFRESHING...' : 'RUN SCRAPERS NOW'}
        </button>
      </div>

      {/* Main Heading (64-72px scale, text-6xl to text-7xl matching 'One product brain.') */}
      <h1
        className="heading-main"
        style={{
          fontSize: 'clamp(3.75rem, 5vw, 4.5rem)',
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          fontWeight: 700,
          maxWidth: '1100px',
        }}
      >
        DISCOVER HIGH-YIELD OPPORTUNITIES
      </h1>

      {/* Subtitle Line matching 'Four delivery surfaces.', sitting directly underneath with tight line-height */}
      <div
        className="heading-accent"
        style={{
          fontSize: 'clamp(3.5rem, 4.75vw, 4.25rem)',
          lineHeight: 1.05,
          marginTop: '0.2rem',
          maxWidth: '1100px',
        }}
      >
        curated intelligence for hackathons, bounties, freelance gigs, and grants
      </div>
    </div>
  );
}
