import React from 'react';
import Link from 'next/link';

export interface KalyanaDeepamAnchorProps {
  districtSlug?: string;
  districtNameEn?: string;
  districtNameTe?: string;
  verifiedCount?: number;
  className?: string;
}

/**
 * KalyanaDeepamAnchor: Embeddable navigation widget for parent district/mandal portals
 * (e.g. nayisamakhya.org/suryapet, nayisamakhya.org/kodad).
 * Honors the sacred Jnana Deepam & Mangala Nadaswaram motif with a live verified profile count.
 */
export function KalyanaDeepamAnchor({
  districtSlug,
  districtNameEn = 'Telangana',
  districtNameTe = 'తెలంగాణ',
  verifiedCount = 108,
  className = '',
}: KalyanaDeepamAnchorProps) {
  const targetHref = districtSlug
    ? `/matrimony/discover?district=${encodeURIComponent(districtSlug)}`
    : '/matrimony/discover';

  return (
    <aside
      className={`kalyana-deepam-anchor ${className}`}
      aria-label="Nayi Samakhya Matrimony District Portal"
      style={{
        background: 'linear-gradient(135deg, #0b172d 0%, #17294b 100%)',
        border: '1.5px solid #d69e2e',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        color: '#fdf8ec',
        boxShadow: '0 8px 24px rgba(11, 23, 45, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Sacred Trishikha Deepam Icon */}
        <div style={{ flexShrink: 0 }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 80 80"
            role="img"
            aria-label="Trishikha Deepam Motif"
          >
            <circle cx="40" cy="40" r="38" fill="#12223f" stroke="#d69e2e" strokeWidth="1.5" />
            {/* Flames */}
            <path d="M40 18 C37 26 35 32 40 40 C45 32 43 26 40 18 Z" fill="#f6ad55" />
            <path d="M40 22 C38 27 37 31 40 37 C43 31 42 27 40 22 Z" fill="#fdf8ec" />
            <path d="M30 26 C28 32 27 36 31 41 C34 36 33 32 30 26 Z" fill="#f6ad55" />
            <path d="M50 26 C48 32 47 36 51 41 C54 36 53 32 50 26 Z" fill="#f6ad55" />
            {/* Lamp base */}
            <path d="M26 42 Q40 54 54 42 Z" fill="#d69e2e" />
            <ellipse cx="40" cy="42" rx="14" ry="2.5" fill="#ecc94b" />
            <rect x="38" y="44" width="4" height="14" fill="#d69e2e" />
            <ellipse cx="40" cy="58" rx="16" ry="3" fill="#ecc94b" />
          </svg>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', color: '#ecc94b', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            కళ్యాణ దీపం · Kalyana Deepam Anchor
          </div>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.2rem', color: '#ffffff', fontWeight: 700 }}>
            {districtNameEn} <span lang="te" style={{ color: '#d69e2e', fontSize: '1.05rem', fontWeight: 500 }}>· {districtNameTe}</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#c3c9d6' }}>
            <strong style={{ color: '#ecc94b' }}>{verifiedCount}+</strong> Verified community profiles in this lineage jurisdiction
          </p>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Link
          href={targetHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(180deg, #ecc94b 0%, #d69e2e 100%)',
            color: '#0b172d',
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(214, 158, 46, 0.3)',
          }}
        >
          <span>Explore Matches</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}

export default KalyanaDeepamAnchor;
