import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans_Telugu } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// Per-request CSP nonces only work on dynamically rendered pages.
export const dynamic = 'force-dynamic';

// next/font self-hosts at build time: no runtime request to a font CDN (CSP font-src 'self').
const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display', display: 'swap' });
const sans = Noto_Sans_Telugu({ subsets: ['telugu', 'latin'], weight: ['400', '600'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Nayi Samakhya Matrimony · నాయీ సమాఖ్య కల్యాణ వేదిక',
  description: 'Official matrimonial platform for Telangana Nayi-Brahmin community across 33 districts.',
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { LanguageProvider } from '../context/LanguageContext.tsx';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="te" data-lang="te" className={`${display.variable} ${sans.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
