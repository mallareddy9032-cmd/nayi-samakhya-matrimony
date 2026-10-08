import Link from 'next/link';
import { getOptionalSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';
import { AuspiciousHeader } from './onboarding/AuspiciousHeader.tsx';

// Sample preview profiles representing verified Telangana community matches
const FEATURED_PROFILES = [
  {
    id: 'sample-1',
    name: 'S. Sai Krishna',
    age: 27,
    gender: 'Groom · వరుడు',
    gothra: 'Kashyapa (కాశ్యప)',
    nakshatra: 'Rohini (రోహిణి)',
    district: 'Hyderabad',
    districtTe: 'హైదరాబాద్',
    education: 'B.Tech (CSE) · Senior Software Engineer',
    vocation: 'Corporate / Tech Professional',
    vocationTe: 'సాంకేతిక రంగం',
    badge: 'NS-ID Verified',
    photoInitials: 'SK',
    photoGradient: 'linear-gradient(135deg, #1e3a8a, #0b172d)',
  },
  {
    id: 'sample-2',
    name: 'K. Snehalatha',
    age: 24,
    gender: 'Bride · వధువు',
    gothra: 'Bharadwaja (భరద్వాజ)',
    nakshatra: 'Hasta (హస్త)',
    district: 'Warangal',
    districtTe: 'వరంగల్',
    education: 'M.Sc, B.Ed · Govt High School Teacher',
    vocation: 'Government & Academic',
    vocationTe: 'విద్యా రంగం',
    badge: 'Mandal Lineage Verified',
    photoInitials: 'SL',
    photoGradient: 'linear-gradient(135deg, #831843, #0b172d)',
  },
  {
    id: 'sample-3',
    name: 'P. Ravinder Nayi',
    age: 29,
    gender: 'Groom · వరుడు',
    gothra: 'Gautama (గౌతమ)',
    nakshatra: 'Uttara (ఉత్తర)',
    district: 'Karimnagar',
    districtTe: 'కరీంనగర్',
    education: 'B.Com · Salon Chain Founder & Entrepreneur',
    vocation: 'Soundarya & Salon Founder',
    vocationTe: 'సెలూన్ వ్యవస్థాపకులు',
    badge: 'Enterprise Modernist',
    photoInitials: 'RN',
    photoGradient: 'linear-gradient(135deg, #78350f, #0b172d)',
  },
  {
    id: 'sample-4',
    name: 'M. Ananya',
    age: 23,
    gender: 'Bride · వధువు',
    gothra: 'Vashishta (వశిష్ట)',
    nakshatra: 'Anuradha (అనూరాధ)',
    district: 'Nalgonda',
    districtTe: 'నల్గొండ',
    education: 'B.Pharm, MBA · Healthcare Executive',
    vocation: 'Healthcare & Wellness',
    vocationTe: 'ఆరోగ్య సంరక్షణ',
    badge: 'NS-ID Verified',
    photoInitials: 'AN',
    photoGradient: 'linear-gradient(135deg, #134e4a, #0b172d)',
  },
];

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nalgonda', 'Khammam', 'Nizamabad',
  'Rangareddy', 'Medchal-Malkajgiri', 'Siddipet', 'Suryapet', 'Mahabubnagar',
  'Adilabad', 'Bhadradri Kothagudem', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
  'Jogulamba Gadwal', 'Kamareddy', 'Komaram Bheem Asifabad', 'Mahabubabad',
  'Mancherial', 'Medak', 'Mulugu', 'Nagarkurnool', 'Narayanpet', 'Nirmal',
  'Peddapalli', 'Rajanna Sircilla', 'Sangareddy', 'Vikarabad', 'Wanaparthy',
  'Hanamkonda', 'Yadadri Bhuvanagiri'
];

export default async function Home() {
  const session = await getOptionalSession();

  return (
    <main className="shell wide">
      <Nav claims={session} />
      
      {/* 1. Auspicious Cultural Crown */}
      <AuspiciousHeader />

      {/* 2. Hero Headline & Quick Match Finder Bar */}
      <section style={{ textAlign: 'center', margin: '1.5rem auto 2.5rem', maxWidth: '880px' }}>
        <span className="badge" style={{ marginBottom: '0.8rem', padding: '0.35rem 1rem', fontSize: '0.9rem', letterSpacing: '0.04em' }}>
          <Bi en="Sovereign Community Matrimonial Service" te="నాయీ సమాఖ్య అధికారిక కల్యాణ వేదిక" />
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', margin: '0.5rem 0 1rem', lineHeight: '1.2' }}>
          <Bi en="Telangana Nayi-Brahmin Matrimonial Alliance" te="తెలంగాణ నాయీ బ్రాహ్మణ కల్యాణ వేదిక" />
        </h1>
        <p className="lead" style={{ fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '780px', margin: '0 auto 2rem' }}>
          <Bi 
            en="Connecting respected families across 33 Telangana districts. Guarded by DB-level Sagothra exclusion, authentic horoscope matching, and bilateral contact privacy under DPDP Act 2023." 
            te="తెలంగాణ 33 జిల్లాల నాయీ బ్రాహ్మణ కుటుంబాలకు గౌరవప్రదమైన సంబంధాలు. సగోత్ర రక్షణ, జాతక వివరాలు మరియు పూర్తి చట్టబద్ధమైన గోప్యతతో నడిచే అధికారిక వేదిక." 
          />
        </p>

        {/* Quick Search Widget */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'left', borderTop: '3px solid var(--gold-bright)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--gold-bright)', fontSize: '1.2rem' }}>✦</span>
            <strong style={{ fontSize: '1.1rem' }}>
              <Bi en="Quick Profile Search across Telangana" te="తెలంగాణ సంబంధాల శోధన" />
            </strong>
          </div>
          <form action="/matrimony/discover" method="get" className="filters" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field">
              <label htmlFor="hero-gender"><Bi en="Looking For" te="వెతుకుతున్నది" /></label>
              <select id="hero-gender" name="gender" defaultValue="female">
                <option value="female">Bride · వధువు</option>
                <option value="male">Groom · వరుడు</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="hero-district"><Bi en="Native District" te="జిల్లా" /></label>
              <select id="hero-district" name="district">
                <option value="">All 33 Districts (అన్ని జిల్లాలు)</option>
                {TELANGANA_DISTRICTS.map((d) => (
                  <option key={d} value={d.toLowerCase().replace(/\s+/g, '-')}>{d}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="hero-vocation"><Bi en="Profession / Stream" te="వృత్తి శ్రేణి" /></label>
              <select id="hero-vocation" name="vocation">
                <option value="">All Professions (అన్నీ)</option>
                <option value="corporate_tech_civil">Corporate & IT Software</option>
                <option value="government">Government & Public Sector</option>
                <option value="wellness_artisan">Salon Entrepreneur / Stylist</option>
                <option value="healthcare">Healthcare & Medicine</option>
                <option value="nadopasana">Nadopasana / Classical</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="hero-age"><Bi en="Age Preference" te="వయస్సు" /></label>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input id="hero-age" name="ageMin" type="number" min={18} max={70} defaultValue={21} style={{ width: '50%' }} />
                <span>-</span>
                <input name="ageMax" type="number" min={18} max={70} defaultValue={32} style={{ width: '50%' }} />
              </div>
            </div>

            <button type="submit" className="btn" style={{ height: '46px', alignSelf: 'end', marginBottom: '1rem', whiteSpace: 'nowrap' }}>
              <Bi en="Search Profiles 🔍" te="సంబంధాలు చూడండి 🔍" />
            </button>
          </form>
        </div>

        {/* Primary Call to Action Buttons */}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link href="/onboarding" className="btn link-btn" style={{ fontSize: '1.1rem', padding: '0.85rem 2rem', boxShadow: '0 4px 20px rgba(236, 201, 75, 0.25)' }}>
            <Bi en="Register Free Matrimonial Profile →" te="ఉచిత వివాహ ప్రొఫైల్ నమోదు చేసుకోండి →" />
          </Link>
          <Link href="/login" className="btn-ghost link-btn" style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}>
            <Bi en="Candidate & Parent Login" te="సభ్యులు & తల్లిదండ్రుల లాగిన్" />
          </Link>
        </div>
      </section>

      {/* 3. Featured Verified Candidate Showcase */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ marginBottom: '0.4rem' }}>
              <Bi en="Verified Profiles Showcase" te="ధృవీకరించబడిన ప్రొఫైల్‌లు" />
            </span>
            <h2 style={{ fontSize: '1.9rem', margin: '0.2rem 0' }}>
              <Bi en="Recently Verified Community Profiles" te="ఇటీవల చేరిన సముదాయ సంబంధాలు" />
            </h2>
            <p className="hint">
              <Bi en="Every profile is verified by local Mandal Lineage Coordinators across Telangana." te="ప్రతి ప్రొఫైల్ మండల సమన్వయకర్తల ద్వారా క్షేత్రస్థాయిలో ధృవీకరించబడుతుంది." />
            </p>
          </div>
          <Link href="/discover" className="btn-ghost link-btn" style={{ fontSize: '0.95rem' }}>
            <Bi en="View All Matches →" te="అన్ని సంబంధాలు చూడండి →" />
          </Link>
        </div>

        <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {FEATURED_PROFILES.map((p) => (
            <article key={p.id} className="profile-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Photo Avatar / Frame */}
              <div 
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '12px', 
                  background: p.photoGradient, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative',
                  border: '1px solid var(--navy-line)',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
                }}
              >
                <span style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--gold-bright)', letterSpacing: '0.05em' }}>
                  {p.photoInitials}
                </span>
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'rgba(11, 23, 45, 0.85)', 
                    color: 'var(--gold)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    border: '1px solid var(--gold)' 
                  }}
                >
                  🔒 Photo Protected
                </span>
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    left: '10px', 
                    background: 'rgba(11, 23, 45, 0.85)', 
                    color: 'var(--ivory)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem' 
                  }}
                >
                  {p.gender}
                </span>
              </div>

              {/* Profile Details */}
              <div style={{ marginTop: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--ivory)' }}>
                    {p.name}, {p.age}
                  </h3>
                </div>

                <p style={{ margin: '0.4rem 0', color: 'var(--amber)', fontSize: '0.9rem', fontWeight: 600 }}>
                  📍 {p.district} ({p.districtTe})
                </p>

                <p style={{ margin: '0.3rem 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <strong>Gothra:</strong> {p.gothra}
                </p>
                <p style={{ margin: '0.3rem 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <strong>Nakshatra:</strong> {p.nakshatra}
                </p>
                <p style={{ margin: '0.3rem 0', fontSize: '0.88rem', color: 'var(--ivory)' }}>
                  🎓 {p.education}
                </p>

                <div style={{ marginTop: '0.8rem' }}>
                  <span className="badge" style={{ fontSize: '0.78rem' }}>
                    ✓ {p.badge}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid var(--navy-line)' }}>
                <Link href="/onboarding" className="btn link-btn" style={{ width: '100%', textAlign: 'center', padding: '0.55rem', fontSize: '0.9rem', display: 'block' }}>
                  <Bi en="Express Interest · సంప్రదించండి" te="ఆసక్తిని తెలపండి" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Pillars of Cultural & Legal Integrity */}
      <section style={{ margin: '4rem 0 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
          <Bi en="Why Nayi Samakhya Matrimony?" te="ఈ కల్యాణ వేదిక విశిష్టతలు" />
        </h2>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          <article className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
              <Bi en="Strict Sagothra Exclusion & Lineage Honour" te="సగోత్ర రక్షణ & వంశ గౌరవం" />
            </h3>
            <p className="lead" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              <Bi 
                en="Same-gothra alliances are strictly prohibited at the database schema level. Matches sharing your paternal Gothra will never be shown, preserving our ancient sacred gotra lineages across generations."
                te="డేటాబేస్ స్థాయిలో సగోత్ర సంబంధాల సంపూర్ణ నిషేధం. మీ పితృస్వామ్య గోత్రానికి చెందిన ప్రొఫైల్స్ ఏవీ మీకు చూపించబడవు; మన వంశ పవిత్రత మరియు సంప్రదాయం సంపూర్ణంగా రక్షించబడుతుంది."
              />
            </p>
          </article>

          <article className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
              <Bi en="DPDP Act 2023 Compliant · Encrypted Contacts" te="చట్టబద్ధమైన గోప్యత & ఫోన్ నంబర్ రక్షణ" />
            </h3>
            <p className="lead" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              <Bi 
                en="Candidate mobile numbers, WhatsApp, and residential addresses are AES-256 encrypted. Contact details remain completely invisible and unlock ONLY when both families mutually accept."
                te="అభ్యర్థుల ఫోన్, వాట్సాప్ మరియు ఇంటి చిరునామాలు సైబర్ ఎన్‌క్రిప్షన్‌తో భద్రంగా ఉంటాయి. ఇరు కుటుంబాలు పరస్పరం ఆసక్తి వ్యక్తం చేసి సమ్మతించిన తర్వాతే నంబర్లు విడుదలవుతాయి."
              />
            </p>
          </article>

          <article className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
              <Bi en="589 Mandal Lineage Coordinators" te="589 మండల సమన్వయకర్తల నెట్‌వర్క్" />
            </h3>
            <p className="lead" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              <Bi 
                en="Real grassroots verification in every mandal across all 33 Telangana districts. Our local community coordinators cross-verify identity, family background, and lineage."
                te="తెలంగాణలోని మొత్తం 33 జిల్లాల 589 మండలాల్లో నియమించబడిన స్థానిక నాయీ సమాఖ్య సమన్వయకర్తల ద్వారా అభ్యర్థుల కుటుంబ నేపథ్యం మరియు గుర్తింపు ప్రత్యక్షంగా ధృవీకరించబడుతుంది."
              />
            </p>
          </article>

          <article className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
              <Bi en="Zero Commercial Brokerage · No Dowry" te="ఉచిత వేదిక · కట్నకానుకల రహిత సమాజం" />
            </h3>
            <p className="lead" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              <Bi 
                en="Organized under the nonprofit welfare trust of Nayi Samakhya. No private brokers, no commission agents, and a strict community pledge against dowry."
                te="నాయీ సమాఖ్య ప్రజా సంక్షేమ ధ్యేయంతో నడిచే వేదిక. ఎటువంటి ప్రైవేట్ దళారులు, కమీషన్ ఏజెంట్లు ఉండరు. కట్నరహిత, ఆత్మగౌరవ వివాహాలను ప్రోత్సహించడం మన ముఖ్య ఉద్దేశం."
              />
            </p>
          </article>
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ textAlign: 'center', padding: '2.5rem 1rem 1.5rem', borderTop: '1px solid var(--navy-line)', marginTop: '3rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
          <Bi en="Nayi Samakhya Telangana · Sovereign Matrimonial Alliance" te="నాయీ సమాఖ్య తెలంగాణ · అధికారిక కల్యాణ వేదిక" />
        </p>
        <p className="hint" style={{ fontSize: '0.85rem' }}>
          <Bi 
            en="Headquarters: Hyderabad, Telangana · For assistance, contact your Mandal Lineage Coordinator" 
            te="ప్రధాన కార్యాలయం: హైదరాబాద్, తెలంగాణ · సహాయం కోసం మీ మండల సమన్వయకర్తను సంప్రదించండి" 
          />
        </p>
      </footer>
    </main>
  );
}
