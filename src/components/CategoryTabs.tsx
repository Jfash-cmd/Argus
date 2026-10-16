'use client';

import { Trophy, Code2, Briefcase, Award, Layers } from 'lucide-react';

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: Record<string, number>;
}

export function CategoryTabs({ activeTab, onTabChange, counts }: CategoryTabsProps) {
  const tabs = [
    { id: 'all', label: 'All Opportunities', icon: Layers },
    { id: 'web3_hackathon', label: 'Web3 Hackathons', icon: Trophy },
    { id: 'web2_hackathon', label: 'Web2 Hackathons', icon: Trophy },
    { id: 'bounty', label: 'Bounties', icon: Code2 },
    { id: 'freelance', label: 'Freelance & Gigs', icon: Briefcase },
    { id: 'grant', label: 'Grants', icon: Award },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'none',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '1.5rem',
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? '1px solid var(--accent-indigo)' : '1px solid transparent',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
          >
            <Icon size={16} color={isActive ? '#818cf8' : '#94a3b8'} />
            <span>{tab.label}</span>
            {count !== undefined && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#c7d2fe' : 'var(--text-muted)',
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
