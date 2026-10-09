'use client';

import React from 'react';
import Link from 'next/link';
import type { ProfileCompleteness } from '../lib/completeness.ts';
import { Bi } from '../app/onboarding/Wizard.tsx';

export function CompletenessBar({ completeness, freeViewsLeft = 10 }: { completeness: ProfileCompleteness; freeViewsLeft?: number }) {
  const { percentage, missingItems } = completeness;

  return (
    <div 
      style={{
        marginBottom: '2.5rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
        border: '1.5px solid #EADDC7',
        boxShadow: '0 10px 30px rgba(128, 20, 38, 0.06), 0 2px 8px rgba(212, 175, 55, 0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Golden Auspicious Top Accent */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #D4AF37 0%, #801426 50%, #D4AF37 100%)',
      }} />

      <div style={{ padding: '1.6rem 2rem' }}>
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.4rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.35rem' }}>🪔</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', fontWeight: 800 }}>
                <Bi en="Candidate Profile Strength" te="మీ ప్రొఫైల్ సంపూర్ణత స్థాయి" />
              </h3>
              <span style={{
                background: percentage >= 50 ? '#ECFDF5' : '#FEF2F2',
                color: percentage >= 50 ? '#047857' : '#B91C1C',
                border: `1.5px solid ${percentage >= 50 ? '#A7F3D0' : '#FECACA'}`,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: 900,
              }}>
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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            padding: '0.5rem 1.1rem',
            borderRadius: '999px',
            border: '1px solid #F59E0B',
            boxShadow: '0 2px 6px rgba(180, 83, 9, 0.15)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🎟️</span>
            <span style={{ fontSize: '0.88rem', color: '#801426', fontWeight: 800 }}>
              <Bi en="Free Profile Views:" te="ఉచిత వీక్షణలు:" /> <strong style={{ fontSize: '1rem', color: '#78350F' }}>{freeViewsLeft} / 10</strong>
            </span>
          </div>
        </div>

        {/* 4-Stage Kalyana Milestone Stepper */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.4rem',
        }}>
          {/* Stage 1 */}
          <div style={{
            padding: '0.85rem 0.6rem',
            borderRadius: '16px',
            background: percentage >= 25 ? '#FFFBEB' : '#F8FAFC',
            border: `1.5px solid ${percentage >= 25 ? '#F59E0B' : '#E2E8F0'}`,
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>🪔</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: percentage >= 25 ? '#B45309' : '#94A3B8' }}>25%</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: percentage >= 25 ? '#78350F' : '#64748B' }}>
              <Bi en="Prarambha" te="ప్రారంభం" />
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{
            padding: '0.85rem 0.6rem',
            borderRadius: '16px',
            background: percentage >= 50 ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${percentage >= 50 ? '#059669' : '#F87171'}`,
            textAlign: 'center',
            boxShadow: percentage >= 50 ? '0 4px 12px rgba(5, 150, 105, 0.12)' : 'none',
          }}>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>{percentage >= 50 ? '🔓' : '🔒'}</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: percentage >= 50 ? '#047857' : '#DC2626' }}>50%</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: percentage >= 50 ? '#065F46' : '#991B1B' }}>
              <Bi en="Matches Open" te="సంబంధాల వీక్షణ" />
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{
            padding: '0.85rem 0.6rem',
            borderRadius: '16px',
            background: percentage >= 75 ? '#FFFBEB' : '#F8FAFC',
            border: `1.5px solid ${percentage >= 75 ? '#D4AF37' : '#E2E8F0'}`,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>📜</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: percentage >= 75 ? '#B45309' : '#94A3B8' }}>75%</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: percentage >= 75 ? '#78350F' : '#64748B' }}>
              <Bi en="Full Biodata" te="సంపూర్ణ వివరాలు" />
            </div>
          </div>

          {/* Stage 4 */}
          <div style={{
            padding: '0.85rem 0.6rem',
            borderRadius: '16px',
            background: percentage >= 100 ? '#FFF1F3' : '#F8FAFC',
            border: `2px solid ${percentage >= 100 ? '#801426' : '#E2E8F0'}`,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>👑</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: percentage >= 100 ? '#801426' : '#94A3B8' }}>100%</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: percentage >= 100 ? '#801426' : '#64748B' }}>
              <Bi en="Kalyana Ready" te="కల్యాణ యోగ్యం" />
            </div>
          </div>
        </div>

        {/* Auspicious Progress Bar with Subtle Glow */}
        <div style={{
          width: '100%',
          height: '14px',
          background: '#F1E9DF',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1.5px solid #E2D9CC',
          position: 'relative',
          marginBottom: '1rem',
        }}>
          <div 
            style={{ 
              width: `${percentage}%`, 
              height: '100%', 
              background: percentage >= 90 
                ? 'linear-gradient(90deg, #D4AF37 0%, #801426 100%)' 
                : percentage >= 50 
                  ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                  : 'linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '999px',
            }} 
          />
          {/* 50% Threshold Notch */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#801426',
            opacity: 0.6,
          }} title="50% Unlock Threshold" />
        </div>

        {/* Quick Action Chips Banner */}
        {missingItems.length > 0 && percentage < 100 && (
          <div style={{
            background: '#FFFDF9',
            padding: '1rem 1.2rem',
            borderRadius: '16px',
            border: '1.5px dashed #E2D0B5',
            marginTop: '0.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.8rem',
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#801426', marginBottom: '0.4rem' }}>
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
                      gap: '0.35rem', 
                      padding: '0.35rem 0.85rem', 
                      background: '#FFFFFF', 
                      borderRadius: '999px', 
                      border: '1.5px solid #CBD5E1', 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: '#334155', 
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ color: '#801426', fontWeight: 800 }}>+</span> <Bi {...item} />
                  </Link>
                ))}
              </div>
            </div>

            <Link 
              href="/onboarding" 
              className="btn link-btn" 
              style={{
                padding: '0.55rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #801426 0%, #5B0C1A 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(128, 20, 38, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              <Bi en="Complete 100% Profile →" te="100% పూర్తి చేయండి →" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
