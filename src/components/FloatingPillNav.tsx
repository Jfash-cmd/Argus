'use client';

interface FloatingPillNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  urgentOnly: boolean;
  onToggleUrgent: () => void;
}

export function FloatingPillNav({
  activeTab,
  onTabChange,
  urgentOnly,
  onToggleUrgent,
}: FloatingPillNavProps) {
  const tabs = [
    { id: 'all', label: 'ALL' },
    { id: 'hackathon', label: 'HACKATHONS' },
    { id: 'bounty', label: 'BOUNTIES' },
    { id: 'freelance', label: 'FREELANCE' },
    { id: 'grant', label: 'GRANTS' },
  ];

  return (
    <div className="floating-pill-nav">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pill-button ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        );
      })}

      <button
        onClick={onToggleUrgent}
        className="pill-button"
        style={{
          borderLeft: '1px solid var(--border-hairline)',
          color: urgentOnly ? '#fff' : 'var(--accent-coral)',
          background: urgentOnly ? 'var(--accent-coral)' : 'transparent',
        }}
      >
        {urgentOnly ? 'URGENT: ON (<48H)' : 'URGENT ONLY'}
      </button>
    </div>
  );
}
