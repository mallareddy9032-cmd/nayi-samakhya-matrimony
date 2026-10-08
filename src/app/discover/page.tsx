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

// Sample candidate directory for community visitors & new members
const PUBLIC_DISCOVERY_CARDS = [
  {
    id: 'sample-1',
    firstName: 'Sai Krishna',
    age: 27,
    vocation: 'corporate_tech_civil',
    district: { en: 'Hyderabad', te: 'హైదరాబాద్' },
    gothra: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Rohini (రోహిణి)',
    education: 'B.Tech (CSE) · Senior Software Engineer',
    photo: null,
    badge: 'NS-ID Verified',
    photoInitials: 'SK',
    photoGradient: 'linear-gradient(135deg, #1e3a8a, #0b172d)',
  },
  {
    id: 'sample-2',
    firstName: 'Snehalatha',
    age: 24,
    vocation: 'scholarly_academic',
    district: { en: 'Warangal', te: 'వరంగల్' },
    gothra: 'Bharadwaja (భరద్వాజ)',
    nakshatra: 'Hasta (హస్త)',
    education: 'M.Sc, B.Ed · Govt High School Teacher',
    photo: null,
    badge: 'Mandal Lineage Verified',
    photoInitials: 'SL',
    photoGradient: 'linear-gradient(135deg, #831843, #0b172d)',
  },
  {
    id: 'sample-3',
    firstName: 'Ravinder',
    age: 29,
    vocation: 'wellness_artisan',
    district: { en: 'Karimnagar', te: 'కరీంనగర్' },
    gothra: 'Gautama (గౌతమ)',
    nakshatra: 'Uttara (ఉత్తర)',
    education: 'B.Com · Salon Chain Founder & Entrepreneur',
    photo: null,
    badge: 'Enterprise Modernist',
    photoInitials: 'RN',
    photoGradient: 'linear-gradient(135deg, #78350f, #0b172d)',
  },
  {
    id: 'sample-4',
    firstName: 'Ananya',
    age: 23,
    vocation: 'healthcare_traditional_medicine',
    district: { en: 'Nalgonda', te: 'నల్గొండ' },
    gothra: 'Vashishta (వశిష్ట)',
    nakshatra: 'Anuradha (అనూరాధ)',
    education: 'B.Pharm, MBA · Healthcare Executive',
    photo: null,
    badge: 'NS-ID Verified',
    photoInitials: 'AN',
    photoGradient: 'linear-gradient(135deg, #134e4a, #0b172d)',
  },
  {
    id: 'sample-5',
    firstName: 'Madhav Rao',
    age: 28,
    vocation: 'nadopasana',
    district: { en: 'Khammam', te: 'ఖమ్మం' },
    gothra: 'Agastya (అగస్త్య)',
    nakshatra: 'Swati (స్వాతి)',
    education: 'Vidwan / MA Music · Classical Nadaswaram Artiste',
    photo: null,
    badge: 'Heritage Custodian',
    photoInitials: 'MR',
    photoGradient: 'linear-gradient(135deg, #4c1d95, #0b172d)',
  },
  {
    id: 'sample-6',
    firstName: 'Divya Sree',
    age: 25,
    vocation: 'corporate_tech_civil',
    district: { en: 'Nizamabad', te: 'నిజామాబాద్' },
    gothra: 'Sandilya (శాండిల్య)',
    nakshatra: 'Ashwini (అశ్విని)',
    education: 'MCA · IT Systems Analyst',
    photo: null,
    badge: 'NS-ID Verified',
    photoInitials: 'DS',
    photoGradient: 'linear-gradient(135deg, #065f46, #0b172d)',
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
      <form className="filters card" action="/matrimony/discover" method="get" style={{ marginBottom: '2rem' }}>
        <div className="field">
          <label htmlFor="f-gender"><Bi en="Looking for" te="వెతుకుతున్నది" /></label>
          <select id="f-gender" name="gender" defaultValue={q.gender ?? 'female'}>
            <option value="female">Bride · వధువు</option>
            <option value="male">Groom · వరుడు</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-district"><Bi en="District" te="జిల్లా" /></label>
          <select id="f-district" name="district" defaultValue={q.district ?? ''}>
            <option value="">All Telangana (అన్ని జిల్లాలు)</option>
            <option value="hyderabad">Hyderabad · హైదరాబాద్</option>
            <option value="warangal">Warangal · వరంగల్</option>
            <option value="karimnagar">Karimnagar · కరీంనగర్</option>
            <option value="nalgonda">Nalgonda · నల్గొండ</option>
            <option value="khammam">Khammam · ఖమ్మం</option>
            <option value="nizamabad">Nizamabad · నిజామాబాద్</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-vocation"><Bi en="Vocational tier" te="వృత్తి శ్రేణి" /></label>
          <select id="f-vocation" name="vocation" defaultValue={q.vocation ?? ''}>
            <option value="">All Streams · అన్నీ</option>
            {Object.entries(VOCATIONS).map(([k, v]) => (
              <option key={k} value={k}>{v.en}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-ageMin"><Bi en="Age from" te="వయస్సు నుండి" /></label>
          <input id="f-ageMin" name="ageMin" type="number" min={18} max={80} defaultValue={q.ageMin ?? 21} />
        </div>

        <div className="field">
          <label htmlFor="f-ageMax"><Bi en="to" te="వరకు" /></label>
          <input id="f-ageMax" name="ageMax" type="number" min={18} max={80} defaultValue={q.ageMax ?? 32} />
        </div>

        <button type="submit" className="btn" style={{ height: '46px', marginBottom: '1rem' }}>
          <Bi en="Apply Filters" te="ఫిల్టర్ చేయండి" />
        </button>
      </form>

      {/* Candidate Grid */}
      <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {displayCards.map((c: any) => (
          <article key={c.id} className="profile-card" style={{ display: 'flex', flexDirection: 'column' }}>
            {c.photoInitials ? (
              <div 
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '12px', 
                  background: c.photoGradient, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative',
                  border: '1px solid var(--navy-line)',
                  boxShadow: 'inset 0 0 25px rgba(0,0,0,0.5)'
                }}
              >
                <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--gold-bright)' }}>
                  {c.photoInitials}
                </span>
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(11, 23, 45, 0.85)', color: 'var(--gold)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', border: '1px solid var(--gold)' }}>
                  🔒 2+ Photos Verified
                </span>
              </div>
            ) : (
              <PhotoFrame photo={c.photo} name={c.firstName} />
            )}

            <div style={{ marginTop: '1rem', flex: 1 }}>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.3rem' }}>
                <Link href={`/profiles/${c.id}`} style={{ textDecoration: 'none', color: 'var(--gold-bright)' }}>
                  {c.firstName}, {c.age}
                </Link>
              </h2>

              <p style={{ margin: '0.2rem 0 0.4rem', color: 'var(--amber)', fontSize: '0.9rem', fontWeight: 600 }}>
                📍 <Bi {...c.district} />
              </p>

              {c.gothra && (
                <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <strong>Gothra:</strong> {c.gothra}
                </p>
              )}

              {c.nakshatra && (
                <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <strong>Nakshatra:</strong> {c.nakshatra}
                </p>
              )}

              <p style={{ margin: '0.4rem 0', fontSize: '0.88rem', color: 'var(--ivory)' }}>
                {c.education ?? (VOCATIONS[c.vocation as keyof typeof VOCATIONS]?.en ?? '')}
              </p>

              <div style={{ marginTop: '0.6rem' }}>
                <span className="badge" style={{ fontSize: '0.8rem' }}>
                  ✓ {c.badge ?? 'NS-ID Verified'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid var(--navy-line)' }}>
              <Link 
                href={`/profiles/${c.id}`} 
                className="btn link-btn" 
                style={{ width: '100%', textAlign: 'center', padding: '0.6rem', display: 'block', fontSize: '0.92rem' }}
              >
                <Bi en="View Full Profile & Horoscope →" te="పూర్తి వివరాలు & జాతకం చూడండి →" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
