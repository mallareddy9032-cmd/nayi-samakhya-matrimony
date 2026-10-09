'use client';

import React, { useState } from 'react';
import { CommunityEndorsement } from '../lib/endorsement/types.ts';

interface ElderEndorsementCardProps {
  endorsement: CommunityEndorsement;
  lang?: 'te' | 'en';
}

export function ElderEndorsementCard({
  endorsement: e,
  lang = 'te',
}: ElderEndorsementCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏛️ *నాయి సమాఖ్య - గ్రామ పెద్దల ధృవీకరణ పత్రం (Elder Attestation)*\n\n` +
      `సభ్యులు: ${e.candidateName}\n` +
      `ధృవీకరించిన పెద్దలు: ${e.elderName} (${e.elderTitle})\n` +
      `స్వస్థలం: ${e.elderVillage}, ${e.elderDistrict.te}\n` +
      `పూర్వపరాలు: ${e.attestationStatementTe.slice(0, 120)}...\n\n` +
      `డిజిటల్ సీల్: ${e.digitalSeal}\n` +
      `పూర్తి వివరాలు: https://nayisamakhya.org/matrimony/profiles/${e.profileId}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Endorsement Summary Pod Display */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FEF9EE 100%)',
        border: '1.5px solid #E6CA65',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(180, 130, 20, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Watermark Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginBottom: '0.8rem',
          borderBottom: '1px dashed #DFCA88',
          paddingBottom: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏛️</span>
            <div>
              <h4 style={{ margin: 0, color: '#801426', fontSize: '1.05rem', fontWeight: 800 }}>
                {lang === 'te' ? 'గ్రామ పెద్దల & నాయి సంఘ ధృవీకరణ' : 'Village Elder & Sangham Endorsement'}
              </h4>
              <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 700 }}>
                ✓ {lang === 'te' ? 'క్షేత్ర విచారణ & పూర్వపరాలు పరిశీలించబడ్డాయి' : 'In-Person Residence & Character Verified'}
              </span>
            </div>
          </div>

          <span style={{
            background: 'linear-gradient(135deg, #801426, #630C1C)',
            color: '#FDE68A',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            border: '1px solid #D4AF37',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {e.digitalSeal}
          </span>
        </div>

        {/* Attesting Elder Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', fontSize: '0.86rem', marginBottom: '0.9rem' }}>
          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', fontWeight: 600 }}>
              {lang === 'te' ? 'ధృవీకరించిన పెద్దలు' : 'Attesting Elder'}:
            </span>
            <strong style={{ color: '#1E293B', fontSize: '0.92rem' }}>{e.elderName}</strong>
            <span style={{ display: 'block', color: '#801426', fontSize: '0.78rem', fontWeight: 600 }}>{e.elderTitle}</span>
          </div>

          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', fontWeight: 600 }}>
              {lang === 'te' ? 'గ్రామం / పరిధి' : 'Village / Authority'}:
            </span>
            <strong style={{ color: '#1E293B', fontSize: '0.92rem' }}>{e.elderVillage}</strong>
            <span style={{ display: 'block', color: '#64748B', fontSize: '0.78rem' }}>{e.elderDistrict.te}</span>
          </div>
        </div>

        {/* Short Attestation Excerpt */}
        <p style={{
          margin: '0 0 1rem',
          fontSize: '0.85rem',
          color: '#451A03',
          fontStyle: 'italic',
          lineHeight: 1.45,
          background: 'rgba(254, 243, 199, 0.5)',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          borderLeft: '3px solid #D97706'
        }}>
          "{lang === 'te' ? e.attestationStatementTe : e.attestationStatementEn}"
        </p>

        {/* View Formal Certificate Modal Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)',
            color: '#1A1202',
            padding: '0.65rem',
            borderRadius: '10px',
            border: '1px solid #997819',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 3px 10px rgba(212, 175, 55, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>📜</span>
          <span>{lang === 'te' ? 'పూర్తి ధృవీకరణ పత్రం వీక్షించండి (View Official Parchment)' : 'View Elder Attestation Certificate'}</span>
        </button>
      </div>

      {/* Official Parchment Certificate Dialog */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#FFFDF6',
            width: '100%',
            maxWidth: '680px',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            border: '6px double #D4AF37',
            padding: '2rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            fontFamily: "'Noto Sans Telugu', system-ui, sans-serif"
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              ✕
            </button>

            {/* Sacred Invocations */}
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <p style={{ margin: 0, color: '#801426', fontSize: '0.88rem', fontWeight: 800, letterSpacing: '1px' }}>
                ॥ శ్రీ ధన్వంతరి ప్రసన్నః ॥
              </p>
              <h2 style={{ margin: '0.4rem 0 0.2rem', color: '#801426', fontSize: '1.45rem', fontWeight: 900 }}>
                నాయి సమాఖ్య వివాహ వేదిక
              </h2>
              <p style={{ margin: 0, color: '#92400E', fontSize: '0.92rem', fontWeight: 700 }}>
                గ్రామ పెద్దల & నాయి సేవా సంఘం అధికారిక ధృవీకరణ పత్రం
              </p>
              <div style={{ width: '80px', height: '2px', background: '#D4AF37', margin: '0.5rem auto' }} />
            </div>

            {/* Candidate & Family Particulars */}
            <div style={{
              background: '#FEF9EE',
              borderRadius: '12px',
              padding: '1rem',
              border: '1.5px solid #EED89B',
              marginBottom: '1.2rem',
              fontSize: '0.88rem'
            }}>
              <p style={{ margin: '0 0 0.4rem' }}>
                <strong>సభ్యుల పేరు:</strong> {e.candidateName}
              </p>
              <p style={{ margin: '0 0 0.4rem' }}>
                <strong>స్వస్థలం:</strong> {e.elderVillage}, {e.elderMandal} మండలం, {e.elderDistrict.te}
              </p>
              <p style={{ margin: 0 }}>
                <strong>ధృవీకరణ సంఖ్య:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#801426' }}>{e.id}</span>
              </p>
            </div>

            {/* Elder Attestation Statement */}
            <div style={{ marginBottom: '1.5rem', lineHeight: 1.6, color: '#1E293B', fontSize: '0.94rem' }}>
              <p style={{ textIndent: '1.5rem', margin: '0 0 0.8rem' }}>
                మా నాయి బ్రాహ్మణ సేవా సంఘం మరియు గ్రామ పెద్దల సమక్షంలో సదరు కుటుంబానికి చెందిన పూర్వపరాలు, పితృస్వామ్య గోత్ర సంప్రదాయం, నివాస చిరునామా ప్రత్యక్షంగా పరిశీలించడమైనది.
              </p>
              <p style={{
                background: 'rgba(254, 243, 199, 0.6)',
                padding: '0.9rem',
                borderRadius: '10px',
                borderLeft: '4px solid #D97706',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#78350F'
              }}>
                "{e.attestationStatementTe}"
              </p>
            </div>

            {/* Signatory & Digital Seal Stamp */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1.5px dashed #DFCA88',
              paddingTop: '1rem',
              marginBottom: '1.5rem'
            }}>
              {/* Gold Official Stamp */}
              <div style={{
                border: '3px double #D4AF37',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFDF9',
                boxShadow: '0 3px 10px rgba(212, 175, 55, 0.2)',
                color: '#801426',
                textAlign: 'center',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '4px'
              }}>
                <span>🏛️ NAYI SAMAKHYA</span>
                <span style={{ fontSize: '0.74rem', color: '#B45309' }}>SEAL</span>
                <span>VERIFIED ELDER</span>
                <span>2026</span>
              </div>

              {/* Elder Signature Box */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B' }}>ధృవీకరణ తేదీ: {e.verificationDate}</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#801426', marginTop: '0.3rem' }}>
                  {e.elderName}
                </strong>
                <span style={{ display: 'block', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                  {e.elderTitle}
                </span>
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B' }}>
                  {e.elderVillage} · ఫోన్: {e.elderPhoneMasked}
                </span>
              </div>
            </div>

            {/* Modal Actions: Print & Share */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: '#F1F5F9',
                  color: '#334155',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🖨️ ముద్రించండి (Print)
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)'
                }}
              >
                <span>💬</span>
                <span>వాట్సాప్‌లో పంపండి (Share)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
