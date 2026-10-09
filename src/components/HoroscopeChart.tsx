'use client';

import React, { useState } from 'react';

export interface HoroscopeChartProps {
  nakshatra?: string | null;
  rasi?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  lang?: 'te' | 'en';
}

// 12 South Indian Zodiac Rashis in clockwise order
const RASHIS = [
  { id: 'pisces', en: 'Pisces', te: 'మీనం', lord: 'గురు (Guru)', gridArea: '1 / 1' },
  { id: 'aries', en: 'Aries', te: 'మేషం', lord: 'కుజ (Kuja)', gridArea: '1 / 2' },
  { id: 'taurus', en: 'Taurus', te: 'వృషభం', lord: 'శుక్ర (Sukra)', gridArea: '1 / 3' },
  { id: 'gemini', en: 'Gemini', te: 'మిథునం', lord: 'బుధ (Budha)', gridArea: '1 / 4' },
  { id: 'cancer', en: 'Cancer', te: 'కర్కాటకం', lord: 'చంద్ర (Chandra)', gridArea: '2 / 4' },
  { id: 'leo', en: 'Leo', te: 'సింహం', lord: 'సూర్య (Surya)', gridArea: '3 / 4' },
  { id: 'virgo', en: 'Virgo', te: 'కన్య', lord: 'బుధ (Budha)', gridArea: '4 / 4' },
  { id: 'libra', en: 'Libra', te: 'తుల', lord: 'శుక్ర (Sukra)', gridArea: '4 / 3' },
  { id: 'scorpio', en: 'Scorpio', te: 'వృశ్చికం', lord: 'కుజ (Kuja)', gridArea: '4 / 2' },
  { id: 'sagittarius', en: 'Sagittarius', te: 'ధనుస్సు', lord: 'గురు (Guru)', gridArea: '4 / 1' },
  { id: 'capricorn', en: 'Capricorn', te: 'మకరం', lord: 'శని (Sani)', gridArea: '3 / 1' },
  { id: 'aquarius', en: 'Aquarius', te: 'కుంభం', lord: 'శని (Sani)', gridArea: '2 / 1' },
];

export function HoroscopeChart({
  nakshatra = 'Swati',
  rasi = 'Tula',
  birthTime,
  birthPlace,
  lang = 'te',
}: HoroscopeChartProps) {
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);

  // Normalize rasi to find match
  const normalizedRasi = (rasi || '').toLowerCase();
  const activeRashiIndex = RASHIS.findIndex((r) =>
    normalizedRasi.includes(r.id) ||
    normalizedRasi.includes(r.en.toLowerCase()) ||
    normalizedRasi.includes(r.te)
  );

  return (
    <div style={{
      background: '#FFFDF9',
      borderRadius: '16px',
      border: '1.5px solid #EADDC7',
      padding: '1.2rem',
      boxShadow: '0 4px 16px rgba(128, 20, 38, 0.04)',
      fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginBottom: '1rem',
        paddingBottom: '0.6rem',
        borderBottom: '1.5px dashed #E2D0B5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🪐</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#801426', fontWeight: 800 }}>
              {lang === 'te' ? 'సంప్రదాయ దక్షిణ భారత రాశి చక్రం' : 'South Indian Vedic Rashi Chakra'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
              {lang === 'te' ? '12 భావాల జన్మ జాతక పటం (ద్వాదశ రాశులు)' : '12-House Astrological Birth Grid'}
            </p>
          </div>
        </div>

        {nakshatra && (
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            color: '#92400E',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 800,
            border: '1px solid #F59E0B',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.15)',
          }}>
            ⭐ {nakshatra} {rasi ? `(${rasi})` : ''}
          </div>
        )}
      </div>

      {/* South Indian 4x4 Vedic Astrology Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, minmax(68px, 1fr))',
        gap: '3px',
        background: '#801426',
        padding: '3px',
        borderRadius: '12px',
        aspectRatio: '1 / 1',
        maxWidth: '420px',
        margin: '0 auto',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      }}>
        {/* Central Hub (2x2 center block) */}
        <div style={{
          gridArea: '2 / 2 / 4 / 4',
          background: 'linear-gradient(135deg, #FFFDF9 0%, #FEF9E7 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.8rem',
          textAlign: 'center',
          borderRadius: '6px',
          border: '1.5px solid #D4AF37',
        }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🪔</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#801426', marginTop: '0.2rem' }}>
            {lang === 'te' ? 'శ్రీ కల్యాణ చక్రం' : 'Sri Kalyana Chakra'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 700, marginTop: '0.1rem' }}>
            {lang === 'te' ? 'జన్మ రాశి & గ్రహస్థితి' : 'Janma Rashi Alignment'}
          </div>
          {birthTime && (
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.3rem' }}>
              🕒 {birthTime} {birthPlace ? `· ${birthPlace}` : ''}
            </div>
          )}
        </div>

        {/* 12 Outer Rashi Cells */}
        {RASHIS.map((r, idx) => {
          const isMoonSign = idx === activeRashiIndex;
          const isSelected = selectedRashi === r.id;

          return (
            <div
              key={r.id}
              onClick={() => setSelectedRashi(isSelected ? null : r.id)}
              style={{
                gridArea: r.gridArea,
                background: isMoonSign
                  ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
                  : isSelected
                  ? '#FFF1F2'
                  : '#FFFFFF',
                borderRadius: '6px',
                padding: '0.35rem 0.45rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                border: isMoonSign ? '2px solid #F59E0B' : '1px solid #E2D9CC',
                boxShadow: isMoonSign ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isMoonSign ? '#92400E' : '#801426',
                  lineHeight: 1.1,
                }}>
                  {lang === 'te' ? r.te : r.en}
                </span>
                {isMoonSign && (
                  <span style={{
                    fontSize: '0.62rem',
                    background: '#801426',
                    color: '#FFFFFF',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}>
                    {lang === 'te' ? 'చంద్ర (చ)' : 'Moon'}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '0.62rem',
                color: isMoonSign ? '#78350F' : '#64748B',
                fontWeight: 600,
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span>{r.lord}</span>
                {isMoonSign && <span style={{ fontSize: '0.75rem' }}>🌙</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Astrological Guidance Footnote */}
      <div style={{
        marginTop: '0.9rem',
        padding: '0.6rem 0.8rem',
        background: '#FEF9E7',
        borderRadius: '8px',
        border: '1px solid #EADDC7',
        fontSize: '0.76rem',
        color: '#78350F',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '1rem' }}>ℹ️</span>
        <span>
          {lang === 'te'
            ? 'పసుపు రంగు గడి అభ్యర్థి జన్మ రాశిని సూచిస్తుంది. సంబంధాల సరిపోలిక (గుణ మేళనం) కోసం మీ కుటుంబ సిద్ధాంతి/జ్యోతిష్యులను సంప్రదించవచ్చు.'
            : 'The golden square highlights the candidate\'s Janma Rashi (Moon sign). Families can consult their family astrologer for detailed Guna Milan.'}
        </span>
      </div>
    </div>
  );
}
