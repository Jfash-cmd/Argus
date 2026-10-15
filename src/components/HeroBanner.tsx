'use client';

import { RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onSync: () => void;
  refreshing: boolean;
  totalCount: number;
}

export function HeroBanner({ onSync, refreshing, totalCount }: HeroBannerProps) {
  return (
    <div style={{ paddingTop: '3.5rem', marginBottom: '5rem' }}>
      {/* Top Meta Line with Status and Scraper Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="mono-label" style={{ color: 'var(--accent-coral)', fontSize: '0.75rem', letterSpacing: '0.14em' }}>
          // REAL-TIME OPPORTUNITY STREAM &bull; {totalCount} INDEXED
        </div>

        <button
          onClick={onSync}
          disabled={refreshing}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-light)',
            padding: '0.55rem 1.15rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: '0.72rem',
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

      {/* Large Editorial Display Heading (72-96px range) */}
      <h1
        className="heading-main"
        style={{
          fontSize: 'clamp(4rem, 6.5vw, 5.75rem)',
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          maxWidth: '1200px',
          fontWeight: 800,
        }}
      >
        DISCOVER HIGH-YIELD OPPORTUNITIES
      </h1>

      {/* Proportional Large Italic Subtitle (56-64px range, 60-70% size of heading) */}
      <div
        className="heading-accent"
        style={{
          fontSize: 'clamp(2.75rem, 4.2vw, 3.85rem)',
          lineHeight: 1.15,
          marginTop: '0.75rem',
          maxWidth: '1150px',
        }}
      >
        curated intelligence for hackathons, bounties, freelance gigs, and grants
      </div>
    </div>
  );
}
