'use client';

import Link from 'next/link';
import type { ProfileCompleteness } from '../lib/completeness.ts';
import { Bi } from '../app/onboarding/Wizard.tsx';

export function CompletenessBar({ completeness, freeViewsLeft = 10 }: { completeness: ProfileCompleteness; freeViewsLeft?: number }) {
  const { percentage, tierLabel, missingItems, canAccessProfiles } = completeness;

  return (
    <div className="card" style={{ padding: '1.4rem', marginBottom: '1.8rem', borderLeft: `5px solid ${percentage >= 50 ? 'var(--maroon)' : 'var(--danger)'}`, background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>
            <Bi en="Profile Completeness Status" te="ప్రొఫైల్ సంపూర్ణత స్థాయి" />:
          </strong>{' '}
          <span style={{ color: 'var(--maroon)', fontWeight: 800, fontSize: '1.2rem' }}>
            {percentage}%
          </span>{' '}
          <span className="badge" style={{ marginLeft: '0.5rem', fontSize: '0.82rem' }}>
            <Bi {...tierLabel} />
          </span>
        </div>

        <div style={{ fontSize: '0.92rem', color: 'var(--maroon)', fontWeight: 700, background: 'var(--maroon-light)', padding: '0.3rem 0.8rem', borderRadius: '999px', border: '1px solid var(--maroon-border)' }}>
          🎟️ <strong><Bi en="Free Profile Views:" te="ఉచిత వీక్షణలు:" /> {freeViewsLeft} / 10</strong>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ width: '100%', height: '14px', background: '#F1E9DF', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-light)', position: 'relative' }}>
        <div 
          style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            background: percentage >= 90 
              ? 'linear-gradient(90deg, #D4AF37, #8B1D2C)' 
              : percentage >= 50 
                ? 'linear-gradient(90deg, #D4AF37, #B8860B)' 
                : 'linear-gradient(90deg, #DC2626, #EA580C)',
            transition: 'width 0.6s ease',
            borderRadius: '999px'
          }} 
        />
        {/* 50% Threshold Marker */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(0,0,0,0.25)' }} title="50% Unlock Threshold" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {!canAccessProfiles ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--danger)' }}>
            ⚠️ <Bi 
              en="Minimum 50% & 2 mandatory photos required to unlock candidate details." 
              te="సంబంధాల వివరాలు చూడటానికి కనీసం 50% ప్రొఫైల్ మరియు 2 ఫోటోలు తప్పనిసరి." 
            />
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold-bright)' }}>
            ✓ <Bi 
              en="Verified access active: You can view candidate details & horoscopes." 
              te="ధృవీకరణ చురుగ్గా ఉంది: మీరు సంబంధాల పూర్తి వివరాలు మరియు జాతకాలు చూడవచ్చు." 
            />
          </p>
        )}

        <Link href="/onboarding" className="btn-ghost link-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
          <Bi en="Complete Details (+% to reach 100%) →" te="వివరాలు పూర్తి చేయండి (+%) →" />
        </Link>
      </div>

      {missingItems.length > 0 && percentage < 100 && (
        <details style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--amber)' }}>
            <Bi en="What is missing to reach 100%?" te="100% కావడానికి ఇంకా ఏమి వివరాలు కావాలి?" />
          </summary>
          <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.2rem' }}>
            {missingItems.map((item, idx) => (
              <li key={idx}><Bi {...item} /></li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
