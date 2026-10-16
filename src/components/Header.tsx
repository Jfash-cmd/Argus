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
      padding: '0.75rem 0',
    }}>
      <div className="container">
        <div className="header-inner">
          <div className="header-brand-group">
            {/* Two-line logo block */}
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

            <nav className="header-nav">
              <Link
                href="/"
                className="header-nav-link"
                style={{
                  fontWeight: pathname === '/' ? 700 : 500,
                  background: pathname === '/' ? 'rgba(25, 25, 21, 0.08)' : 'transparent',
                }}
              >
                Feed
              </Link>
              <Link
                href="/dashboard"
                className="header-nav-link"
                style={{
                  fontWeight: pathname === '/dashboard' ? 700 : 500,
                  background: pathname === '/dashboard' ? 'rgba(25, 25, 21, 0.08)' : 'transparent',
                }}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="header-actions">
            <div className="mono-label radar-status-badge">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-coral)' }} />
              RADAR ONLINE
            </div>
            <TelegramAuthWidget />
          </div>
        </div>
      </div>
    </header>
  );
}
