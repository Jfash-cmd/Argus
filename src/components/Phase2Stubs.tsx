'use client';

export function Phase2Stubs() {
  const sources = [
    { name: 'Devpost, Superteam, GitHub, Reddit', status: 'Phase 1 Core (Active)' },
    { name: 'Medium (RSS Feeds)', status: 'Phase 2 Expanded (Active)' },
    { name: 'Substack (RSS Feeds)', status: 'Phase 2 Expanded (Active)' },
    { name: 'lablab.ai & HackQuest', status: 'Phase 2 Expanded (Active)' },
    { name: 'Kaggle, MLH, Devfolio', status: 'Phase 2 Expanded (Active)' },
    { name: 'HackerEarth, ETHGlobal, Unstop', status: 'Phase 2 Expanded (Active)' },
    { name: 'Taikai & Encode Club', status: 'Phase 2 Expanded (Active)' },
    { name: 'X / Discord via /addmanual <url>', status: 'Active Bot Ingestion' },
  ];

  return (
    <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--bg-card)', padding: '1.5rem' }}>
      <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.4rem' }}>
        // RADAR COVERAGE MATRIX
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Indexed Sources</h3>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        All scrapers normalize into the single unified opportunities schema.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sources.map((s, idx) => (
          <div key={idx} style={{ padding: '0.6rem 0.75rem', background: '#171915', border: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.name}</span>
            <span className="mono-label" style={{ fontSize: '0.62rem', color: s.status.includes('Active') ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
