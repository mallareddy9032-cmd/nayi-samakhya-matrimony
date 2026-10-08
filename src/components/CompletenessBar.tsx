'use client';

import Link from 'next/link';
import type { ProfileCompleteness } from '../lib/completeness.ts';
import { Bi } from '../app/onboarding/Wizard.tsx';

export function CompletenessBar({ completeness, freeViewsLeft = 10 }: { completeness: ProfileCompleteness; freeViewsLeft?: number }) {
  const { percentage, missingItems, canAccessProfiles } = completeness;

  return (
    <div 
      className="card" 
      style={{ 
        padding: '1.6rem', 
        marginBottom: '2rem', 
        borderRadius: '20px', 
        background: '#FFFFFF', 
        border: '1.5px solid var(--gold-border, #E2D9CC)', 
        boxShadow: '0 8px 24px rgba(139, 29, 44, 0.06)' 
      }}
    >
      {/* Header with Title and Tier Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.3rem' }}>⭐</span>
            <strong style={{ fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>
              <Bi en="Candidate Profile Strength" te="మీ ప్రొఫైల్ సంపూర్ణత స్థాయి" />:
            </strong>
            <span style={{ color: percentage >= 50 ? '#059669' : '#DC2626', fontWeight: 900, fontSize: '1.35rem' }}>
              {percentage}%
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
            {percentage < 50 ? (
              <Bi en="Complete 50% & 2 photos to unlock candidate biodatas & horoscopes" te="సంబంధాల పూర్తి వివరాలు చూడటానికి కనీసం 50% ప్రొఫైల్ మరియు 2 ఫోటోలు నమోదు చేయండి" />
            ) : (
              <Bi en="Full candidate details & horoscopes unlocked" te="ధృవీకరించబడింది: సంబంధాల జాతకాలు మరియు పూర్తి వివరాలు అందుబాటులో ఉన్నాయి" />
            )}
          </p>
        </div>

        {/* Free Views Remaining Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF3C7', padding: '0.45rem 1rem', borderRadius: '999px', border: '1px solid #FDE68A' }}>
          <span style={{ fontSize: '1.1rem' }}>🎟️</span>
          <span style={{ fontSize: '0.9rem', color: '#92400E', fontWeight: 800 }}>
            <Bi en="Free Profile Views:" te="ఉచిత వీక్షణలు:" /> {freeViewsLeft} / 10
          </span>
        </div>
      </div>

      {/* 4-Stage Milestone Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
        {/* Step 1: 0-25% Bronze */}
        <div style={{ padding: '0.5rem 0.2rem', borderRadius: '10px', background: percentage >= 25 ? '#FFFBEB' : '#F8FAFC', border: percentage >= 25 ? '1.5px solid #FDE68A' : '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '1.2rem', display: 'block' }}>🥉</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: percentage >= 25 ? '#92400E' : '#94A3B8' }}>25% Bronze</span>
        </div>

        {/* Step 2: 50% Silver (Access Unlock) */}
        <div style={{ padding: '0.5rem 0.2rem', borderRadius: '10px', background: percentage >= 50 ? '#ECFDF5' : '#FEF2F2', border: percentage >= 50 ? '2px solid #059669' : '1.5px dashed #EF4444', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem', display: 'block' }}>{percentage >= 50 ? '🔓' : '🔒'}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: percentage >= 50 ? '#065F46' : '#DC2626' }}>50% Unlocked</span>
        </div>

        {/* Step 3: 75% Gold */}
        <div style={{ padding: '0.5rem 0.2rem', borderRadius: '10px', background: percentage >= 75 ? '#FEF3C7' : '#F8FAFC', border: percentage >= 75 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '1.2rem', display: 'block' }}>🥇</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: percentage >= 75 ? '#B45309' : '#94A3B8' }}>75% Gold</span>
        </div>

        {/* Step 4: 100% Platinum Star */}
        <div style={{ padding: '0.5rem 0.2rem', borderRadius: '10px', background: percentage >= 100 ? '#EFF6FF' : '#F8FAFC', border: percentage >= 100 ? '2px solid #2563EB' : '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '1.2rem', display: 'block' }}>💎</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: percentage >= 100 ? '#1D4ED8' : '#94A3B8' }}>100% Star</span>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ width: '100%', height: '14px', background: '#F1E9DF', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-light)', position: 'relative', marginBottom: '1rem' }}>
        <div 
          style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            background: percentage >= 90 
              ? 'linear-gradient(90deg, #D4AF37, #8B1D2C)' 
              : percentage >= 50 
                ? 'linear-gradient(90deg, #10B981, #059669)' 
                : 'linear-gradient(90deg, #EF4444, #F97316)',
            transition: 'width 0.6s ease',
            borderRadius: '999px'
          }} 
        />
        {/* 50% Threshold Marker */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(0,0,0,0.3)' }} title="50% Unlock Threshold" />
      </div>

      {/* Interactive Quick Action Chips */}
      {missingItems.length > 0 && percentage < 100 && (
        <div style={{ background: '#FFFDF9', padding: '0.9rem', borderRadius: '12px', border: '1px dashed #E2D0B5', marginTop: '0.8rem' }}>
          <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--maroon)', marginBottom: '0.5rem' }}>
            <Bi en="Quick Action: Add missing items to increase match visibility:" te="త్వరిత చర్య: మీ ప్రొఫైల్ బలాన్ని పెంచడానికి ఈ వివరాలు జతచేయండి:" />
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {missingItems.slice(0, 3).map((item, idx) => (
              <Link 
                key={idx} 
                href="/onboarding" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  padding: '0.35rem 0.75rem', 
                  background: '#FFFFFF', 
                  borderRadius: '999px', 
                  border: '1.5px solid #CBD5E1', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  color: '#334155', 
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <span>+</span> <Bi {...item} />
              </Link>
            ))}
            <Link 
              href="/onboarding" 
              className="btn link-btn" 
              style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem', borderRadius: '999px' }}
            >
              <Bi en="Complete 100% Profile →" te="100% పూర్తి చేయండి →" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
