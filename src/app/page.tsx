'use client';

import { useEffect, useState } from 'react';
import { OpportunityCard } from '@/components/OpportunityCard';
import { HeroBanner } from '@/components/HeroBanner';
import { SearchBar } from '@/components/SearchBar';
import { FloatingPillNav } from '@/components/FloatingPillNav';

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [minPrize, setMinPrize] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('category', activeTab);
      if (search) params.set('search', search);
      if (minPrize) params.set('minPrize', minPrize);
      if (urgentOnly) params.set('urgentOnly', 'true');

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchOpps(), 200);
    return () => clearTimeout(timer);
  }, [activeTab, search, minPrize, urgentOnly]);

  const handleManualScrape = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/cron/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape' }),
      });
      await fetchOpps();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '7rem' }}>
      <HeroBanner onSync={handleManualScrape} refreshing={refreshing} totalCount={opportunities.length} />

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        minPrize={minPrize}
        onMinPrizeChange={setMinPrize}
      />

      {loading ? (
        <div className="mono-label" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
          // SCANNING OPPORTUNITY FREQUENCIES...
        </div>
      ) : opportunities.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border-hairline)', background: 'var(--bg-card)' }}>
          <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.5rem' }}>// ZERO MATCHES DETECTED</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try clearing filters or click &apos;Run Scrapers Now&apos; to query all active sources.</p>
        </div>
      ) : (
        /* Numbered 4-column bordered grid cards matching kiddobuild.dev layout pattern */
        <div className="grid-4-col">
          {opportunities.map((item, index) => (
            <OpportunityCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}

      {/* Floating pill-shaped tab-switcher control, bottom-center */}
      <FloatingPillNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgentOnly={urgentOnly}
        onToggleUrgent={() => setUrgentOnly(!urgentOnly)}
      />
    </div>
  );
}
