import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import { Header } from '@/components/Header';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARGUS | Opportunity Alert Radar',
  description: 'Multi-user opportunity radar tracking hackathons, bounties, freelance gigs, and grants with instant Telegram alerts and WAT digests.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <body style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-light)', minHeight: '100vh' }}>
        <Header />
        <main>{children}</main>
        <footer style={{
          borderTop: '1px solid var(--border-hairline)',
          padding: '4rem 0 7rem',
          marginTop: '6rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div className="container">
            <div className="mono-label" style={{ color: 'var(--accent-coral)', marginBottom: '0.5rem' }}>
              ARGUS RADAR / MULTI-USER ENGINE
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              Monitoring 15+ verified developer, bounty, and grant sources 24/7.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
