'use client';

import { ExternalLink, Clock } from 'lucide-react';

interface CardProps {
  item: {
    id: string;
    title: string;
    source: string;
    category: string;
    reward: string;
    deadline?: string | null;
    link: string;
    tags: string[];
    first_seen: string;
  };
  index: number;
}

export function OpportunityCard({ item, index }: CardProps) {
  let isUrgent = false;
  let deadlineLabel = 'FLEXIBLE';
  if (item.deadline) {
    const diffHours = (new Date(item.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 48) {
      isUrgent = true;
      deadlineLabel = `<${Math.round(diffHours)}H LEFT`;
    } else if (diffHours > 0) {
      deadlineLabel = new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    } else {
      deadlineLabel = 'CLOSED';
    }
  }

  const paddedIndex = String(index + 1).padStart(2, '0');
  const cleanReward = item.reward ? item.reward.replace(/<[^>]*>/g, '').trim() : 'Prize pool undisclosed';
  const displayReward = (item as any).reward_num && (cleanReward.includes('$') || cleanReward === String((item as any).reward_num))
    ? `$${(item as any).reward_num.toLocaleString()}`
    : cleanReward;

  return (
    <div className="grid-card">
      <div>
        {/* 1. Top row: number in coral mono top-left, source in muted gray mono top-right, same baseline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--accent-coral)', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
            {paddedIndex}
          </span>
          <span style={{ color: '#6e6b62', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {item.source.replace('_', ' ')}
          </span>
        </div>

        {/* 2. Large empty vertical gap (roughly 80-120px breathing room) */}
        <div style={{ height: '96px' }} />

        {/* 3. Category badge ("BOUNTY") - small, muted, not heavily colored/boxed, reads as label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
          <span style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: '#6e6b62',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            {item.category}
          </span>
          {isUrgent && (
            <span style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: '0.62rem',
              color: '#8a8578',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              <Clock size={10} />
              {deadlineLabel}
            </span>
          )}
        </div>

        {/* 4. Title - bold Manrope, large (text-2xl to text-3xl), full opacity white/cream */}
        <h3 style={{
          fontSize: '1.65rem',
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          marginBottom: '1.25rem',
          color: 'var(--text-light)',
          fontFamily: 'var(--font-manrope)',
        }}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {item.title}
          </a>
        </h3>

        {/* 5. Tags row - small IBM Plex Mono, uppercase, muted gray (#6e6b62), NOT coral */}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.75rem' }}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: '0.65rem',
                  color: '#6e6b62',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 6. Thin hairline divider line & 7. Reward + Apply button row at the bottom */}
      <div style={{
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '1rem',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            color: '#6e6b62',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.2rem',
          }}>
            REWARD
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)', fontFamily: 'var(--font-manrope)' }}>
            {displayReward}
          </div>
        </div>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            color: 'var(--text-light)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          APPLY <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
