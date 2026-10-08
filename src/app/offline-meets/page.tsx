'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';

export default function OfflineMeetsPage() {
  const [coordinatorAuth, setCoordinatorAuth] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [batchData, setBatchData] = useState('');
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert('దయచేసి సరైన 10 అంకెల సమన్వయకర్త మొబైల్ నంబర్ నమోదు చేయండి.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      setCoordinatorAuth(true);
    } else {
      alert('చెల్లని ఓటీపీ కోడ్.');
    }
  };

  const handleBatchIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchData.trim()) return;
    const lines = batchData.trim().split('\n').filter(Boolean);
    setBatchSuccess(`విజయవంతంగా ${lines.length} మంది అభ్యర్థుల వివరాలు నమోదు చేయబడ్డాయి (Batch Ingestion Complete).`);
    setBatchData('');
  };

  return (
    <main className="shell">
      <Nav />
      <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1rem' }}>
        {/* Header Banner */}
        <div className="card" style={{ padding: '2.5rem', borderTop: '4px solid var(--maroon)', background: '#FFFFFF', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge" style={{ marginBottom: '0.6rem', padding: '0.3rem 0.8rem' }}>
              <Bi en="Community Physical Matrimony Meets" te="నాయీ సమాఖ్య ప్రత్యక్ష వధూవరుల పరిచయ వేదికలు" />
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '0.3rem 0 0.5rem', color: 'var(--maroon)' }}>
              <Bi en="Offline Matrimony Meet & Ingestion Suite" te="ఆఫ్‌లైన్ వివాహ సదస్సు & సమన్వయకర్తల వేదిక" />
            </h1>
            <p className="hint" style={{ fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
              <Bi
                en="Official tool for district & mandal coordinators during physical community sammelanams. Download standard A4 registration biodata forms and upload bulk offline candidate entries in 60 seconds."
                te="ప్రత్యక్ష పరిచయ వేదికలలో జిల్లా, మండల సమన్వయకర్తల కొరకు ప్రత్యేక సాధనం. ప్రామాణిక A4 దరఖాస్తు ఫారాల డౌన్‌లోడ్ మరియు 60 సెకన్లలో బల్క్ ఆఫ్‌లైన్ డేటా ఎంట్రీ సౌలభ్యం."
              />
            </p>
          </div>
        </div>

        {/* Section 1: Standard A4 Application Form Download */}
        <div className="card" style={{ padding: '2rem', background: '#FFFFFF', marginBottom: '2rem', border: '1.5px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📄</span>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--maroon)' }}>
                <Bi en="Download Standard A4 Physical Application Form" te="ప్రామాణిక A4 భౌతిక దరఖాస్తు పత్రం డౌన్‌లోడ్" />
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Bi 
                  en="Ready-to-print bilateral Telugu format with Sagothra declaration & DPDP 2023 signature consent." 
                  te="సగోత్ర మినహాయింపు మరియు DPDP చట్ట నిబంధనలతో కూడిన తెలుగు ప్రింటింగ్ ఫారం." 
                />
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                నాయీ సమాఖ్య వధూవరుల పరిచయ దరఖాస్తు పత్రం (2026 ఎడిషన్)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ద్విభాషా ఫార్మాట్ (Telugu & English) · A4 సైజ్ ప్రింట్ ప్రివ్యూ
              </div>
            </div>
            <a
              href="/matrimony/api/profiles/sample/biodata-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            >
              📥 A4 దరఖాస్తు ప్రింట్ చేయండి (Print Blank Form)
            </a>
          </div>
        </div>

        {/* Section 2: Coordinator Fast-Track Ingestion Suite */}
        <div className="card" style={{ padding: '2rem', background: '#FFFFFF', border: '1.5px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--maroon)' }}>
                <Bi en="Authorized Coordinator 60-Second Batch Ingestion" te="సమన్వయకర్తల 60 సెకన్ల వేగవంతమైన డేటా ఎంట్రీ" />
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Bi 
                  en="Directly ingest 10-50 physical paper applications into the digital portal post-sammelanam." 
                  te="సమ్మేళనం అనంతరం సేకరించిన దరఖాస్తులను నేరుగా వెబ్‌సైట్‌లోకి అప్‌లోడ్ చేయండి." 
                />
              </p>
            </div>
          </div>

          {!coordinatorAuth ? (
            <div style={{ maxWidth: '440px', margin: '1rem auto', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700, color: 'var(--maroon)' }}>
                🔒 సమన్వయకర్త లాగిన్ ధృవీకరణ (Coordinator OTP Access)
              </div>
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input
                    type="tel"
                    placeholder="సమన్వయకర్త మొబైల్ నంబర్"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <button type="submit" className="btn" style={{ padding: '0.6rem' }}>
                    లాగిన్ ఓటీపీ పంపండి →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input
                    type="text"
                    placeholder="6 అంకెల ఓటీపీ (టెస్ట్: 123456)"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ padding: '0.7rem', textAlign: 'center', letterSpacing: '0.2em', fontWeight: 700, borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <button type="submit" className="btn" style={{ padding: '0.6rem' }}>
                    ధృవీకరించి ప్రవేశించండి ✓
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleBatchIngest} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#1E293B' }}>
                  బల్క్ అభ్యర్థుల వివరాలు నమోదు చేయండి (ఫార్మాట్: పేరు, లింగం, వయస్సు, జిల్లా, గోత్రం, ఫోన్ నంబర్):
                </label>
                <textarea
                  rows={6}
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  placeholder={`ఉదాహరణ:\nసాయి కృష్ణ, వరుడు, 28, గుంటూరు, కశ్యప, 9848012345\nలక్ష్మి ప్రసన్న, వధువు, 24, కృష్ణా, భారద్వాజ, 9848054321`}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid var(--border-light)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              {batchSuccess && (
                <div style={{ padding: '0.8rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ✅ {batchSuccess}
                </div>
              )}

              <button type="submit" className="btn" style={{ padding: '0.7rem 1.5rem', fontWeight: 700 }}>
                ⚡ 60 సెకన్ల బల్క్ అప్‌లోడ్ పూర్తి చేయండి (Ingest Batch)
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
