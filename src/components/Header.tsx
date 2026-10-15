'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TelegramAuthWidget } from './TelegramAuthWidget';

export function Header() {
  const pathname = usePathname();

  return (
    <header style={{
      background: 'var(--bg-light-header)',
      color: 'var(--text-ink)',
      borderBottom: '1px solid var(--border-hairline-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.875rem 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* Two-line logo block: bold name + small coral subtitle underneath */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-ink)',
              lineHeight: 1.1,
            }}>
              ARGUS
            </span>
            <span className="mono-label" style={{ color: 'var(--accent-coral)', fontSize: '0.62rem' }}>
              OPPORTUNITY RADAR
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/" style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: pathname === '/' ? 700 : 500,
              color: 'var(--text-ink)',
              background: pathname === '/' ? 'rgba(25, 25, 21, 0.08)' : 'transparent',
            }}>
              Feed
            </Link>
            <Link href="/dashboard" style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: pathname === '/dashboard' ? 700 : 500,
              color: 'var(--text-ink)',
              background: pathname === '/dashboard' ? 'rgba(25, 25, 21, 0.08)' : 'transparent',
            }}>
              Dashboard
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="mono-label" style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-coral)' }} />
            RADAR ONLINE
          </div>
          <TelegramAuthWidget />
        </div>
      </div>
    </header>
  );
}
