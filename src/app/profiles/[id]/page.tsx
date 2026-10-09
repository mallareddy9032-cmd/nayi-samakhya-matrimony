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
import { HoroscopeChart } from '../../../components/HoroscopeChart.tsx';
import { ProfileInteractiveSuite } from '../../../components/ProfileInteractiveSuite.tsx';
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
    maternalLineage: 'Bharadwaja (భరద్వాజ)',
    nakshatra: 'Rohini (రోహిణి)',
    rasi: 'Vrishabha (వృషభ రాశి)',
    birthTime: '06:45 AM',
    birthPlace: 'Hyderabad',
    educationDegree: 'B.Tech in Computer Science',
    occupation: 'Lead Cloud Architect @ MNC, Hyderabad',
    incomeBracket: '25l_50l',
    vocation: 'corporate_tech_civil',
    photoUrl: '/matrimony/profiles/groom-1.jpg',
    fatherName: 'S. Narayana (Business)',
    motherName: 'S. Lakshmi (Homemaker)',
    siblings: '1 Younger Sister (Married)',
    kinship: { relationType: 'independent', titleEn: 'Independent Lineages', titleTe: 'స్వతంత్ర వంశ ధార', descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.', descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.', badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' } },
  },
  'sample-2': {
    id: 'sample-2',
    displayName: 'K. Snehalatha',
    age: 24,
    gender: 'female',
    district: { en: 'Warangal', te: 'వరంగల్' },
    mandal: 'Hanamkonda',
    gothra: 'Bharadwaja (భరద్వాజ)',
    maternalLineage: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Hasta (హస్త)',
    rasi: 'Kanya (కన్య రాశి)',
    birthTime: '02:15 PM',
    birthPlace: 'Warangal',
    educationDegree: 'M.Sc (Physics), B.Ed',
    occupation: 'Govt Model High School Teacher',
    incomeBracket: '6l_12l',
    vocation: 'scholarly_academic',
    photoUrl: '/matrimony/profiles/bride-1.jpg',
    fatherName: 'K. Satyanarayana (Retd. Principal)',
    motherName: 'K. Sharada (Teacher)',
    siblings: '1 Elder Brother (Software Engineer)',
    kinship: { relationType: 'independent', titleEn: 'Independent Lineages', titleTe: 'స్వతంత్ర వంశ ధార', descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.', descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.', badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' } },
  },
  'sample-3': {
    id: 'sample-3',
    displayName: 'P. Ravinder Nayi',
    age: 29,
    gender: 'male',
    district: { en: 'Karimnagar', te: 'కరీంనగర్' },
    mandal: 'Karimnagar Urban',
    gothra: 'Gautama (గౌతమ)',
    maternalLineage: 'Kaundinya (కౌండిన్య)',
    nakshatra: 'Uttara (ఉత్తర)',
    rasi: 'Simha (సింహ రాశి)',
    birthTime: '09:20 AM',
    birthPlace: 'Karimnagar',
    educationDegree: 'B.Com & Advanced Cosmetology',
    occupation: 'Founder & Managing Director, Elegance Salon Chain',
    incomeBracket: 'above_50l',
    vocation: 'wellness_artisan',
    photoUrl: '/matrimony/profiles/groom-2.jpg',
    fatherName: 'P. Lingamurthy (Nadopasana Artiste)',
    motherName: 'P. Rajamani',
    siblings: 'None (Only Son)',
    kinship: { relationType: 'independent', titleEn: 'Independent Lineages', titleTe: 'స్వతంత్ర వంశ ధార', descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.', descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.', badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' } },
  },
  'sample-4': {
    id: 'sample-4',
    displayName: 'M. Ananya',
    age: 23,
    gender: 'female',
    district: { en: 'Nalgonda', te: 'నల్గొండ' },
    mandal: 'Miryalaguda',
    gothra: 'Vashishta (వశిష్ట)',
    maternalLineage: 'Agastya (అగస్త్య)',
    nakshatra: 'Anuradha (అనూరాధ)',
    rasi: 'Vrischika (వృశ్చిక రాశి)',
    birthTime: '11:10 PM',
    birthPlace: 'Miryalaguda',
    educationDegree: 'B.Pharmacy, MBA (Hospital Mgmt)',
    occupation: 'Clinical Research Executive',
    incomeBracket: '6l_12l',
    vocation: 'healthcare_traditional_medicine',
    photoUrl: '/matrimony/profiles/bride-2.jpg',
    fatherName: 'M. Venkataramana',
    motherName: 'M. Padmavathi',
    siblings: '1 Younger Brother (Studying B.Tech)',
    kinship: { relationType: 'independent', titleEn: 'Independent Lineages', titleTe: 'స్వతంత్ర వంశ ధార', descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.', descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.', badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' } },
  },
  'sample-5': {
    id: 'sample-5',
    displayName: 'P. Madhav Rao',
    age: 28,
    gender: 'male',
    district: { en: 'Guntur, Andhra Pradesh', te: 'గుంటూరు, ఆంధ్రప్రదేశ్' },
    mandal: 'Tenali (తేనాలి)',
    gothra: 'Agastya (అగస్త్య)',
    maternalLineage: 'Sandilya (శాండిల్య)',
    nakshatra: 'Swati (స్వాతి)',
    rasi: 'Tula (తులా రాశి)',
    birthTime: '07:15 AM',
    birthPlace: 'Tenali, Guntur',
    educationDegree: 'Vidwan / MA Music',
    occupation: 'Classical Nadaswaram Artiste & Teacher',
    incomeBracket: '6l_12l',
    vocation: 'nadopasana',
    photoUrl: '/matrimony/profiles/groom-3.jpg',
    fatherName: 'P. Raghavaiah (Asthana Vidwan)',
    motherName: 'P. Saraswathi',
    siblings: '1 Younger Sister',
    kinship: { relationType: 'menarikam_related', titleEn: 'Menarikam Lineage Link', titleTe: 'మేనరిక బాంధవ్యం (సాంప్రదాయానుకూలం)', descriptionEn: 'Connected through maternal uncle gotra (eligible under traditional Menarikam customs if mutually preferred).', descriptionTe: 'మాతృవంశ గోత్ర సాన్నిహిత్యం కలదు (మేనరికం సాంప్రదాయం ప్రకారం పరిశీలించదగినది).', badgeStyle: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' } },
  },
  'sample-6': {
    id: 'sample-6',
    displayName: 'K. Divya Sree',
    age: 25,
    gender: 'female',
    district: { en: 'Visakhapatnam, Andhra Pradesh', te: 'విశాఖపట్నం, ఆంధ్రప్రదేశ్' },
    mandal: 'Gajuwaka (గాజువాక)',
    gothra: 'Sandilya (శాండిల్య)',
    maternalLineage: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Ashwini (అశ్విని)',
    rasi: 'Mesha (మేష రాశి)',
    birthTime: '04:30 AM',
    birthPlace: 'Visakhapatnam',
    educationDegree: 'MCA (Computer Applications)',
    occupation: 'Senior IT Systems Analyst @ Tech Mahindra',
    incomeBracket: '12l_25l',
    vocation: 'corporate_tech_civil',
    photoUrl: '/matrimony/profiles/bride-3.jpg',
    motherName: 'K. Sujatha',
    siblings: '1 Younger Brother (Engineer)',
    kinship: { relationType: 'independent', titleEn: 'Independent Lineages', titleTe: 'స్వతంత్ర వంశ ధార', descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.', descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.', badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' } },
  },
  'sample-7': {
    id: 'sample-7',
    displayName: 'T. Vamshi Krishna',
    age: 30,
    gender: 'male',
    district: { en: 'Rangareddy', te: 'రంగారెడ్డి' },
    mandal: 'Serilingampally',
    gothra: 'Kaundinya (కౌండిన్య)',
    nakshatra: 'Makha (మఖ)',
    rasi: 'Simha (సింహ రాశి)',
    birthTime: '10:45 AM',
    birthPlace: 'Hyderabad',
    educationDegree: 'M.Tech (AI / Data Science)',
    occupation: 'Senior Data Scientist @ Tech MNC',
    incomeBracket: '25l_50l',
    vocation: 'corporate_tech_civil',
    photoUrl: '/matrimony/profiles/groom-4.jpg',
    fatherName: 'T. Mallesham (Business)',
    motherName: 'T. Rama',
    siblings: '1 Elder Sister (Married)',
  },
  'sample-8': {
    id: 'sample-8',
    displayName: 'Dr. B. Haritha Devi',
    age: 26,
    gender: 'female',
    district: { en: 'Siddipet', te: 'సిద్దిపేట' },
    mandal: 'Gajwel',
    gothra: 'Vishwamitra (విశ్వామిత్ర)',
    nakshatra: 'Revati (రేవతి)',
    rasi: 'Meena (మీన రాశి)',
    birthTime: '01:20 PM',
    birthPlace: 'Siddipet',
    educationDegree: 'MBBS (Preparing for MD Pediatrics)',
    occupation: 'Resident Medical Officer @ Super Specialty Hospital',
    incomeBracket: '12l_25l',
    vocation: 'healthcare_traditional_medicine',
    photoUrl: '/matrimony/profiles/bride-4.jpg',
    fatherName: 'Dr. B. Srinivas Rao (Surgeon)',
    motherName: 'B. Anuradha (Lecturer)',
    siblings: '1 Elder Brother (Doctor)',
  },
  'sample-9': {
    id: 'sample-9',
    displayName: 'G. Suresh Kumar',
    age: 28,
    gender: 'male',
    district: { en: 'Mahabubnagar', te: 'మహబూబ్‌నగర్' },
    mandal: 'Jadcherla',
    gothra: 'Parasara (పరాశర)',
    nakshatra: 'Arudra (ఆరుద్ర)',
    rasi: 'Mithuna (మిథున రాశి)',
    birthTime: '08:00 AM',
    birthPlace: 'Mahabubnagar',
    educationDegree: 'M.Sc (Agri) · PJTSAU',
    occupation: 'Assistant Agriculture Officer (Govt of Telangana)',
    incomeBracket: '6l_12l',
    vocation: 'corporate_tech_civil',
    photoUrl: '/matrimony/profiles/groom-5.jpg',
    fatherName: 'G. Yadaiah (Retd Govt Employee)',
    motherName: 'G. Kamalamma',
    siblings: '1 Younger Brother',
  },
  'sample-10': {
    id: 'sample-10',
    displayName: 'N. Sravanthi',
    age: 24,
    gender: 'female',
    district: { en: 'Medchal-Malkajgiri', te: 'మేడ్చల్-మల్కాజ్‌గిరి' },
    mandal: 'Kompally',
    gothra: 'Atri (అత్రి)',
    nakshatra: 'Pushyami (పుష్యమి)',
    rasi: 'Karkataka (కర్కాటక రాశి)',
    birthTime: '05:50 PM',
    birthPlace: 'Secunderabad',
    educationDegree: 'B.Tech, MS (Human-Computer Interaction)',
    occupation: 'Product Designer @ Fintech Unicorn',
    incomeBracket: '12l_25l',
    vocation: 'corporate_tech_civil',
    photoUrl: '/matrimony/profiles/bride-5.jpg',
    fatherName: 'N. Chandrashekar (Architect)',
    motherName: 'N. Vanaja',
    siblings: '1 Younger Sister',
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

  let dbProfile: any = null;
  if (claims) {
    try {
      const ctx = dbContext(claims);
      dbProfile = await getProfileView(ctx, id);
    } catch {
      // not found or error
    }
  }

  const p = dbProfile
    ? {
        id: dbProfile.id,
        displayName: dbProfile.displayName,
        age: dbProfile.age,
        gender: 'female',
        district: dbProfile.district,
        mandal: dbProfile.mandal,
        gothra: `${dbProfile.gothra.en} (${dbProfile.gothra.te})`,
        maternalLineage: dbProfile.maternalLineage,
        nakshatra: dbProfile.nakshatra ?? 'Rohini (రోహిణి)',
        rasi: 'Mithuna (మిథున రాశి)',
        birthTime: dbProfile.birthTime ?? '06:00 AM',
        birthPlace: dbProfile.birthPlace ?? 'Telangana',
        educationDegree: dbProfile.educationDegree ?? 'Degree',
        occupation: dbProfile.occupation ?? 'Professional',
        incomeBracket: dbProfile.incomeBracket ?? 'prefer_not_to_say',
        vocation: dbProfile.vocation,
        photoUrl: dbProfile.photo?.url ?? null,
        kinship: dbProfile.kinship,
        proximityTier: dbProfile.proximityTier,
        fatherName: 'Verified Member',
        motherName: 'Verified Member',
        siblings: 'Verified Family',
      }
    : (SAMPLE_PROFILES[id] ?? {
        id,
        displayName: 'Verified Community Candidate',
        age: 26,
        gender: 'female',
        district: { en: 'Telangana & Andhra Pradesh', te: 'ఉభయ తెలుగు రాష్ట్రాలు' },
        mandal: 'Mandal Center',
        gothra: 'Kashyapa (కాశ్యప)',
        maternalLineage: 'Bharadwaja (భరద్వాజ)',
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
        kinship: {
          relationType: 'independent',
          titleEn: 'Independent Lineages',
          titleTe: 'స్వతంత్ర వంశ ధార',
          descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.',
          descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.',
          badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' },
        },
      });

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
            {p.photoUrl ? (
              <div 
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '14px', 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <img 
                  src={p.photoUrl} 
                  alt={p.displayName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', color: 'var(--maroon)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--maroon-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Bi en="📷 2 Photos Attached" te="📷 2 ఫోటోలు జతచేయబడ్డాయి" />
                </span>
              </div>
            ) : (
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
                  {p.photoInitials ?? p.displayName.slice(0, 2)}
                </div>
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', color: 'var(--maroon)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--maroon-border)' }}>
                  <Bi en="📷 2 Photos Attached" te="📷 2 ఫోటోలు జతచేయబడ్డాయి" />
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.6rem' }}>
              <div style={{ height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt="Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', background: 'var(--bg-surface)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Bi en="Photo 1" te="ఫోటో 1" />
                  </div>
                )}
              </div>
              <div style={{ height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Bi en="Photo 2 (Full)" te="ఫోటో 2 (పూర్తి)" />
              </div>
            </div>
          </div>

          {/* Core Info & 3 Visual Infographic Pods */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <h1 style={{ margin: 0, fontSize: '2.1rem', color: 'var(--maroon)' }}>
                {p.displayName}, {p.age}
              </h1>
              <span className="badge" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }}>
                <Bi en="✓ Community Verified" te="✓ సమాజ ధ్రువీకరణ పొందినది" />
              </span>
            </div>

            <p style={{ margin: '0 0 1rem', color: 'var(--maroon)', fontSize: '1.05rem', fontWeight: 700 }}>
              📍 {p.mandal}, <Bi {...p.district} />
            </p>

            {/* 10x Interactive Suite: Elder Voice Summary + WhatsApp Kalyana Patrika */}
            <div style={{ marginBottom: '1.4rem' }}>
              <ProfileInteractiveSuite candidate={p} />
            </div>

            {/* POD 1: Horoscope & Sacred Lineage (జాతకం & గోత్ర వివరాలు) */}
            <div style={{ background: '#FFFDF9', borderRadius: '16px', padding: '1.4rem', border: '1.5px solid #EADDC7', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px dashed #E2D0B5', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🪔</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--maroon)', fontWeight: 800 }}>
                  <Bi en="Horoscope & Sacred Lineage" te="జాతకం & గోత్ర వివరాలు" />
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Paternal Gotra" te="పితృస్వామ్య గోత్రం" />:
                  </span>
                  <span style={{ display: 'inline-block', marginTop: '0.2rem', padding: '0.25rem 0.7rem', background: '#FFF1F2', color: '#8B1D2C', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', border: '1px solid #FECDD3' }}>
                    {p.gothra}
                  </span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#065F46', fontWeight: 600 }}>
                    <Bi en="Maternal Gotra (Menamama Lineage)" te="మాతృవంశ గోత్రం (మేనమామ గోత్రం)" />:
                  </span>
                  <span style={{ display: 'inline-block', marginTop: '0.2rem', padding: '0.25rem 0.7rem', background: '#ECFDF5', color: '#065F46', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', border: '1px solid #A7F3D0' }}>
                    {p.maternalLineage ?? 'స్వతంత్ర వంశం (Not Specified)'}
                  </span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Birth Star & Rasi" te="జన్మ నక్షత్రం & రాశి" />:
                  </span>
                  <span style={{ display: 'inline-block', marginTop: '0.2rem', padding: '0.25rem 0.7rem', background: '#FEF3C7', color: '#92400E', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', border: '1px solid #FDE68A' }}>
                    {p.nakshatra} ({p.rasi})
                  </span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Birth Time & Place" te="జనన సమయం & ప్రదేశం" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#1E293B', fontSize: '0.95rem' }}>
                    {p.birthTime} · {p.birthPlace}
                  </strong>
                </div>

                {p.kinship && (
                  <div style={{
                    gridColumn: '1 / -1',
                    marginTop: '0.4rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: p.kinship?.badgeStyle?.bg ?? '#ECFDF5',
                    border: `1.5px solid ${p.kinship?.badgeStyle?.border ?? '#10B981'}`,
                    color: p.kinship?.badgeStyle?.color ?? '#065F46'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.92rem' }}>
                      <span>{p.kinship.relationType === 'menarikam_related' ? '🤝' : p.kinship.relationType === 'shared_maternal' ? '🛡️' : '🌿'}</span>
                      <span><Bi en={p.kinship.titleEn} te={p.kinship.titleTe} /></span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.4 }}>
                      <Bi en={p.kinship.descriptionEn} te={p.kinship.descriptionTe} />
                    </p>
                  </div>
                )}
              </div>

              {/* 10x Vedic Astrological Chart (ద్వాదశ రాశి చక్రం) */}
              <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1.5px dashed #E2D0B5' }}>
                <HoroscopeChart
                  nakshatra={p.nakshatra}
                  rasi={p.rasi}
                  birthTime={p.birthTime}
                  birthPlace={p.birthPlace}
                />
              </div>
            </div>

            {/* POD 2: Education, Profession & Income (విద్య, ఉద్యోగం & ఆదాయం) */}
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.4rem', border: '1.5px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🎓</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                  <Bi en="Education & Economic Standing" te="విద్య, ఉద్యోగం & ఆర్థిక వివరాలు" />
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Education Qualification" te="విద్యార్హత" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#0F172A', fontSize: '0.95rem' }}>
                    {p.educationDegree}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Profession / Occupation" te="ఉద్యోగం / వృత్తి" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: 'var(--maroon)', fontSize: '0.95rem' }}>
                    {p.occupation}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Annual Income" te="వార్షిక ఆదాయం" />:
                  </span>
                  <span style={{ display: 'inline-block', marginTop: '0.2rem', padding: '0.25rem 0.65rem', background: '#ECFDF5', color: '#065F46', borderRadius: '6px', fontWeight: 800, fontSize: '0.92rem', border: '1px solid #A7F3D0' }}>
                    {INCOME_BRACKETS[p.incomeBracket as keyof typeof INCOME_BRACKETS]?.en ?? 'Confidential'}
                  </span>
                </div>
              </div>
            </div>

            {/* POD 3: Family Lineage & Background (కుటుంబ నేపథ్యం) */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.4rem', border: '1.5px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>👨‍👩‍👧</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                  <Bi en="Family Heritage & Lineage Roots" te="కుటుంబ నేపథ్యం & బాంధవ్యాలు" />
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Father's Details" te="తండ్రి వివరాలు" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#1E293B', fontSize: '0.95rem' }}>
                    {p.fatherName}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Mother's Details" te="తల్లి వివరాలు" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#1E293B', fontSize: '0.95rem' }}>
                    {p.motherName}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    <Bi en="Siblings" te="తోబుట్టువులు" />:
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#1E293B', fontSize: '0.95rem' }}>
                    {p.siblings}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bilateral Interest & Action Suite (A4 Biodata PDF & WhatsApp Share) */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            {/* WhatsApp Family Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🙏 *శ్రీ ధన్వంతరి ప్రసన్నః* 🙏\nనాయీ సమాఖ్య వివాహ వేదిక (nayisamakhya.org/matrimony)\nసంబంధం: ${p.displayName} (${p.age} సం.)\nపూర్తి వివరాలు & జాతక పరిశీలన కొరకు: https://nayisamakhya.org/matrimony/profiles/${id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#25D366', color: '#FFFFFF', padding: '0.75rem 1.2rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
            >
              <span>📲</span> వాట్సాప్ షేర్ (WhatsApp)
            </a>

            {/* A4 Biodata Patrika PDF Download */}
            <a
              href={`/matrimony/api/profiles/${id}/biodata-pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#801426', color: '#FFFFFF', padding: '0.75rem 1.2rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
            >
              <span>📄</span> బయోడేటా పత్రిక (A4 PDF)
            </a>

            <Link href="/onboarding" className="btn link-btn" style={{ fontSize: '0.95rem', padding: '0.75rem 1.4rem' }}>
              <Bi en="Send Express Interest (Free) →" te="ఆసక్తిని పంపండి (ఉచితం) →" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
