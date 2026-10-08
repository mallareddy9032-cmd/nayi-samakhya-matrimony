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
  metadataBase: new URL('https://nayisamakhya.org'),
  title: {
    default: 'నాయీ సమాఖ్య కల్యాణ వేదిక · Nayi Brahmin Matrimony',
    template: '%s · Nayi Samakhya Matrimony',
  },
  description: 'నాయీ బ్రాహ్మణ కుటుంబాల అధికారిక మరియు నమ్మకమైన వివాహ వేదిక. పవిత్ర సగోత్ర రక్షణ, చట్టబద్ధమైన గోప్యత, మరియు ఉచిత సభ్యత్వంతో తెలంగాణ & ఆంధ్రప్రదేశ్ వధూవరుల సంబంధాల అన్వేషణ.',
  keywords: [
    'Nayi Brahmin Matrimony',
    'నాయీ బ్రాహ్మణ వివాహ వేదిక',
    'Nayi Samakhya Matrimony',
    'Nayee Matrimony Telangana',
    'Andhra Pradesh Nayi Matrimony',
    'Nayi Brahmin Brides',
    'Nayi Brahmin Grooms',
    'తెలంగాణ నాయీ బ్రాహ్మణ సంబంధాలు',
    'నాయీ సమాఖ్య కల్యాణ వేదిక',
    'Sagothra Exclusion Matrimony',
    'Telugu Matrimony Nayi',
  ],
  alternates: {
    canonical: '/matrimony',
  },
  openGraph: {
    title: 'నాయీ సమాఖ్య కల్యాణ వేదిక · Nayi Brahmin Matrimony',
    description: 'తెలంగాణ మరియు ఆంధ్రప్రదేశ్ నాయీ బ్రాహ్మణుల అధికారిక కల్యాణ వేదిక. పవిత్ర సగోత్ర రక్షణ & ఉచిత సభ్యత్వ నమోదు.',
    url: 'https://nayisamakhya.org/matrimony',
    siteName: 'Nayi Samakhya Matrimony',
    locale: 'te_IN',
    alternateLocale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/matrimony/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'నాయీ సమాఖ్య కల్యాణ వేదిక · Nayi Brahmin Matrimony',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'నాయీ సమాఖ్య కల్యాణ వేదిక · Nayi Brahmin Matrimony',
    description: 'తెలంగాణ మరియు ఆంధ్రప్రదేశ్ నాయీ బ్రాహ్మణుల అధికారిక కల్యాణ వేదిక.',
    images: ['/matrimony/og-banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    google: 'notranslate',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { LanguageProvider } from '../context/LanguageContext.tsx';
import { MatrimonyBot } from '../components/MatrimonyBot.tsx';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="te" translate="no" data-lang="te" className={`notranslate ${display.variable} ${sans.variable}`}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="notranslate">
        <LanguageProvider>
          {children}
          <MatrimonyBot />
        </LanguageProvider>
      </body>
    </html>
  );
}
