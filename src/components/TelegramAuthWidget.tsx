'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Check, LogOut, Send } from 'lucide-react';

export function TelegramAuthWidget() {
  const [user, setUser] = useState<{ telegram_id: string; username?: string; first_name?: string; auth_token?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ArgusOpportunityBot';

  useEffect(() => {
    fetch('/api/user/filters')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {});

    (window as any).onTelegramAuth = async (tgUser: any) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgUser),
        });
        const json = await res.json();
        if (json.user) {
          setUser(json.user);
          window.location.reload();
        }
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  const handleDemoLogin = async () => {
    setLoading(true);
    await (window as any).onTelegramAuth({
      id: 987654321,
      first_name: 'Demo Hunter',
      username: 'argus_hunter',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'demo_session',
    });
  };

  const handleLogout = () => {
    document.cookie = 'argon_telegram_id=; path=/; max-age=0';
    setUser(null);
    window.location.reload();
  };

  if (user) {
    const deepLink = user.auth_token 
      ? `https://t.me/${botUsername}?start=${user.auth_token}`
      : `https://t.me/${botUsername}`;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Verify & start Telegram chat to receive real-time alerts"
          style={{
            background: 'var(--accent-coral)',
            color: '#fff',
            padding: '0.45rem 0.85rem',
            minHeight: '44px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <Send size={12} />
          {user.first_name || user.username || 'Linked'}
          <ExternalLink size={11} />
        </a>
        <button
          onClick={handleLogout}
          title="Disconnect"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-ink)',
            cursor: 'pointer',
            opacity: 0.6,
            minHeight: '44px',
            minWidth: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        onClick={handleDemoLogin}
        disabled={loading}
        style={{
          background: 'var(--text-ink)',
          color: '#fff',
          border: 'none',
          padding: '0.5rem 0.95rem',
          minHeight: '44px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Send size={13} />
        {loading ? 'CONNECTING...' : 'CONNECT TELEGRAM'}
      </button>
    </div>
  );
}
