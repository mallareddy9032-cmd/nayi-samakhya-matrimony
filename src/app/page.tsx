import Link from 'next/link';
import { getOptionalSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';
import { AuspiciousHeader } from './onboarding/AuspiciousHeader.tsx';

// 10 Sample candidates representing community matches across Telangana with real photos
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
    education: 'B.Tech (CSE) · Lead Cloud Architect',
    vocation: 'Corporate / Tech Professional',
    vocationTe: 'సాంకేతిక రంగం',
    badge: 'NS-ID Verified',
    photoUrl: '/matrimony/profiles/groom-1.jpg',
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
    photoUrl: '/matrimony/profiles/bride-1.jpg',
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
    photoUrl: '/matrimony/profiles/groom-2.jpg',
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
    photoUrl: '/matrimony/profiles/bride-2.jpg',
  },
  {
    id: 'sample-5',
    name: 'P. Madhav Rao',
    age: 28,
    gender: 'Groom · వరుడు',
    gothra: 'Agastya (అగస్త్య)',
    nakshatra: 'Swati (స్వాతి)',
    district: 'Khammam',
    districtTe: 'ఖమ్మం',
    education: 'Vidwan / MA Music · Classical Nadaswaram Artiste',
    vocation: 'Nadopasana Heritage',
    vocationTe: 'నాదోపాసన కళాకారులు',
    badge: 'Heritage Custodian',
    photoUrl: '/matrimony/profiles/groom-3.jpg',
  },
  {
    id: 'sample-6',
    name: 'K. Divya Sree',
    age: 25,
    gender: 'Bride · వధువు',
    gothra: 'Sandilya (శాండిల్య)',
    nakshatra: 'Ashwini (అశ్విని)',
    district: 'Nizamabad',
    districtTe: 'నిజామాబాద్',
    education: 'MCA · Senior IT Systems Analyst',
    vocation: 'Corporate IT',
    vocationTe: 'సాంకేతిక రంగం',
    badge: 'NS-ID Verified',
    photoUrl: '/matrimony/profiles/bride-3.jpg',
  },
  {
    id: 'sample-7',
    name: 'T. Vamshi Krishna',
    age: 30,
    gender: 'Groom · వరుడు',
    gothra: 'Kaundinya (కౌండిన్య)',
    nakshatra: 'Makha (మఖ)',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    education: 'M.Tech · Senior Data Scientist',
    vocation: 'Corporate Tech',
    vocationTe: 'సాంకేతిక రంగం',
    badge: 'Mandal Lineage Verified',
    photoUrl: '/matrimony/profiles/groom-4.jpg',
  },
  {
    id: 'sample-8',
    name: 'B. Haritha Devi',
    age: 26,
    gender: 'Bride · వధువు',
    gothra: 'Vishwamitra (విశ్వామిత్ర)',
    nakshatra: 'Revati (రేవతి)',
    district: 'Siddipet',
    districtTe: 'సిద్దిపేట',
    education: 'MBBS · Resident Medical Officer',
    vocation: 'Healthcare & Medicine',
    vocationTe: 'వైద్య రంగం',
    badge: 'NS-ID Verified',
    photoUrl: '/matrimony/profiles/bride-4.jpg',
  },
  {
    id: 'sample-9',
    name: 'G. Suresh Kumar',
    age: 28,
    gender: 'Groom · వరుడు',
    gothra: 'Parasara (పరాశర)',
    nakshatra: 'Arudra (ఆరుద్ర)',
    district: 'Mahabubnagar',
    districtTe: 'మహబూబ్‌నగర్',
    education: 'M.Sc (Agri) · Assistant Agriculture Officer (Govt)',
    vocation: 'Government Public Sector',
    vocationTe: 'ప్రభుత్వ రంగం',
    badge: 'Government Lineage Verified',
    photoUrl: '/matrimony/profiles/groom-5.jpg',
  },
  {
    id: 'sample-10',
    name: 'N. Sravanthi',
    age: 24,
    gender: 'Bride · వధువు',
    gothra: 'Atri (అత్రి)',
    nakshatra: 'Pushyami (పుష్యమి)',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    education: 'B.Tech, MS · Product Designer',
    vocation: 'Creative & Tech',
    vocationTe: 'సాంకేతిక రంగం',
    badge: 'NS-ID Verified',
    photoUrl: '/matrimony/profiles/bride-5.jpg',
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
      
      {/* Concept 1: Split Hero Section (Responsive Grid) */}
      <section className="hero-grid" style={{ maxWidth: '1200px', margin: '1.5rem auto 3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#FFF1F2', color: '#8B1D2C', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #FECDD3', display: 'inline-block', marginBottom: '1rem' }}>
            ★ పవిత్ర సగోత్ర రక్షణ & చట్టబద్ధమైన గోప్యత
          </span>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3rem)', color: '#1A202C', margin: '0 0 1rem', lineHeight: '1.25', fontWeight: 800 }}>
            తెలంగాణ నాయీ బ్రాహ్మణుల <br />
            <span style={{ color: '#8B1D2C' }}>గౌరవప్రదమైన కల్యాణ వేదిక</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4A5568', lineHeight: '1.75', margin: '0 0 1.8rem' }}>
            33 జిల్లాల 589 మండలాల్లోని మన సమాజ కుటుంబాలను ఒకచోట చేర్చే నమ్మకమైన అధికారిక వేదిక. ఎటువంటి ప్రైవేటు దళారులు లేకుండా, పారదర్శకమైన విధానంతో సంబంధాలను వెతకండి.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="btn"
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
            <Link
              href="/login"
              style={{
                background: '#FFF',
                border: '1.5px solid #CBD5E0',
                padding: '0.85rem 1.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                color: '#4A5568',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              సభ్యుల లాగిన్ (ఓటీపీ)
            </Link>
          </div>
        </div>

        {/* Quick Search Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          <div style={{ borderBottom: '2px solid #FAF5FF', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
            <h3 style={{ margin: 0, color: '#8B1D2C', fontSize: '1.3rem', fontWeight: 800 }}>
              సంబంధాల శోధన (Quick Search)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: '#718096' }}>
              వెంటనే సరైన సంబంధాలను కనుగొనండి
            </p>
          </div>

          <form action="/matrimony/discover" method="get" style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.4rem' }}>నేను వెతుకుతున్నది:</label>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <label style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '2px solid #8B1D2C', background: '#FFF1F2', color: '#8B1D2C', fontWeight: 700, textAlign: 'center', cursor: 'pointer' }}>
                  <input type="radio" name="gender" value="female" defaultChecked style={{ display: 'none' }} />
                  వధువు (Bride)
                </label>
                <label style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#FFF', color: '#4A5568', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>
                  <input type="radio" name="gender" value="male" style={{ display: 'none' }} />
                  వరుడు (Groom)
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
              <div>
                <label htmlFor="quick-age" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>వయస్సు:</label>
                <select id="quick-age" name="ageMax" style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                  <option value="25">18 - 25 సంవత్సరాలు</option>
                  <option value="30">26 - 30 సంవత్సరాలు</option>
                  <option value="35">31 - 35 సంవత్సరాలు</option>
                </select>
              </div>
              <div>
                <label htmlFor="quick-district" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>స్వస్థల జిల్లా:</label>
                <select id="quick-district" name="district" style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                  <option value="">అన్ని జిల్లాలు (All)</option>
                  {TELANGANA_DISTRICTS.map((d) => (
                    <option key={d} value={d.toLowerCase().replace(/\s+/g, '-')}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="quick-vocation" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>వృత్తి / ఉద్యోగం:</label>
              <select id="quick-vocation" name="vocation" style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: '#F8FAFC' }}>
                <option value="">అన్ని రంగాలు (All Occupations)</option>
                <option value="corporate_tech_civil">సాఫ్ట్‌వేర్ & ఐటీ (Software & IT)</option>
                <option value="government">ప్రభుత్వ రంగం (Government Sector)</option>
                <option value="wellness_artisan">సెలూన్ వ్యవస్థాపకులు (Salon Founders)</option>
                <option value="healthcare">వైద్య రంగం (Healthcare)</option>
                <option value="nadopasana">నాదోపాసన (Classical & Tradition)</option>
              </select>
            </div>

            <button type="submit" style={{ background: '#D4AF37', color: '#1A202C', padding: '0.85rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>
              సంబంధాలు శోధించండి 🔍
            </button>
          </form>
        </div>
      </section>

      {/* Featured Candidate Showcase (10 Sample Profiles with Real Photos) */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <Bi en="Verified Community Profiles" te="సరికొత్త సంబంధాలు" />
            </span>
            <h2 style={{ fontSize: '2rem', margin: '0.2rem 0', color: '#1A202C' }}>
              <Bi en="Featured Community Profiles (10 Verified)" te="ధృవీకరించబడిన ప్రొఫైల్స్" />
            </h2>
            <p className="hint">
              <Bi en="Every profile is verified by local Mandal Lineage Coordinators across Telangana." te="ప్రతి ప్రొఫైల్ మండల సమన్వయకర్తల ద్వారా క్షేత్రస్థాయిలో ధృవీకరించబడుతుంది." />
            </p>
          </div>
          <Link href="/discover" className="btn-ghost link-btn" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            <Bi en="View All Matches →" te="అన్ని సంబంధాలు చూడండి →" />
          </Link>
        </div>

        <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {FEATURED_PROFILES.map((p) => (
            <article key={p.id} className="profile-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              {/* Profile Photo */}
              <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden', background: '#E2E8F0' }}>
                <img 
                  src={p.photoUrl} 
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    color: '#8B1D2C', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  🔒 2 Photos Verified
                </span>
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: '12px', 
                    left: '12px', 
                    background: 'rgba(139, 29, 44, 0.92)', 
                    color: '#FFFFFF', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '6px', 
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {p.gender}
                </span>
              </div>

              {/* Profile Details */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#1A202C' }}>
                  {p.name}, {p.age}
                </h3>

                <p style={{ margin: '0.35rem 0 0.8rem', color: '#8B1D2C', fontSize: '0.9rem', fontWeight: 700 }}>
                  📍 {p.district} ({p.districtTe})
                </p>

                <div style={{ background: '#FAF7F2', padding: '0.75rem 0.9rem', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #E8DFD5', marginBottom: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.3rem', color: '#2D3748' }}>
                    <strong>గోత్రం:</strong> {p.gothra}
                  </p>
                  <p style={{ margin: '0 0 0.3rem', color: '#2D3748' }}>
                    <strong>నక్షత్రం:</strong> {p.nakshatra}
                  </p>
                  <p style={{ margin: 0, color: '#2D3748' }}>
                    🎓 {p.education}
                  </p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <span className="badge" style={{ fontSize: '0.76rem', marginBottom: '0.8rem', display: 'inline-block' }}>
                    ✓ {p.badge}
                  </span>

                  <Link href={`/profiles/${p.id}`} className="btn link-btn" style={{ width: '100%', textAlign: 'center', padding: '0.65rem', fontSize: '0.9rem', display: 'block', borderRadius: '10px' }}>
                    <Bi en="View Full Profile & Horoscope →" te="పూర్తి జాతకం & వివరాలు →" />
                  </Link>
                </div>
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
