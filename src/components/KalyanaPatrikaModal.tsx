'use client';

import React, { useState } from 'react';

export interface KalyanaPatrikaProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    displayName: string;
    age: number;
    gender: string;
    district: { en: string; te: string };
    mandal: string;
    gothra: string;
    nakshatra?: string;
    rasi?: string;
    birthTime?: string;
    birthPlace?: string;
    educationDegree: string;
    occupation: string;
    incomeBracket?: string;
    vocation?: string;
    fatherName?: string;
    motherName?: string;
    siblings?: string;
    photoUrl?: string;
  };
  lang?: 'te' | 'en';
}

export function KalyanaPatrikaModal({
  isOpen,
  onClose,
  candidate: c,
  lang = 'te',
}: KalyanaPatrikaProps) {
  const [hidePhoto, setHidePhoto] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/matrimony/profiles/${c.id}` 
    : `https://nayisamakhya.org/matrimony/profiles/${c.id}`;

  const shareText = `🙏 *శ్రీ ధన్వంతరి ప్రసన్నః* 🙏\n` +
    `*నాయీ సమాఖ్య వివాహ వేదిక (Nayi Samakhya Matrimony)*\n\n` +
    `✨ *కళ్యాణ పరిచయ పత్రిక / Matrimonial Biodata*\n` +
    `👤 *పేరు / Name:* ${c.displayName} (${c.gender === 'male' ? 'వరుడు / Groom' : 'వధువు / Bride'})\n` +
    `🎂 *వయస్సు / Age:* ${c.age} సం.\n` +
    `🎓 *విద్య / Education:* ${c.educationDegree}\n` +
    `💼 *ఉద్యోగం / Profession:* ${c.occupation}\n` +
    `🪔 *గోత్రం / Gotra:* ${c.gothra}\n` +
    `⭐ *నక్షత్రం & రాశి:* ${c.nakshatra || 'వివరాలు అందుబాటులో ఉన్నాయి'} (${c.rasi || ''})\n` +
    `📍 *స్వస్థలం / Native:* ${c.mandal}, ${c.district.te} (${c.district.en})\n` +
    `👨‍👩‍👧 *తల్లిదండ్రులు:* ${c.fatherName || 'సంప్రదించండి'} / ${c.motherName || ''}\n\n` +
    `🔗 *సమగ్ర వివరాలు & జాతక పరిశీలన కొరకు (Official Profile):*\n${profileUrl}\n\n` +
    `_గమనిక: సమాజ-ధృవీకరించబడిన సంబంధం. గోప్యత మరియు ఆత్మగౌరవంతో కూడిన వేదిక._`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        overflowY: 'auto',
        fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#FFFDF9',
          borderRadius: '24px',
          border: '3px solid #D4AF37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Modal Top Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: '#801426',
          color: '#FFFFFF',
          borderBottom: '2px solid #D4AF37',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📜</span>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#FEF3C7' }}>
              {lang === 'te' ? 'కల్యాణ పరిచయ పత్రిక (Kalyana Patrika)' : 'Digital Biodata Invitation'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Printable Patrika Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }} id="printable-patrika">
          {/* Royal Decorative Frame */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF9 0%, #FEF9E7 50%, #FFFDF9 100%)',
            border: '2.5px solid #D4AF37',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            boxShadow: 'inset 0 0 15px rgba(212, 175, 55, 0.12)',
          }}>
            {/* Corner Temple Motifs */}
            <div style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '14px', color: '#D4AF37' }}>⚜️</div>
            <div style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '14px', color: '#D4AF37' }}>⚜️</div>
            <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '14px', color: '#D4AF37' }}>⚜️</div>
            <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '14px', color: '#D4AF37' }}>⚜️</div>

            {/* Sacred Invocations */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', letterSpacing: '0.05em' }}>
                ॥ శ్రీ ధన్వంతరి ప్రసన్నః ॥ మంగళ నాదస్వర ప్రసన్నః ॥
              </div>
              <h2 style={{
                margin: '4px 0 2px',
                fontSize: '20px',
                color: '#801426',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}>
                నాయీ సమాఖ్య వివాహ పరిచయ పత్రిక
              </h2>
              <div style={{ fontSize: '11px', color: '#78350F', fontWeight: 700 }}>
                Nayi Samakhya Matrimonial Platform · nayisamakhya.org/matrimony
              </div>
              <div style={{
                width: '60px',
                height: '2px',
                background: '#D4AF37',
                margin: '8px auto',
              }} />
            </div>

            {/* Candidate Header & Photo */}
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1.5px dashed #E2D0B5',
            }}>
              {/* Photo Box */}
              {!hidePhoto && c.photoUrl ? (
                <div style={{
                  width: '96px',
                  height: '110px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #D4AF37',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}>
                  <img src={c.photoUrl} alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  width: '96px',
                  height: '110px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFE4E6, #FEF3C7)',
                  border: '2px solid #D4AF37',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#801426',
                  textAlign: 'center',
                  padding: '6px',
                }}>
                  <span style={{ fontSize: '26px' }}>🪔</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px' }}>
                    {hidePhoto ? 'గోప్యతా ఫోటో' : 'ఫోటో జతచేయబడింది'}
                  </span>
                </div>
              )}

              {/* Title & Key Badge */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', background: '#801426', color: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800, marginBottom: '4px' }}>
                  {c.gender === 'male' ? 'వరుడు (Groom)' : 'వధువు (Bride)'} · NS-ID: {c.id.slice(0, 12)}
                </div>
                <h3 style={{ margin: 0, fontSize: '19px', color: '#801426', fontWeight: 900 }}>
                  {c.displayName}
                </h3>
                <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, marginTop: '2px' }}>
                  {c.age} సం. (Years) · {c.educationDegree}
                </div>
                <div style={{ fontSize: '12px', color: '#92400E', fontWeight: 700, marginTop: '2px' }}>
                  💼 {c.occupation}
                </div>
              </div>
            </div>

            {/* Key Information Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              fontSize: '12px',
            }}>
              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #EADDC7' }}>
                <span style={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '11px' }}>గోత్రం (Gotra)</span>
                <strong style={{ color: '#801426', fontSize: '13px' }}>{c.gothra}</strong>
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #EADDC7' }}>
                <span style={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '11px' }}>నక్షత్రం & రాశి</span>
                <strong style={{ color: '#92400E', fontSize: '12.5px' }}>{c.nakshatra || 'లభ్యమవును'} {c.rasi ? `(${c.rasi})` : ''}</strong>
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #EADDC7' }}>
                <span style={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '11px' }}>స్వస్థలం (Native)</span>
                <strong style={{ color: '#1E293B' }}>{c.mandal}, {c.district.te}</strong>
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #EADDC7' }}>
                <span style={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '11px' }}>జనన సమయం</span>
                <strong style={{ color: '#1E293B' }}>{c.birthTime || 'తేదీ నమోదైంది'}</strong>
              </div>
            </div>

            {/* Family Heritage Section */}
            {(c.fatherName || c.motherName) && (
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #EADDC7',
                fontSize: '12px',
              }}>
                <div style={{ fontWeight: 800, color: '#801426', marginBottom: '4px', fontSize: '11.5px' }}>
                  👨‍👩‍👧 కుటుంబ వివరాలు (Family Lineage):
                </div>
                <div style={{ color: '#334155' }}>
                  {c.fatherName && <span><strong>తండ్రి:</strong> {c.fatherName} &nbsp;|&nbsp; </span>}
                  {c.motherName && <span><strong>తల్లి:</strong> {c.motherName}</span>}
                  {c.siblings && <div style={{ marginTop: '2px', color: '#64748B' }}><strong>తోబుట్టువులు:</strong> {c.siblings}</div>}
                </div>
              </div>
            )}

            {/* Verification Footer Stamp */}
            <div style={{
              marginTop: '14px',
              paddingTop: '10px',
              borderTop: '1px dashed #E2D0B5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10.5px',
              color: '#78350F',
            }}>
              <div>
                <div>✓ నాయీ సమాఖ్య అధికారికంగా ధృవీకరించిన ప్రొఫైల్</div>
                <div style={{ color: '#64748B' }}>DPDP చట్టం 2023 నిబంధనల ప్రకారం రక్షితం</div>
              </div>
              <div style={{
                padding: '3px 8px',
                background: '#FEF3C7',
                border: '1px solid #D4AF37',
                borderRadius: '6px',
                fontWeight: 800,
                color: '#801426',
              }}>
                నాయీ సమాఖ్య ముద్ర 🪔
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div style={{
          padding: '14px 18px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Privacy Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={hidePhoto}
              onChange={(e) => setHidePhoto(e.target.checked)}
              style={{ accentColor: '#801426', width: '16px', height: '16px' }}
            />
            {lang === 'te' ? 'గోప్యత కోసం ఫోటో దాచండి' : 'Hide photo for privacy'}
          </label>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Copy Details */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ కాపీ అయింది!' : '📋 వివరాలు కాపీ'}
            </button>

            {/* Print / Save Card */}
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#FFFFFF',
                color: '#801426',
                border: '1.5px solid #801426',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🖨️ ప్రింట్ / PDF
            </button>

            {/* WhatsApp Share Deep-link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
              }}
            >
              <span>📲</span> వాట్సాప్‌లో పంపండి
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
