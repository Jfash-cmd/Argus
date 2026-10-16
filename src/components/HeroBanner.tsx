'use client';

import { RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onSync: () => void;
  refreshing: boolean;
  totalCount: number;
}

export function HeroBanner({ onSync, refreshing, totalCount }: HeroBannerProps) {
  return (
    <div style={{ paddingTop: '2rem', marginBottom: '2.5rem' }}>
      {/* Top Meta Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
            padding: '0.5rem 1rem',
            minHeight: '44px',
            borderRadius: '4px',
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'REFRESHING...' : 'RUN SCRAPERS NOW'}
        </button>
      </div>

      {/* Main Heading: Responsive font sizing clamp(1.75rem, 5.5vw, 3rem) */}
      <h1 className="hero-heading">
        DISCOVER HIGH-YIELD OPPORTUNITIES
      </h1>

      {/* Subtitle Line: Responsive italic font sizing clamp(1.1rem, 3.5vw, 2rem) */}
      <div className="hero-subheading">
        curated intelligence for hackathons, bounties, freelance gigs, and grants
      </div>
    </div>
  );
}
