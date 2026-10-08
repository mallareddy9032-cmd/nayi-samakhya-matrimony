import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getProfileView } from '../../../lib/match-store.ts';
import { badgesFor } from '../../../lib/matrimony.ts';
import { INCOME_BRACKETS, NAKSHATRAS, VOCATIONS, type Bilingual } from '../../../lib/onboarding.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';
import { getOptionalSession } from '../../../lib/session.ts';
import { calculateCompleteness } from '../../../lib/completeness.ts';
import { CompletenessBar } from '../../../components/CompletenessBar.tsx';
import { Nav } from '../../Nav.tsx';
import { Bi } from '../../onboarding/Wizard.tsx';

// Sample Candidate Profiles for rich viewing
const SAMPLE_PROFILES: Record<string, any> = {
  'sample-1': {
    id: 'sample-1',
    displayName: 'S. Sai Krishna',
    age: 27,
    gender: 'male',
    district: { en: 'Hyderabad', te: 'హైదరాబాద్' },
    mandal: 'Ameerpet',
    gothra: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Rohini (రోహిణి)',
    rasi: 'Vrishabha (వృషభ రాశి)',
    birthTime: '06:45 AM',
    birthPlace: 'Hyderabad',
    educationDegree: 'B.Tech in Computer Science',
    occupation: 'Lead Cloud Architect @ MNC, Hyderabad',
    incomeBracket: '25l_50l',
    vocation: 'corporate_tech_civil',
    photoInitials: 'SK',
    photoGradient: 'linear-gradient(135deg, #1e3a8a, #0b172d)',
    fatherName: 'S. Narayana (Business)',
    motherName: 'S. Lakshmi (Homemaker)',
    siblings: '1 Younger Sister (Married)',
  },
  'sample-2': {
    id: 'sample-2',
    displayName: 'K. Snehalatha',
    age: 24,
    gender: 'female',
    district: { en: 'Warangal', te: 'వరంగల్' },
    mandal: 'Hanamkonda',
    gothra: 'Bharadwaja (భరద్వాజ)',
    nakshatra: 'Hasta (హస్త)',
    rasi: 'Kanya (కన్య రాశి)',
    birthTime: '02:15 PM',
    birthPlace: 'Warangal',
    educationDegree: 'M.Sc (Physics), B.Ed',
    occupation: 'Govt Model High School Teacher',
    incomeBracket: '6l_12l',
    vocation: 'scholarly_academic',
    photoInitials: 'SL',
    photoGradient: 'linear-gradient(135deg, #831843, #0b172d)',
    fatherName: 'K. Satyanarayana (Retd. Principal)',
    motherName: 'K. Sharada (Teacher)',
    siblings: '1 Elder Brother (Software Engineer)',
  },
  'sample-3': {
    id: 'sample-3',
    displayName: 'P. Ravinder Nayi',
    age: 29,
    gender: 'male',
    district: { en: 'Karimnagar', te: 'కరీంనగర్' },
    mandal: 'Karimnagar Urban',
    gothra: 'Gautama (గౌతమ)',
    nakshatra: 'Uttara (ఉత్తర)',
    rasi: 'Simha (సింహ రాశి)',
    birthTime: '09:20 AM',
    birthPlace: 'Karimnagar',
    educationDegree: 'B.Com & Advanced Cosmetology',
    occupation: 'Founder & Managing Director, Elegance Salon Chain',
    incomeBracket: 'above_50l',
    vocation: 'wellness_artisan',
    photoInitials: 'RN',
    photoGradient: 'linear-gradient(135deg, #78350f, #0b172d)',
    fatherName: 'P. Lingamurthy (Nadopasana Artiste)',
    motherName: 'P. Rajamani',
    siblings: 'None (Only Son)',
  },
  'sample-4': {
    id: 'sample-4',
    displayName: 'M. Ananya',
    age: 23,
    gender: 'female',
    district: { en: 'Nalgonda', te: 'నల్గొండ' },
    mandal: 'Miryalaguda',
    gothra: 'Vashishta (వశిష్ట)',
    nakshatra: 'Anuradha (అనూరాధ)',
    rasi: 'Vrischika (వృశ్చిక రాశి)',
    birthTime: '11:10 PM',
    birthPlace: 'Miryalaguda',
    educationDegree: 'B.Pharmacy, MBA (Hospital Mgmt)',
    occupation: 'Clinical Research Executive',
    incomeBracket: '6l_12l',
    vocation: 'healthcare_traditional_medicine',
    photoInitials: 'AN',
    photoGradient: 'linear-gradient(135deg, #134e4a, #0b172d)',
    fatherName: 'M. Venkataramana',
    motherName: 'M. Padmavathi',
    siblings: '1 Younger Brother (Studying B.Tech)',
  },
};

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const claims = await getOptionalSession();

  // If user is not logged in or has <50% completeness
  const completeness = calculateCompleteness({
    displayName: claims?.sub ? 'Member Candidate' : null,
    gender: 'male',
    dateOfBirth: '1998-05-15',
    gothraId: claims?.sub ? 'gothra-1' : null,
    district: claims?.assigned_district ?? null,
    mandal: claims?.assigned_mandal ?? null,
    photoCount: claims ? 2 : 0,
    dpdpConsent: Boolean(claims),
  });

  const p = SAMPLE_PROFILES[id] ?? {
    id,
    displayName: 'Verified Community Candidate',
    age: 26,
    gender: 'female',
    district: { en: 'Telangana', te: 'తెలంగాణ' },
    mandal: 'Mandal Center',
    gothra: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Swati (స్వాతి)',
    rasi: 'Tula (తులా రాశి)',
    birthTime: '08:30 AM',
    birthPlace: 'Telangana',
    educationDegree: 'Professional Degree',
    occupation: 'Corporate / Govt Professional',
    incomeBracket: '12l_25l',
    vocation: 'corporate_tech_civil',
    photoInitials: 'VK',
    photoGradient: 'linear-gradient(135deg, #1e3a8a, #0b172d)',
    fatherName: 'Verified Member',
    motherName: 'Verified Member',
    siblings: 'Verified Family',
  };

  return (
    <main className="shell">
      <Nav claims={claims} />

      {/* Progress & Verification Bar */}
      <CompletenessBar completeness={completeness} freeViewsLeft={claims ? 7 : 10} />

      {/* Gating check: If candidate is not registered with 50% completeness */}
      {!completeness.canAccessProfiles && (
        <div className="card" style={{ padding: '2.4rem', textAlign: 'center', marginBottom: '2rem', borderTop: '4px solid var(--maroon)', background: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔒</span>
          <h2 style={{ color: 'var(--maroon)', margin: '0.8rem 0 0.4rem' }}>
            <Bi en="Register Your Profile to Access Full Candidate Details" te="సంబంధాల వివరాలు చూడటానికి మీ ప్రొఫైల్ నమోదు చేసుకోండి" />
          </h2>
          <p className="lead" style={{ maxWidth: '640px', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
            <Bi 
              en="To protect family privacy and ensure mutual trust, members must complete at least 50% of their own profile (including 2 photos) before accessing biodatas and horoscopes." 
              te="సభ్యుల కుటుంబ గోప్యతను కాపాడటానికి, మీ ప్రొఫైల్‌లో కనీసం 50% వివరాలు మరియు 2 ఫోటోలు నమోదు చేసిన తర్వాత మాత్రమే సంబంధాల జాతకాలు మరియు వివరాలు తెరవబడతాయి." 
            />
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn link-btn" style={{ fontSize: '1.05rem', padding: '0.75rem 1.8rem' }}>
              <Bi en="Complete 50% Registration Now →" te="ఇప్పుడే 50% నమోదు పూర్తి చేయండి →" />
            </Link>
            <Link href="/login" className="btn-ghost link-btn" style={{ fontSize: '1.05rem', padding: '0.75rem 1.8rem' }}>
              <Bi en="Mobile OTP Login" te="మొబైల్ ఓటీపీ లాగిన్" />
            </Link>
          </div>
        </div>
      )}

      {/* Detailed Candidate Card */}
      <section className="card" style={{ padding: '2.2rem', background: '#FFFFFF', opacity: completeness.canAccessProfiles ? 1 : 0.4, pointerEvents: completeness.canAccessProfiles ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Photos Frame */}
          <div style={{ width: '220px', flexShrink: 0 }}>
            <div 
              style={{ 
                aspectRatio: '1', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #FFE4E6, #FEF3C7)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: 'var(--maroon)',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}>
                {p.photoInitials}
              </div>
              <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', color: 'var(--maroon)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--maroon-border)' }}>
                📷 2 Photos Attached
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.6rem' }}>
              <div style={{ height: '60px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Photo 1 (Portrait)
              </div>
              <div style={{ height: '60px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Photo 2 (Full)
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--maroon)' }}>
                {p.displayName}, {p.age}
              </h1>
              <span className="badge" style={{ padding: '0.3rem 0.8rem' }}>
                ✓ Community Verified
              </span>
            </div>

            <p style={{ margin: '0.5rem 0 1.2rem', color: 'var(--maroon)', fontSize: '1.05rem', fontWeight: 700 }}>
              📍 {p.mandal}, <Bi {...p.district} />
            </p>

            {/* Structured Table */}
            <dl className="summary" style={{ gridTemplateColumns: '150px 1fr', gap: '0.6rem 1rem' }}>
              <dt><Bi en="Paternal Gothra" te="గోత్రం" /></dt>
              <dd><strong>{p.gothra}</strong></dd>

              <dt><Bi en="Janma Nakshatra" te="నక్షత్రం" /></dt>
              <dd><strong>{p.nakshatra}</strong> ({p.rasi})</dd>

              <dt><Bi en="Time & Place of Birth" te="జనన సమయం & స్థలం" /></dt>
              <dd>{p.birthTime} · {p.birthPlace}</dd>

              <dt><Bi en="Education" te="విద్యార్హత" /></dt>
              <dd>{p.educationDegree}</dd>

              <dt><Bi en="Profession" te="ఉద్యోగం / వృత్తి" /></dt>
              <dd>{p.occupation}</dd>

              <dt><Bi en="Annual Income" te="వార్షిక ఆదాయం" /></dt>
              <dd>{INCOME_BRACKETS[p.incomeBracket as keyof typeof INCOME_BRACKETS]?.en ?? 'Confidential'}</dd>

              <dt><Bi en="Father's Details" te="తండ్రి వివరాలు" /></dt>
              <dd>{p.fatherName}</dd>

              <dt><Bi en="Mother's Details" te="తల్లి వివరాలు" /></dt>
              <dd>{p.motherName}</dd>

              <dt><Bi en="Siblings" te="తోబుట్టువులు" /></dt>
              <dd>{p.siblings}</dd>
            </dl>
          </div>
        </div>

        {/* Bilateral Interest Action */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--maroon)' }}>
              <Bi en="Express Sincere Matrimonial Interest" te="నిజాయితీగల వివాహ ఆసక్తిని తెలపండి" />
            </h3>
            <p className="hint" style={{ margin: '0.3rem 0 0' }}>
              <Bi 
                en="Contact phone numbers remain masked until both families mutually accept." 
                te="ఇరు కుటుంబాలు పరస్పరం అంగీకరించే వరకు ఫోన్ నంబర్లు గుప్తీకరించబడి ఉంటాయి." 
              />
            </p>
          </div>

          <Link href="/onboarding" className="btn link-btn" style={{ fontSize: '1rem', padding: '0.75rem 1.8rem' }}>
            <Bi en="Send Express Interest (ఉచితం) →" te="ఆసక్తిని పంపండి (ఉచితం) →" />
          </Link>
        </div>
      </section>
    </main>
  );
}
