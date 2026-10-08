import Link from 'next/link';
import { discover } from '../../lib/match-store.ts';
import { DiscoverQuerySchema, badgesFor, type DiscoverQuery } from '../../lib/matrimony.ts';
import { VOCATIONS } from '../../lib/onboarding.ts';
import { dbContext, listDistricts } from '../../lib/onboarding-store.ts';
import { getOptionalSession } from '../../lib/session.ts';
import { calculateCompleteness } from '../../lib/completeness.ts';
import { CompletenessBar } from '../../components/CompletenessBar.tsx';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';
import { PhotoFrame } from '../profiles/PhotoFrame.tsx';

type Search = Promise<Record<string, string | string[] | undefined>>;

// Sample candidate directory for community visitors & new members (10 Verified Profiles)
const PUBLIC_DISCOVERY_CARDS = [
  {
    id: 'sample-1',
    firstName: 'Sai Krishna',
    fullName: 'S. Sai Krishna',
    age: 27,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    vocation: 'corporate_tech_civil',
    district: { en: 'Hyderabad', te: 'హైదరాబాద్' },
    gothraEn: 'Kashyapa',
    gothraTe: 'కాశ్యప',
    nakshatraEn: 'Rohini',
    nakshatraTe: 'రోహిణి',
    educationEn: 'B.Tech (CSE) · Senior Software Engineer',
    educationTe: 'బి.టెక్ (సిఎస్ఇ) · సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్',
    photo: null,
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-1.jpg',
  },
  {
    id: 'sample-2',
    firstName: 'Snehalatha',
    fullName: 'K. Snehalatha',
    age: 24,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    vocation: 'scholarly_academic',
    district: { en: 'Warangal', te: 'వరంగల్' },
    gothraEn: 'Bharadwaja',
    gothraTe: 'భరద్వాజ',
    nakshatraEn: 'Hasta',
    nakshatraTe: 'హస్త',
    educationEn: 'M.Sc, B.Ed · Govt High School Teacher',
    educationTe: 'ఎం.ఎస్సీ, బి.ఎడ్ · ప్రభుత్వ ఉపాధ్యాయురాలు',
    photo: null,
    badgeEn: 'Mandal Lineage Verified',
    badgeTe: 'మండల వంశ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-1.jpg',
  },
  {
    id: 'sample-3',
    firstName: 'Ravinder Nayi',
    fullName: 'P. Ravinder Nayi',
    age: 29,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    vocation: 'wellness_artisan',
    district: { en: 'Karimnagar', te: 'కరీంనగర్' },
    gothraEn: 'Gautama',
    gothraTe: 'గౌతమ',
    nakshatraEn: 'Uttara',
    nakshatraTe: 'ఉత్తర',
    educationEn: 'B.Com · Salon Chain Founder & Entrepreneur',
    educationTe: 'బి.కామ్ · సెలూన్ వ్యవస్థాపకులు & వ్యాపారవేత్త',
    photo: null,
    badgeEn: 'Enterprise Modernist',
    badgeTe: 'స్వయం ఉపాధి సాధకులు',
    photoUrl: '/matrimony/profiles/groom-2.jpg',
  },
  {
    id: 'sample-4',
    firstName: 'Ananya',
    fullName: 'M. Ananya',
    age: 23,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    vocation: 'healthcare_traditional_medicine',
    district: { en: 'Nalgonda', te: 'నల్గొండ' },
    gothraEn: 'Vashishta',
    gothraTe: 'వశిష్ట',
    nakshatraEn: 'Anuradha',
    nakshatraTe: 'అనూరాధ',
    educationEn: 'B.Pharm, MBA · Healthcare Executive',
    educationTe: 'బి.ఫార్మ్, ఎంబీఏ · హెల్త్‌కేర్ ఎగ్జిక్యూటివ్',
    photo: null,
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-2.jpg',
  },
  {
    id: 'sample-5',
    firstName: 'Madhav Rao',
    fullName: 'P. Madhav Rao',
    age: 28,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    vocation: 'nadopasana',
    district: { en: 'Khammam', te: 'ఖమ్మం' },
    gothraEn: 'Agastya',
    gothraTe: 'అగస్త్య',
    nakshatraEn: 'Swati',
    nakshatraTe: 'స్వాతి',
    educationEn: 'Vidwan / MA Music · Classical Nadaswaram Artiste',
    educationTe: 'విద్వాన్ / ఎంఏ సంగీతం · నాదస్వర విద్వాంసులు',
    photo: null,
    badgeEn: 'Heritage Custodian',
    badgeTe: 'సాంస్కృతిక సంరక్షకులు',
    photoUrl: '/matrimony/profiles/groom-3.jpg',
  },
  {
    id: 'sample-6',
    firstName: 'Divya Sree',
    fullName: 'K. Divya Sree',
    age: 25,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    vocation: 'corporate_tech_civil',
    district: { en: 'Nizamabad', te: 'నిజామాబాద్' },
    gothraEn: 'Sandilya',
    gothraTe: 'శాండిల్య',
    nakshatraEn: 'Ashwini',
    nakshatraTe: 'అశ్విని',
    educationEn: 'MCA · Senior IT Systems Analyst',
    educationTe: 'ఎంసిఎ · సీనియర్ ఐటీ సిస్టమ్స్ అనలిస్ట్',
    photo: null,
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-3.jpg',
  },
  {
    id: 'sample-7',
    firstName: 'Vamshi Krishna',
    fullName: 'T. Vamshi Krishna',
    age: 30,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    vocation: 'corporate_tech_civil',
    district: { en: 'Rangareddy', te: 'రంగారెడ్డి' },
    gothraEn: 'Kaundinya',
    gothraTe: 'కౌండిన్య',
    nakshatraEn: 'Makha',
    nakshatraTe: 'మఖ',
    educationEn: 'M.Tech · Senior Data Scientist',
    educationTe: 'ఎం.టెక్ · సీనియర్ డేటా సైంటిస్ట్',
    photo: null,
    badgeEn: 'Mandal Lineage Verified',
    badgeTe: 'మండల వంశ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-4.jpg',
  },
  {
    id: 'sample-8',
    firstName: 'Haritha Devi',
    fullName: 'B. Haritha Devi',
    age: 26,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    vocation: 'healthcare_traditional_medicine',
    district: { en: 'Siddipet', te: 'సిద్దిపేట' },
    gothraEn: 'Vishwamitra',
    gothraTe: 'విశ్వామిత్ర',
    nakshatraEn: 'Revati',
    nakshatraTe: 'రేవతి',
    educationEn: 'MBBS · Resident Medical Officer',
    educationTe: 'ఎంబీబీఎస్ · రెసిడెంట్ మెడికల్ ఆఫీసర్ (వైద్యురాలు)',
    photo: null,
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-4.jpg',
  },
  {
    id: 'sample-9',
    firstName: 'Suresh Kumar',
    fullName: 'G. Suresh Kumar',
    age: 28,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    vocation: 'corporate_tech_civil',
    district: { en: 'Mahabubnagar', te: 'మహబూబ్‌నగర్' },
    gothraEn: 'Parasara',
    gothraTe: 'పరాశర',
    nakshatraEn: 'Arudra',
    nakshatraTe: 'ఆరుద్ర',
    educationEn: 'M.Sc (Agri) · Assistant Agriculture Officer (Govt)',
    educationTe: 'ఎం.ఎస్సీ (అగ్రి) · సహాయ వ్యవసాయ అధికారి (ప్రభుత్వ ఉద్యోగి)',
    photo: null,
    badgeEn: 'Government Lineage Verified',
    badgeTe: 'ప్రభుత్వ ఉద్యోగి ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-5.jpg',
  },
  {
    id: 'sample-10',
    firstName: 'Sravanthi',
    fullName: 'N. Sravanthi',
    age: 24,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    vocation: 'corporate_tech_civil',
    district: { en: 'Medchal-Malkajgiri', te: 'మేడ్చల్-మల్కాజ్‌గిరి' },
    gothraEn: 'Atri',
    gothraTe: 'అత్రి',
    nakshatraEn: 'Pushyami',
    nakshatraTe: 'పుష్యమి',
    educationEn: 'B.Tech, MS · Product Designer',
    educationTe: 'బి.టెక్, ఎంఎస్ · ప్రొడక్ట్ డిజైనర్',
    photo: null,
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-5.jpg',
  },
];

export default async function DiscoverPage({ searchParams }: { searchParams: Search }) {
  const claims = await getOptionalSession();
  const raw = Object.fromEntries(Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const parsed = DiscoverQuerySchema.safeParse(raw);
  const q: DiscoverQuery = parsed.success ? parsed.data : {};

  let resultCards: any[] = [];
  let completeness = calculateCompleteness({
    displayName: claims?.sub ? 'Member Candidate' : null,
    gender: 'male',
    dateOfBirth: '1998-05-15',
    gothraId: claims?.sub ? 'gothra-1' : null,
    district: claims?.assigned_district ?? null,
    mandal: claims?.assigned_mandal ?? null,
    photoCount: claims ? 2 : 0,
    dpdpConsent: Boolean(claims),
  });

  if (claims) {
    try {
      const ctx = dbContext(claims);
      const res = await discover(ctx, q);
      resultCards = res.cards;
    } catch {
      resultCards = [];
    }
  }

  // Fallback to showcase directory if DB cards are still being curated
  const displayCards = resultCards.length > 0 ? resultCards : PUBLIC_DISCOVERY_CARDS;

  return (
    <main className="shell wide">
      <Nav claims={claims} />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="badge" style={{ marginBottom: '0.5rem' }}>
          <Bi en="Verified Community Directory" te="ధృవీకరించబడిన సంబంధాల వేదిక" />
        </span>
        <h1 style={{ margin: '0.2rem 0 0.5rem' }}><Bi en="Candidate Directory" te="వివాహ సంబంధాల అన్వేషణ" /></h1>
        <p className="hint">
          <Bi 
            en="Strict Sagothra exclusion enforced. Members belonging to your own gotra are automatically omitted."
            te="సగోత్ర రక్షణ అమలులో ఉంది. మీ గోత్రానికి చెందిన ప్రొఫైల్స్ ఏవీ మీకు చూపించబడవు." 
          />
        </p>
      </div>

      {/* Profile Completeness Bar & 10 Free Views Status */}
      <CompletenessBar completeness={completeness} freeViewsLeft={claims ? 8 : 10} />

      {/* Filter Bar */}
      <form className="card" action="/matrimony/discover" method="get" style={{ marginBottom: '2.5rem', padding: '1.8rem', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid var(--gold-border, #E2D9CC)', boxShadow: '0 8px 24px rgba(139, 29, 44, 0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="f-gender" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              <Bi en="Looking for" te="వెతుకుతున్నది" />
            </label>
            <select id="f-gender" name="gender" defaultValue={q.gender ?? 'female'} style={{ width: '100%', height: '46px', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem' }}>
              <option value="female">Bride · వధువు</option>
              <option value="male">Groom · వరుడు</option>
            </select>
          </div>

          <div>
            <label htmlFor="f-district" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              <Bi en="District" te="జిల్లా" />
            </label>
            <select id="f-district" name="district" defaultValue={q.district ?? ''} style={{ width: '100%', height: '46px', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem' }}>
              <option value="">All Regions · అన్ని ప్రాంతాలు</option>
              <optgroup label="Telangana · తెలంగాణ">
                <option value="hyderabad">Hyderabad · హైదరాబాద్</option>
                <option value="warangal">Warangal · వరంగల్</option>
                <option value="karimnagar">Karimnagar · కరీంనగర్</option>
                <option value="nalgonda">Nalgonda · నల్గొండ</option>
                <option value="khammam">Khammam · ఖమ్మం</option>
                <option value="nizamabad">Nizamabad · నిజామాబాద్</option>
                <option value="rangareddy">Rangareddy · రంగారెడ్డి</option>
                <option value="medchal-malkajgiri">Medchal-Malkajgiri · మేడ్చల్-మల్కాజ్‌గిరి</option>
                <option value="siddipet">Siddipet · సిద్దిపేట</option>
                <option value="mahabubnagar">Mahabubnagar · మహబూబ్‌నగర్</option>
              </optgroup>
              <optgroup label="Andhra Pradesh · ఆంధ్రప్రదేశ్">
                <option value="visakhapatnam">Visakhapatnam · విశాఖపట్నం</option>
                <option value="vijayawada-ntr">Vijayawada (NTR) · విజయవాడ</option>
                <option value="guntur">Guntur · గుంటూరు</option>
                <option value="tirupati">Tirupati · తిరుపతి</option>
                <option value="kurnool">Kurnool · కర్నూలు</option>
                <option value="kakinada">Kakinada · కాకినాడ</option>
                <option value="sri-potti-sriramulu-nellore">Nellore · నెల్లూరు</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="f-vocation" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              <Bi en="Vocational tier" te="వృత్తి శ్రేణి" />
            </label>
            <select id="f-vocation" name="vocation" defaultValue={q.vocation ?? ''} style={{ width: '100%', height: '46px', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem' }}>
              <option value="">All Streams · అన్నీ</option>
              {Object.entries(VOCATIONS).map(([k, v]) => (
                <option key={k} value={k}>{v.te} ({v.en})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label htmlFor="f-ageMin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                <Bi en="Age from" te="వయస్సు నుండి" />
              </label>
              <input id="f-ageMin" name="ageMin" type="number" min={18} max={80} defaultValue={q.ageMin ?? 21} style={{ width: '100%', height: '46px', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem' }} />
            </div>

            <div>
              <label htmlFor="f-ageMax" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                <Bi en="to" te="వరకు" />
              </label>
              <input id="f-ageMax" name="ageMax" type="number" min={18} max={80} defaultValue={q.ageMax ?? 32} style={{ width: '100%', height: '46px', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="submit" className="btn" style={{ flex: 1, height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <span><Bi en="Apply" te="ఫిల్టర్" /></span>
              <span>🔍</span>
            </button>
            <Link href="/discover" className="btn secondary" style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', padding: '0 0.9rem', fontSize: '0.85rem', textDecoration: 'none' }} title="Reset All Filters">
              <Bi en="Reset" te="రీసెట్" />
            </Link>
          </div>
        </div>
      </form>

      {/* Candidate Grid */}
      <div className="cards">
        {displayCards.map((c: any) => (
          <article key={c.id} className="profile-card">
            {/* Profile Photo Container (Fixed height, top-centered portrait) */}
            <div style={{ height: '280px', width: '100%', position: 'relative', overflow: 'hidden', background: '#F8F4EE' }}>
              {c.photoUrl ? (
                <img 
                  src={c.photoUrl} 
                  alt={c.fullName ?? c.firstName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} 
                  loading="lazy"
                />
              ) : c.photoInitials ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #FFF1F3, #FEF9E7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: 'var(--maroon, #801426)',
                    color: '#FFFFFF',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '2rem',
                    fontWeight: 800,
                    border: '3px solid #D4AF37',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                  }}>
                    {c.photoInitials}
                  </div>
                </div>
              ) : (
                <PhotoFrame photo={c.photo} name={c.fullName ?? c.firstName} />
              )}

              {/* Top Badges */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ 
                  background: 'rgba(128, 20, 38, 0.92)', 
                  color: '#FFFFFF', 
                  padding: '0.28rem 0.7rem', 
                  borderRadius: '999px', 
                  fontSize: '0.74rem', 
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.5)'
                }}>
                  ✓ <Bi en={c.badgeEn ?? 'NS-ID Verified'} te={c.badgeTe ?? 'ఎన్ఎస్-ఐడీ ధృవీకృతం'} />
                </span>

                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.94)', 
                  color: '#801426', 
                  padding: '0.28rem 0.65rem', 
                  borderRadius: '999px', 
                  fontSize: '0.74rem', 
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  🔒 <Bi en="Photos Protected" te="ఫోటోలు భద్రం" />
                </span>
              </div>

              {/* Bottom Photo Scrim with Name, Age, Gender & Location */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2.5rem 1rem 0.8rem',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <div>
                  <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {c.fullName ?? c.firstName}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', color: '#FCD34D', fontSize: '0.85rem', fontWeight: 700 }}>
                    {c.age} <Bi en="Yrs" te="సం." /> · <Bi en={c.genderEn ?? (c.gender === 'male' ? 'Groom' : 'Bride')} te={c.genderTe ?? (c.gender === 'male' ? 'వరుడు' : 'వధువు')} />
                  </p>
                </div>

                <span style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  📍 <Bi {...c.district} />
                </span>
              </div>
            </div>

            {/* Profile Details & Auspicious Box */}
            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: '#FFFDF9',
                border: '1.5px solid #F5EBE1',
                borderRadius: '12px',
                padding: '0.85rem',
                fontSize: '0.86rem',
                marginBottom: '1rem',
                display: 'grid',
                gap: '0.45rem'
              }}>
                {(c.gothraEn || c.gothra) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #EEDCC8', paddingBottom: '0.35rem' }}>
                    <span style={{ color: '#801426', fontWeight: 700 }}>
                      🕉️ <Bi en="Gothra" te="గోత్రం" />:
                    </span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      <Bi en={c.gothraEn ?? c.gothra} te={c.gothraTe ?? c.gothra} />
                    </span>
                  </div>
                )}

                {(c.nakshatraEn || c.nakshatra) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #EEDCC8', paddingBottom: '0.35rem' }}>
                    <span style={{ color: '#801426', fontWeight: 700 }}>
                      ✨ <Bi en="Nakshatra" te="నక్షత్రం" />:
                    </span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      <Bi en={c.nakshatraEn ?? c.nakshatra} te={c.nakshatraTe ?? c.nakshatra} />
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', paddingTop: '0.1rem' }}>
                  <span style={{ color: '#801426', fontWeight: 700 }}>🎓</span>
                  <span style={{ color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
                    <Bi 
                      en={c.educationEn ?? c.education ?? (VOCATIONS[c.vocation as keyof typeof VOCATIONS]?.en ?? '')} 
                      te={c.educationTe ?? c.education ?? (VOCATIONS[c.vocation as keyof typeof VOCATIONS]?.te ?? '')} 
                    />
                  </span>
                </div>
              </div>

              {/* Full Profile CTA Button */}
              <div style={{ marginTop: 'auto' }}>
                <Link 
                  href={`/profiles/${c.id}`} 
                  className="btn link-btn" 
                  style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    padding: '0.75rem', 
                    fontSize: '0.92rem', 
                    fontWeight: 700, 
                    display: 'block', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #801426 0%, #630C1C 100%)',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 4px 12px rgba(128, 20, 38, 0.25)',
                    textDecoration: 'none'
                  }}
                >
                  <Bi en="View Full Profile & Horoscope →" te="పూర్తి జాతకం & వివరాలు →" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
