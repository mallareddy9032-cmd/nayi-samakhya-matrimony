'use client';

import React, { useState } from 'react';
import { MediationVenue } from '../lib/endorsement/types.ts';
import { submitElderMediationRequest } from '../lib/endorsement/endorsement-store.ts';

interface KalyanaRayabharamModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    displayName: string;
    district: { en: string; te: string };
    mandal: string;
    gothra: string;
  };
  lang?: 'te' | 'en';
}

export function KalyanaRayabharamModal({
  isOpen,
  onClose,
  candidate: c,
  lang = 'te',
}: KalyanaRayabharamModalProps) {
  const [venue, setVenue] = useState<MediationVenue>('temple_meet');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req = submitElderMediationRequest({
      fromProfileId: 'me-session',
      toProfileId: c.id,
      preferredVenue: venue,
      notes,
    });
    setRequestId(req.id);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
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
        background: '#FFFDF9',
        width: '100%',
        maxWidth: '560px',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '2px solid #E2D9CC',
        padding: '2rem',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: "'Noto Sans Telugu', system-ui, sans-serif"
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
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

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem' }}>🤝</span>
              <h2 style={{ margin: '0.4rem 0 0.2rem', color: '#801426', fontSize: '1.4rem', fontWeight: 900 }}>
                {lang === 'te' ? 'కల్యాణ రాయబారం' : 'Kalyana Rayabharam'}
              </h2>
              <p style={{ margin: 0, color: '#92400E', fontSize: '0.9rem', fontWeight: 700 }}>
                {lang === 'te' ? 'పెద్దల సంప్రదింపుల సేవ (Elder Concierge Mediation)' : 'Traditional Elder-Assisted Introduction'}
              </p>
            </div>

            <p style={{
              background: '#FEF9EE',
              border: '1px solid #EED89B',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '0.86rem',
              color: '#451A03',
              lineHeight: 1.45,
              marginBottom: '1.4rem'
            }}>
              {lang === 'te' 
                ? `కుటుంబాల మధ్య సంభాషణను గౌరవప్రదంగా ప్రారంభించడానికి నాయి సమాఖ్య గ్రామ పెద్దలు లేదా మండల సమన్వయకర్త రాయబారం వహిస్తారు. మీ తరపున పెద్దలు సంబంధం వివరాలు గౌరవంగా తెలియజేస్తారు.`
                : `To respectfully initiate family discussions without awkwardness, our verified village elders or Mandal Coordinators will act as dignified mediators on your family's behalf.`}
            </p>

            {/* Candidate Target Badge */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.4rem',
              fontSize: '0.88rem'
            }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.76rem' }}>
                {lang === 'te' ? 'సంబంధం కోరుతున్న అభ్యర్థి' : 'Candidate'}:
              </span>
              <strong style={{ color: '#1E293B', fontSize: '1rem' }}>{c.displayName}</strong>
              <span style={{ display: 'block', color: '#801426', fontSize: '0.82rem', fontWeight: 600, marginTop: '2px' }}>
                📍 {c.mandal}, {c.district.te} · {c.gothra}
              </span>
            </div>

            {/* Preferred Venue Radio Selector */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.6rem' }}>
                {lang === 'te' ? 'సమావేశ ప్రాధాన్యత (Preferred Venue)' : 'Preferred Meeting Venue'}:
              </label>

              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: venue === 'temple_meet' ? '2px solid #801426' : '1px solid #CBD5E1',
                  background: venue === 'temple_meet' ? '#FFF5F5' : '#FFFFFF',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="venue"
                    value="temple_meet"
                    checked={venue === 'temple_meet'}
                    onChange={() => setVenue('temple_meet')}
                    style={{ accentColor: '#801426', width: '18px', height: '18px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1E293B' }}>
                      🛕 {lang === 'te' ? 'ఆలయ ప్రాంగణంలో భేటీ' : 'Temple Premises Meet'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {lang === 'te' ? 'స్థానిక పుణ్యక్షేత్రంలో శుభప్రదంగా పెద్దల సమక్షంలో' : 'Meeting at a sacred local temple with elders'}
                    </span>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: venue === 'home_visit' ? '2px solid #801426' : '1px solid #CBD5E1',
                  background: venue === 'home_visit' ? '#FFF5F5' : '#FFFFFF',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="venue"
                    value="home_visit"
                    checked={venue === 'home_visit'}
                    onChange={() => setVenue('home_visit')}
                    style={{ accentColor: '#801426', width: '18px', height: '18px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1E293B' }}>
                      🏡 {lang === 'te' ? 'గృహ సందర్శన & ముఖాముఖి' : 'Family Home Visit'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {lang === 'te' ? 'కుటుంబ పెద్దల సమక్షంలో ఇరువైపులా గౌరవ మర్యాదలతో' : 'Traditional home visit with respect & gifts'}
                    </span>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: venue === 'guided_call' ? '2px solid #801426' : '1px solid #CBD5E1',
                  background: venue === 'guided_call' ? '#FFF5F5' : '#FFFFFF',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="venue"
                    value="guided_call"
                    checked={venue === 'guided_call'}
                    onChange={() => setVenue('guided_call')}
                    style={{ accentColor: '#801426', width: '18px', height: '18px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1E293B' }}>
                      📞 {lang === 'te' ? 'పెద్దల సమక్షంలో టెలి-సంభాషణ' : 'Guided Tele-Conference'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {lang === 'te' ? 'మండల సమన్వయకర్త సమక్షంలో మొదటి పరిచయ సంభాషణ' : 'Introductory call mediated by Mandal Coordinator'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Family Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="mediation-notes" style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.4rem' }}>
                {lang === 'te' ? 'కుటుంబ సందేశం / ముహూర్త సమాచారం (ఐచ్ఛికం)' : 'Family Note / Auspicious Dates (Optional)'}:
              </label>
              <textarea
                id="mediation-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'te' ? 'ఉదాహరణకు: వచ్చే ఆదివారం గుడి వద్ద కలవడానికి ఆసక్తిగా ఉన్నాము...' : 'e.g. We prefer an auspicious Sunday morning meet...'}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Submit CTA */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '0.7rem 1.2rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {lang === 'te' ? 'రద్దు' : 'Cancel'}
              </button>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #801426 0%, #630C1C 100%)',
                  color: '#FFFFFF',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #D4AF37',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(128, 20, 38, 0.25)'
                }}
              >
                {lang === 'te' ? 'రాయబారం అభ్యర్థించండి 🤝' : 'Submit Mediation Request 🤝'}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success State */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <span style={{ fontSize: '3rem' }}>🪔</span>
            <h3 style={{ margin: '0.8rem 0 0.4rem', color: '#801426', fontSize: '1.35rem', fontWeight: 900 }}>
              {lang === 'te' ? 'రాయబార అభ్యర్థన విజయవంతంగా చేరింది!' : 'Mediation Request Registered!'}
            </h3>
            <p style={{ margin: '0 0 0.8rem', color: '#065F46', fontWeight: 700, fontSize: '0.95rem' }}>
              {lang === 'te' ? '॥ శ్రీరస్తు - శుభమస్తు - కల్యాణమస్తు ॥' : 'May it be blessed with auspicious success.'}
            </p>
            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              {lang === 'te' 
                ? `మీ అభ్యర్థన సంఖ్య ${requestId}. స్థానిక మండల సమన్వయకర్తలు / పెద్దలు ఇరు కుటుంబాలతో మాట్లాడి గౌరవప్రదమైన పరిచయ సమావేశాన్ని ఏర్పాటు చేస్తారు.`
                : `Your reference ID is ${requestId}. Our local coordinator / elder will contact both families with utmost dignity.`}
            </p>

            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'linear-gradient(135deg, #801426 0%, #630C1C 100%)',
                color: '#FFFFFF',
                padding: '0.7rem 2rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              {lang === 'te' ? 'ధన్యవాదాలు (ముగించండి)' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
