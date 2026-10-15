'use client';

import { RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onSync: () => void;
  refreshing: boolean;
  totalCount: number;
}

export function HeroBanner({ onSync, refreshing, totalCount }: HeroBannerProps) {
  return (
    <div style={{ paddingTop: '2.5rem', marginBottom: '3rem' }}>
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

      {/* Main Heading: Exact 48px (text-5xl), font-weight 700, line-height 1.1 */}
      <h1
        className="heading-main"
        style={{
          fontSize: '48px',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          fontWeight: 700,
          maxWidth: '1000px',
        }}
      >
        DISCOVER HIGH-YIELD OPPORTUNITIES
      </h1>

      {/* Subtitle Line: Exact 32px (text-3xl), italic, Instrument Serif, line-height 1.1, gap 8px */}
      <div
        className="heading-accent"
        style={{
          fontSize: '32px',
          lineHeight: 1.1,
          marginTop: '8px',
          maxWidth: '1000px',
          fontFamily: 'var(--font-instrument-serif), Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        curated intelligence for hackathons, bounties, freelance gigs, and grants
      </div>
    </div>
  );
}
