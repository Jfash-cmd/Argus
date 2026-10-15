'use client';

import { ExternalLink, Clock, Tag } from 'lucide-react';

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
        {/* Top line: Number top-left in mono/coral, source top-right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="mono-label" style={{ color: 'var(--accent-coral)', fontSize: '0.85rem' }}>
            {paddedIndex}
          </span>
          <span className="mono-label" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
            {item.source.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="mono-label" style={{
            fontSize: '0.62rem',
            padding: '0.15rem 0.4rem',
            borderRadius: '2px',
            background: 'rgba(231, 96, 63, 0.1)',
            color: 'var(--accent-coral)',
            border: '1px solid rgba(231, 96, 63, 0.3)',
          }}>
            {item.category}
          </span>

          {isUrgent && (
            <span className="mono-label" style={{
              fontSize: '0.62rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '2px',
              background: 'rgba(231, 96, 63, 0.25)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              <Clock size={10} />
              {deadlineLabel}
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          lineHeight: 1.35,
          marginBottom: '0.75rem',
          color: 'var(--text-light)',
        }}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {item.title}
          </a>
        </h3>

        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '0.75rem',
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div className="mono-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>REWARD</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-light)', fontFamily: 'var(--font-manrope)' }}>
            {displayReward}
          </div>
        </div>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label"
          style={{
            color: 'var(--accent-coral)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.68rem',
          }}
        >
          APPLY <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
