'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DesignPreviewPage() {
  const [activeConcept, setActiveConcept] = useState<'concept1' | 'concept2'>('concept1');

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Noto Sans Telugu', system-ui, sans-serif" }}>
      {/* Concept Switcher Toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#111827',
        color: '#fff',
        padding: '0.8rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🎨</span>
          <strong>Nayi Samakhya Matrimony — UI Design Comparison</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => setActiveConcept('concept1')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '999px',
              border: activeConcept === 'concept1' ? '2px solid #D4AF37' : '1px solid #4B5563',
              background: activeConcept === 'concept1' ? '#8B1D2C' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Concept 1: Kalyana Shubhodayam (Silk Ivory & Royal Maroon)
          </button>

          <button
            onClick={() => setActiveConcept('concept2')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '999px',
              border: activeConcept === 'concept2' ? '2px solid #F3C64F' : '1px solid #4B5563',
              background: activeConcept === 'concept2' ? '#1E3A8A' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Concept 2: Raja Sabha (Midnight Navy & Champagne Gold)
          </button>
        </div>
      </div>

      {/* Render Selected Concept */}
      {activeConcept === 'concept1' ? <ConceptOnePreview /> : <ConceptTwoPreview />}
    </div>
  );
}

// -------------------------------------------------------------
// CONCEPT 1: KALYANA SHUBHODAYAM (Silk Ivory, Deep Royal Maroon & Temple Gold)
// -------------------------------------------------------------
function ConceptOnePreview() {
  return (
    <div style={{ background: '#FAF7F2', color: '#2D3748', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Top Banner & Header */}
      <header style={{ background: '#FFFDF9', borderBottom: '2px solid #E2D9C8', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#8B1D2C', display: 'grid', placeItems: 'center', color: '#D4AF37', fontSize: '1.4rem', fontWeight: 800, border: '2px solid #D4AF37' }}>
              NS
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#8B1D2C', fontWeight: 800, letterSpacing: '-0.01em' }}>
                నాయీ సమాఖ్య కల్యాణ వేదిక
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>
                Nayi Samakhya Matrimony • Pan-Telugu & Pan-India Alliance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: '#4A5568', fontWeight: 600 }}>Home</span>
            <span style={{ fontSize: '0.88rem', color: '#4A5568', fontWeight: 600 }}>Discover</span>
            <span style={{ fontSize: '0.88rem', color: '#4A5568', fontWeight: 600 }}>About Lineage</span>
            <Link
              href="/matrimony/login"
              style={{
                background: '#8B1D2C',
                color: '#FFF',
                padding: '0.55rem 1.4rem',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(139, 29, 44, 0.25)',
                border: '1px solid #72121E'
              }}
            >
              Member Login (మొబైల్ ఓటీపీ)
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Split Layout */}
      <section style={{ maxWidth: '1200px', margin: '2.5rem auto 3.5rem', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#FFF1F2', color: '#8B1D2C', padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #FECDD3' }}>
            ★ పవిత్ర సగోత్ర రక్షణ & చట్టబద్ధమైన గోప్యత
          </span>
          <h1 style={{ fontSize: '2.8rem', color: '#1A202C', margin: '1rem 0 0.8rem', lineHeight: '1.25', fontWeight: 800 }}>
            తెలంగాణ & ఆంధ్రప్రదేశ్ నాయీ బ్రాహ్మణుల <br />
            <span style={{ color: '#8B1D2C' }}>గౌరవప్రదమైన కల్యాణ వేదిక</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4A5568', lineHeight: '1.7', margin: '0 0 1.5rem' }}>
            తెలంగాణ & ఆంధ్రప్రదేశ్ 59 జిల్లాలలోని మరియు దేశవ్యాప్తంగా స్థిరపడిన మన సమాజ కుటుంబాలను ఒకచోట చేర్చే నమ్మకమైన అధికారిక వేదిక. ఎటువంటి ప్రైవేటు దళారులు లేకుండా, పారదర్శకమైన విధానంతో సంబంధాలను వెతకండి.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/matrimony/onboarding"
              style={{
                background: '#8B1D2C',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(139, 29, 44, 0.3)'
              }}
            >
              ఉచిత ప్రొఫైల్ నమోదు చేసుకోండి →
            </Link>
            <button style={{ background: '#FFF', border: '1px solid #CBD5E0', padding: '0.85rem 1.6rem', borderRadius: '12px', fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>
              ఎలా పనిచేస్తుంది?
            </button>
          </div>
        </div>

        {/* Quick Search Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          <div style={{ borderBottom: '2px solid #FAF5FF', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
            <h3 style={{ margin: 0, color: '#8B1D2C', fontSize: '1.2rem', fontWeight: 700 }}>
              సంబంధాల శోధన (Quick Search)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#718096' }}>
              వెంటనే సరైన సంబంధాలను కనుగొనండి
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>నేను వెతుకుతున్నది:</label>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '2px solid #8B1D2C', background: '#FFF1F2', color: '#8B1D2C', fontWeight: 700 }}>వధువు (Bride)</button>
                <button style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#FFF', color: '#4A5568', fontWeight: 600 }}>వరుడు (Groom)</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>వయస్సు:</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                  <option>21 - 25 సంవత్సరాలు</option>
                  <option>26 - 30 సంవత్సరాలు</option>
                  <option>31 - 35 సంవత్సరాలు</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>స్వస్థల జిల్లా:</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                  <option>అన్ని జిల్లాలు (All)</option>
                  <option>హైదరాబాద్ (Hyderabad)</option>
                  <option>వరంగల్ (Warangal)</option>
                  <option>కరీంనగర్ (Karimnagar)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>వృత్తి / ఉద్యోగం:</label>
              <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                <option>అన్ని రంగాలు (All Occupations)</option>
                <option>సాఫ్ట్‌వేర్ / ఐటీ (Software & IT)</option>
                <option>ప్రభుత్వ ఉద్యోగం (Government Sector)</option>
                <option>సెలూన్ వ్యవస్థాపకులు (Salon Founders)</option>
              </select>
            </div>

            <button style={{ background: '#D4AF37', color: '#1A202C', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>
              సంబంధాలు శోధించండి 🔍
            </button>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ color: '#8B1D2C', fontWeight: 700, fontSize: '0.85rem' }}>సరికొత్త సంబంధాలు</span>
            <h2 style={{ fontSize: '1.8rem', color: '#1A202C', margin: '0.2rem 0' }}>ధృవీకరించబడిన ప్రొఫైల్స్</h2>
          </div>
          <Link href="/matrimony/discover" style={{ color: '#8B1D2C', fontWeight: 700, textDecoration: 'none' }}>అన్నీ చూడండి →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Sample Card 1 */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <div style={{ height: '140px', background: 'linear-gradient(135deg, #FFE4E6, #FECDD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#8B1D2C', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '1.8rem', fontWeight: 800, border: '3px solid #FFF' }}>
                SK
              </div>
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', color: '#8B1D2C', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                🔒 2 Photos Verified
              </span>
            </div>
            <div style={{ padding: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1A202C' }}>సాయి కృష్ణ, 27 సం.</h3>
              <p style={{ margin: '0.3rem 0', color: '#8B1D2C', fontSize: '0.88rem', fontWeight: 700 }}>📍 హైదరాబాద్ (Hyderabad)</p>
              <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', color: '#4A5568', margin: '0.6rem 0' }}>
                <div><strong>గోత్రం:</strong> కాశ్యప (Kashyapa)</div>
                <div><strong>నక్షత్రం:</strong> రోహిణి (Rohini)</div>
                <div><strong>విద్య:</strong> B.Tech, సాఫ్ట్‌వేర్ ఇంజనీర్</div>
              </div>
              <button style={{ width: '100%', background: '#8B1D2C', color: '#FFF', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                పూర్తి జాతకం & వివరాలు →
              </button>
            </div>
          </div>

          {/* Sample Card 2 */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <div style={{ height: '140px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#92400E', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '1.8rem', fontWeight: 800, border: '3px solid #FFF' }}>
                SL
              </div>
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', color: '#92400E', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                🔒 2 Photos Verified
              </span>
            </div>
            <div style={{ padding: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1A202C' }}>స్నేహలత, 24 సం.</h3>
              <p style={{ margin: '0.3rem 0', color: '#92400E', fontSize: '0.88rem', fontWeight: 700 }}>📍 వరంగల్ (Warangal)</p>
              <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', color: '#4A5568', margin: '0.6rem 0' }}>
                <div><strong>గోత్రం:</strong> భరద్వాజ (Bharadwaja)</div>
                <div><strong>నక్షత్రం:</strong> హస్త (Hasta)</div>
                <div><strong>విద్య:</strong> M.Sc, ప్రభుత్వ ఉపాధ్యాయురాలు</div>
              </div>
              <button style={{ width: '100%', background: '#92400E', color: '#FFF', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                పూర్తి జాతకం & వివరాలు →
              </button>
            </div>
          </div>

          {/* Sample Card 3 */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <div style={{ height: '140px', background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#166534', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '1.8rem', fontWeight: 800, border: '3px solid #FFF' }}>
                RN
              </div>
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                ⭐ ఎంటర్‌ప్రైజ్ బ్యాడ్జ్
              </span>
            </div>
            <div style={{ padding: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1A202C' }}>రవీందర్ నాయీ, 29 సం.</h3>
              <p style={{ margin: '0.3rem 0', color: '#166534', fontSize: '0.88rem', fontWeight: 700 }}>📍 కరీంనగర్ (Karimnagar)</p>
              <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', color: '#4A5568', margin: '0.6rem 0' }}>
                <div><strong>గోత్రం:</strong> గౌతమ (Gautama)</div>
                <div><strong>నక్షత్రం:</strong> ఉత్తర (Uttara)</div>
                <div><strong>వృత్తి:</strong> సెలూన్ వ్యవస్థాపకులు (Founder)</div>
              </div>
              <button style={{ width: '100%', background: '#166534', color: '#FFF', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                పూర్తి జాతకం & వివరాలు →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// CONCEPT 2: RAJA SABHA MODERNIST (Midnight Navy & Champagne Gold)
// -------------------------------------------------------------
function ConceptTwoPreview() {
  return (
    <div style={{ background: '#0B132B', color: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Top Header */}
      <header style={{ background: '#1C2541', borderBottom: '1px solid rgba(243, 198, 79, 0.2)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem', color: '#F3C64F' }}>🏛️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#F3C64F', fontWeight: 800 }}>
                NAYI SAMAKHYA MATRIMONY
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Sovereign Lineage & Alliance Network
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Directory</span>
            <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Gothra Ledger</span>
            <Link
              href="/matrimony/login"
              style={{
                background: 'linear-gradient(135deg, #F3C64F, #E5A93C)',
                color: '#0B132B',
                padding: '0.5rem 1.3rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              Member Sign-In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section style={{ maxWidth: '1100px', margin: '3rem auto 2.5rem', textAlign: 'center', padding: '0 1.5rem' }}>
        <span style={{ border: '1px solid #F3C64F', color: '#F3C64F', padding: '0.3rem 1rem', borderRadius: '999px', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Telangana Statewide Community Alliance
        </span>
        <h1 style={{ fontSize: '3rem', margin: '1.2rem 0 0.8rem', color: '#FFFFFF', fontWeight: 800 }}>
          Dignity, Heritage & Verified Matrimony
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94A3B8', maxWidth: '720px', margin: '0 auto 2rem', lineHeight: '1.7' }}>
          DB-level Sagothra exclusion across 589 mandals. Contact details unlock exclusively upon mutual bilateral consent under the DPDP Act 2023.
        </p>

        {/* Floating Dark Glass Dock */}
        <div style={{ background: 'rgba(28, 37, 65, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(243, 198, 79, 0.25)', borderRadius: '16px', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>LOOKING FOR</label>
            <select style={{ width: '100%', background: '#0B132B', color: '#FFF', border: '1px solid #334155', padding: '0.6rem', borderRadius: '8px' }}>
              <option>Bride (వధువు)</option>
              <option>Groom (వరుడు)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>DISTRICT</label>
            <select style={{ width: '100%', background: '#0B132B', color: '#FFF', border: '1px solid #334155', padding: '0.6rem', borderRadius: '8px' }}>
              <option>All Districts (Telangana & AP)</option>
              <option>Hyderabad</option>
              <option>Visakhapatnam</option>
              <option>Vijayawada (NTR)</option>
              <option>Warangal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>AGE</label>
            <input type="text" defaultValue="21 - 32 Years" style={{ width: '100%', background: '#0B132B', color: '#FFF', border: '1px solid #334155', padding: '0.6rem', borderRadius: '8px' }} />
          </div>
          <button style={{ alignSelf: 'end', height: '42px', background: 'linear-gradient(135deg, #F3C64F, #E5A93C)', color: '#0B132B', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
            FIND MATCHES →
          </button>
        </div>
      </section>

      {/* Modern Profile Cards */}
      <section style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#F3C64F', marginBottom: '1.2rem' }}>Verified Candidate Spotlight</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#1C2541', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem' }}>
            <div style={{ height: '140px', background: '#0B132B', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(243, 198, 79, 0.3)' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F3C64F' }}>SK</span>
            </div>
            <h4 style={{ margin: '1rem 0 0.3rem', fontSize: '1.2rem' }}>Sai Krishna, 27</h4>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Hyderabad • Software Engineer</p>
            <p style={{ margin: '0.5rem 0', color: '#F3C64F', fontSize: '0.8rem' }}>Kashyapa Gotram • Rohini Nakshatram</p>
            <button style={{ width: '100%', background: 'transparent', border: '1px solid #F3C64F', color: '#F3C64F', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, marginTop: '0.5rem', cursor: 'pointer' }}>
              View Profile
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
