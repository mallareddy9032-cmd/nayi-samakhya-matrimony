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
    <header className="commencement" style={{ textAlign: 'center', margin: '1rem 0 2rem' }}>
      <svg viewBox="0 0 560 150" role="img" aria-labelledby="commencement-title" style={{ maxWidth: '420px', height: 'auto', margin: '0 auto' }}>
        <title id="commencement-title">Trishikha Deepam, a three-flamed lamp, flanked by two Nadaswarams</title>
        <defs>
          <radialGradient id="deepam-glow">
            <stop offset="0" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <g id="nadaswaram">
            <path d="M-22 -3 L-14 -1.2 L-14 1.2 L-22 3 Z" fill="#991B1B" />
            <rect x="-14" y="-1.2" width="14" height="2.4" fill="#D97706" />
            <rect x="0" y="-4" width="8" height="8" rx="1.5" fill="#D97706" />
            <path d="M8 -3.5 L150 -6.5 L150 6.5 L8 3.5 Z" fill="#78350F" stroke="#D97706" strokeWidth="0.8" />
            <rect x="28" y="-4.3" width="3" height="8.6" fill="#D97706" />
            {[44, 59, 74, 89, 104, 119, 134].map((x) => (
              <circle key={x} cx={x} cy="0" r="1.6" fill="#FFFFFF" />
            ))}
            <rect x="144" y="-6.8" width="5" height="13.6" fill="#D97706" />
            <path d="M150 -6.5 C168 -8 180 -16 192 -24 L192 24 C180 16 168 8 150 6.5 Z" fill="#D97706" stroke="#B45309" strokeWidth="1" />
            <ellipse cx="192" cy="0" rx="3" ry="24" fill="#B45309" />
          </g>
        </defs>

        <path d="M60 20 Q280 -8 500 20" fill="none" stroke="#D97706" strokeWidth="2" />
        {LEAVES.map(([x, y], i) => (
          <path key={x} d="M0 0 C-4 6 -3 12 0 16 C3 12 4 6 0 0 Z" transform={`translate(${x} ${y})`} fill={i % 2 ? '#15803D' : '#16A34A'} />
        ))}

        <use href="#nadaswaram" transform="translate(222 60) rotate(164)" />
        <use href="#nadaswaram" transform="translate(338 60) rotate(16)" />

        <circle className="lamp-glow" cx="280" cy="66" r="46" fill="url(#deepam-glow)" />
        <g transform="translate(258 82) rotate(-12) scale(0.75)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <g transform="translate(280 82)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <g transform="translate(302 82) rotate(12) scale(0.75)">
          <path d={FLAME_OUTER} fill="#EA580C" />
          <path d={FLAME_INNER} fill="#FEF08A" />
        </g>
        <path d="M244 84 Q280 110 316 84 Z" fill="#B45309" />
        <ellipse cx="280" cy="84" rx="36" ry="4.5" fill="#D97706" />
        <rect x="275" y="96" width="10" height="32" fill="#B45309" />
        <ellipse cx="280" cy="104" rx="9" ry="3.5" fill="#D97706" />
        <ellipse cx="280" cy="118" rx="12" ry="4" fill="#D97706" />
        <path d="M262 126 L298 126 L310 137 L250 137 Z" fill="#B45309" />
        <ellipse cx="280" cy="139" rx="38" ry="5" fill="#D97706" />
      </svg>
      <h1 style={{ color: 'var(--maroon)', margin: '0.5rem 0 0.3rem', fontSize: '2.1rem', fontWeight: 800 }}>
        <Bi en="Nayi Samakhya Matrimonial Portal" te="నాయీ సమాఖ్య కల్యాణ వేదిక" />
      </h1>
      <p style={{ margin: 0, color: '#B45309', fontWeight: 600, fontSize: '1rem' }}>
        <Bi 
          en="Official Community Matrimonial Initiative · 33 Districts of Telangana" 
          te="పవిత్ర సగోత్ర రక్షణ · తెలంగాణ 33 జిల్లాల అధికారిక వేదిక" 
        />
      </p>
    </header>
  );
}
