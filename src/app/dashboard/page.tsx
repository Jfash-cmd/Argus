'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { OpportunityCard } from '@/components/OpportunityCard';
import { FilterForm } from '@/components/FilterForm';
import { Phase2Stubs } from '@/components/Phase2Stubs';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<{ keywords: string[]; categories: string[]; min_prize: number }>({
    keywords: [],
    categories: [],
    min_prize: 0,
  });
  const [matchedOpps, setMatchedOpps] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testDigestStatus, setTestDigestStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/filters')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          setFilter(data.filter);
        }
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams();
    if (filter.min_prize > 0) params.set('minPrize', String(filter.min_prize));
    if (filter.keywords.length > 0) params.set('search', filter.keywords[0]);

    fetch(`/api/opportunities?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        let opps = data.opportunities || [];
        if (filter.categories.length > 0) {
          opps = opps.filter((o: any) => filter.categories.includes(o.category));
        }
        setMatchedOpps(opps);
      });
  }, [user, filter]);

  const handleSaveFilter = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleTestDigest = async () => {
    setTestDigestStatus('DISPATCHING...');
    try {
      const res = await fetch('/api/cron/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'digest' }),
      });
      const json = await res.json();
      setTestDigestStatus(`SENT (${json.sentUsers || 0} USERS)`);
    } catch {
      setTestDigestStatus('FAILED');
    }
    setTimeout(() => setTestDigestStatus(null), 3000);
  };

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '3rem 2rem', border: '1px solid var(--border-hairline)', background: 'var(--bg-card)' }}>
          <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.5rem' }}>// AUTHENTICATION REQUIRED</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Connect Your Telegram</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Click &quot;Connect Telegram&quot; in the header bar to link your account and set personalized alert filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.35rem' }}>
            // TELEGRAM ID: {user.telegram_id} &bull; CHAT: {user.chat_id || 'PENDING /START'}
          </div>
          <h1 className="dashboard-heading">
            FILTER RULES &amp; ROUTING
          </h1>
          <div className="heading-accent" style={{ marginTop: '0.2rem', fontSize: 'clamp(1.1rem, 3vw, 1.45rem)' }}>
            customized alert stream synced with your personal telegram bot
          </div>
        </div>

        <button
          onClick={handleTestDigest}
          className="mono-label"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-light)',
            padding: '0.6rem 1rem',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            cursor: 'pointer',
          }}
        >
          <Send size={13} color="var(--accent-coral)" />
          {testDigestStatus || 'TRIGGER TEST DIGEST (WAT)'}
        </button>
      </div>

      <div className="dashboard-grid-2col" style={{ marginBottom: '3.5rem' }}>
        <FilterForm filter={filter} onFilterChange={setFilter} onSave={handleSaveFilter} saving={saving} savedSuccess={savedSuccess} user={user} />
        <Phase2Stubs />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.25rem' }}>
          // MATCHED INVENTORY &bull; {matchedOpps.length} LISTINGS
        </div>
        <h2 className="heading-main" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)' }}>OPPORTUNITIES MATCHING YOUR ACTIVE FILTERS</h2>
      </div>

      <div className="grid-4-col">
        {matchedOpps.map((item, index) => (
          <OpportunityCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
