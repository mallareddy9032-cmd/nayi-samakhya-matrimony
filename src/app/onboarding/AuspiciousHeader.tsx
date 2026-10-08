'use client';

import { Bi } from './Wizard.tsx';

const LEAVES: [number, number][] = [
  [104, 15], [148, 11], [192, 8.2], [236, 6.6], [280, 6], [324, 6.6], [368, 8.2], [412, 11], [456, 15],
];
const FLAME_OUTER = 'M0 0 C-7 -6 -7 -16 0 -30 C7 -16 7 -6 0 0 Z';
const FLAME_INNER = 'M0 -2 C-3.5 -6 -3.5 -12 0 -20 C3.5 -12 3.5 -6 0 -2 Z';

/** Trishikha Deepam flanked by two Nadaswarams under a mango-leaf thoranam. */
export function AuspiciousHeader() {
  return (
    <header className="commencement" style={{ textAlign: 'center', margin: '0.6rem 0 1.4rem' }}>
      {/* Auspicious Invocation Header */}
      <div 
        style={{ 
          fontSize: '0.85rem', 
          fontWeight: 800, 
          letterSpacing: '3px', 
          color: '#B45309', 
          marginBottom: '0.35rem',
          textTransform: 'uppercase'
        }}
      >
        ॥ శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు ॥
      </div>

      {/* Compact Royal Temple Emblem */}
      <svg 
        viewBox="0 0 560 85" 
        role="img" 
        aria-labelledby="commencement-title" 
        style={{ maxWidth: '340px', height: 'auto', margin: '0 auto', display: 'block' }}
      >
        <title id="commencement-title">Trishikha Deepam, flanked by two Nadaswarams</title>
        <defs>
          <radialGradient id="deepam-glow">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <g id="nadaswaram-compact">
            <path d="M-14 -2 L-9 -0.8 L-9 0.8 L-14 2 Z" fill="#991B1B" />
            <rect x="-9" y="-0.8" width="9" height="1.6" fill="#D97706" />
            <rect x="0" y="-2.5" width="5" height="5" rx="1" fill="#D97706" />
            <path d="M5 -2.2 L100 -4.2 L100 4.2 L5 2.2 Z" fill="#78350F" stroke="#D97706" strokeWidth="0.6" />
            {[25, 36, 47, 58, 69, 80, 91].map((x) => (
              <circle key={x} cx={x} cy="0" r="1.1" fill="#FFFFFF" />
            ))}
            <rect x="96" y="-4.5" width="3.5" height="9" fill="#D97706" />
            <path d="M100 -4.2 C112 -5.5 120 -11 128 -16 L128 16 C120 11 112 5.5 100 4.2 Z" fill="#D97706" stroke="#B45309" strokeWidth="0.8" />
            <ellipse cx="128" cy="0" rx="2" ry="16" fill="#B45309" />
          </g>
        </defs>

        {/* Mango Leaf Arch */}
        <path d="M110 16 Q280 -2 450 16" fill="none" stroke="#D97706" strokeWidth="1.5" />
        {[135, 175, 215, 255, 280, 305, 345, 385, 425].map((x, i) => (
          <path key={x} d="M0 0 C-3 4 -2 8 0 11 C2 8 3 4 0 0 Z" transform={`translate(${x} ${10 + Math.abs(x - 280) * 0.04})`} fill={i % 2 ? '#15803D' : '#16A34A'} />
        ))}

        {/* Twin Nadaswarams */}
        <use href="#nadaswaram-compact" transform="translate(235 44) rotate(165) scale(0.85)" />
        <use href="#nadaswaram-compact" transform="translate(325 44) rotate(15) scale(0.85)" />

        {/* Trishikha Deepam (Center) */}
        <circle cx="280" cy="46" r="32" fill="url(#deepam-glow)" />
        <g transform="translate(266 54) rotate(-12) scale(0.55)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <g transform="translate(280 54) scale(0.65)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <g transform="translate(294 54) rotate(12) scale(0.55)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <path d="M256 56 Q280 73 304 56 Z" fill="#B45309" />
        <ellipse cx="280" cy="56" rx="24" ry="3" fill="#D97706" />
        <rect x="277" y="64" width="6" height="15" fill="#B45309" />
        <ellipse cx="280" cy="78" rx="22" ry="3.5" fill="#D97706" />
      </svg>

      <h1 style={{ color: 'var(--maroon)', margin: '0.35rem 0 0.2rem', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.3px' }}>
        <Bi en="Nayi Samakhya Matrimonial Portal" te="నాయీ సమాఖ్య కల్యాణ వేదిక" />
      </h1>
      <p style={{ margin: 0, color: '#B45309', fontWeight: 600, fontSize: '0.92rem' }}>
        <Bi 
          en="Official Community Matrimonial Initiative · 33 Districts of Telangana" 
          te="పవిత్ర సగోత్ర రక్షణ · తెలంగాణ 33 జిల్లాల అధికారిక వేదిక" 
        />
      </p>
    </header>
  );
}
