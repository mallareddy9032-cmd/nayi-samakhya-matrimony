import Link from 'next/link';
import { getOptionalSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';
import { AuspiciousHeader } from './onboarding/AuspiciousHeader.tsx';
import { QuickSearch } from '../components/QuickSearch.tsx';

// 10 Sample candidates representing community matches across Telangana with real photos
const FEATURED_PROFILES = [
  {
    id: 'sample-1',
    name: 'S. Sai Krishna',
    age: 27,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    gothraEn: 'Kashyapa',
    gothraTe: 'కాశ్యప',
    nakshatraEn: 'Rohini',
    nakshatraTe: 'రోహిణి',
    districtEn: 'Hyderabad',
    districtTe: 'హైదరాబాద్',
    educationEn: 'B.Tech (CSE) · Lead Cloud Architect',
    educationTe: 'బి.టెక్ (సిఎస్ఇ) · లీడ్ క్లౌడ్ ఆర్కిటెక్ట్',
    vocationEn: 'Tech Professional',
    vocationTe: 'సాంకేతిక రంగం',
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-1.jpg',
  },
  {
    id: 'sample-2',
    name: 'K. Snehalatha',
    age: 24,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    gothraEn: 'Bharadwaja',
    gothraTe: 'భరద్వాజ',
    nakshatraEn: 'Hasta',
    nakshatraTe: 'హస్త',
    districtEn: 'Warangal',
    districtTe: 'వరంగల్',
    educationEn: 'M.Sc, B.Ed · Govt High School Teacher',
    educationTe: 'ఎం.ఎస్సీ, బి.ఎడ్ · ప్రభుత్వ ఉపాధ్యాయురాలు',
    vocationEn: 'Government & Academic',
    vocationTe: 'విద్యా రంగం',
    badgeEn: 'Mandal Lineage Verified',
    badgeTe: 'మండల వంశ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-1.jpg',
  },
  {
    id: 'sample-3',
    name: 'P. Ravinder Nayi',
    age: 29,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    gothraEn: 'Gautama',
    gothraTe: 'గౌతమ',
    nakshatraEn: 'Uttara',
    nakshatraTe: 'ఉత్తర',
    districtEn: 'Karimnagar',
    districtTe: 'కరీంనగర్',
    educationEn: 'B.Com · Salon Chain Founder & Entrepreneur',
    educationTe: 'బి.కామ్ · సెలూన్ వ్యవస్థాపకులు & వ్యాపారవేత్త',
    vocationEn: 'Soundarya & Salon Founder',
    vocationTe: 'సెలూన్ వ్యవస్థాపకులు',
    badgeEn: 'Enterprise Modernist',
    badgeTe: 'స్వయం ఉపాధి సాధకులు',
    photoUrl: '/matrimony/profiles/groom-2.jpg',
  },
  {
    id: 'sample-4',
    name: 'M. Ananya',
    age: 23,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    gothraEn: 'Vashishta',
    gothraTe: 'వశిష్ట',
    nakshatraEn: 'Anuradha',
    nakshatraTe: 'అనూరాధ',
    districtEn: 'Nalgonda',
    districtTe: 'నల్గొండ',
    educationEn: 'B.Pharm, MBA · Healthcare Executive',
    educationTe: 'బి.ఫార్మ్, ఎంబీఏ · హెల్త్‌కేర్ ఎగ్జిక్యూటివ్',
    vocationEn: 'Healthcare & Wellness',
    vocationTe: 'ఆరోగ్య సంరక్షణ',
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-2.jpg',
  },
  {
    id: 'sample-5',
    name: 'P. Madhav Rao',
    age: 28,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    gothraEn: 'Agastya',
    gothraTe: 'అగస్త్య',
    nakshatraEn: 'Swati',
    nakshatraTe: 'స్వాతి',
    districtEn: 'Khammam',
    districtTe: 'ఖమ్మం',
    educationEn: 'Vidwan / MA Music · Classical Nadaswaram Artiste',
    educationTe: 'విద్వాన్ / ఎంఏ సంగీతం · నాదస్వర విద్వాంసులు',
    vocationEn: 'Nadopasana Heritage',
    vocationTe: 'నాదోపాసన కళాకారులు',
    badgeEn: 'Heritage Custodian',
    badgeTe: 'సాంస్కృతిక సంరక్షకులు',
    photoUrl: '/matrimony/profiles/groom-3.jpg',
  },
  {
    id: 'sample-6',
    name: 'K. Divya Sree',
    age: 25,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    gothraEn: 'Sandilya',
    gothraTe: 'శాండిల్య',
    nakshatraEn: 'Ashwini',
    nakshatraTe: 'అశ్విని',
    districtEn: 'Nizamabad',
    districtTe: 'నిజామాబాద్',
    educationEn: 'MCA · Senior IT Systems Analyst',
    educationTe: 'ఎంసిఎ · సీనియర్ ఐటీ సిస్టమ్స్ అనలిస్ట్',
    vocationEn: 'Corporate IT',
    vocationTe: 'సాంకేతిక రంగం',
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-3.jpg',
  },
  {
    id: 'sample-7',
    name: 'T. Vamshi Krishna',
    age: 30,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    gothraEn: 'Kaundinya',
    gothraTe: 'కౌండిన్య',
    nakshatraEn: 'Makha',
    nakshatraTe: 'మఖ',
    districtEn: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    educationEn: 'M.Tech · Senior Data Scientist',
    educationTe: 'ఎం.టెక్ · సీనియర్ డేటా సైంటిస్ట్',
    vocationEn: 'Corporate Tech',
    vocationTe: 'సాంకేతిక రంగం',
    badgeEn: 'Mandal Lineage Verified',
    badgeTe: 'మండల వంశ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-4.jpg',
  },
  {
    id: 'sample-8',
    name: 'B. Haritha Devi',
    age: 26,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    gothraEn: 'Vishwamitra',
    gothraTe: 'విశ్వామిత్ర',
    nakshatraEn: 'Revati',
    nakshatraTe: 'రేవతి',
    districtEn: 'Siddipet',
    districtTe: 'సిద్దిపేట',
    educationEn: 'MBBS · Resident Medical Officer',
    educationTe: 'ఎంబీబీఎస్ · రెసిడెంట్ మెడికల్ ఆఫీసర్ (వైద్యురాలు)',
    vocationEn: 'Healthcare & Medicine',
    vocationTe: 'వైద్య రంగం',
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
    photoUrl: '/matrimony/profiles/bride-4.jpg',
  },
  {
    id: 'sample-9',
    name: 'G. Suresh Kumar',
    age: 28,
    genderEn: 'Groom',
    genderTe: 'వరుడు',
    gothraEn: 'Parasara',
    gothraTe: 'పరాశర',
    nakshatraEn: 'Arudra',
    nakshatraTe: 'ఆరుద్ర',
    districtEn: 'Mahabubnagar',
    districtTe: 'మహబూబ్‌నగర్',
    educationEn: 'M.Sc (Agri) · Assistant Agriculture Officer (Govt)',
    educationTe: 'ఎం.ఎస్సీ (అగ్రి) · సహాయ వ్యవసాయ అధికారి (ప్రభుత్వ ఉద్యోగి)',
    vocationEn: 'Government Public Sector',
    vocationTe: 'ప్రభుత్వ రంగం',
    badgeEn: 'Government Lineage Verified',
    badgeTe: 'ప్రభుత్వ ఉద్యోగి ధృవీకృతం',
    photoUrl: '/matrimony/profiles/groom-5.jpg',
  },
  {
    id: 'sample-10',
    name: 'N. Sravanthi',
    age: 24,
    genderEn: 'Bride',
    genderTe: 'వధువు',
    gothraEn: 'Atri',
    gothraTe: 'అత్రి',
    nakshatraEn: 'Pushyami',
    nakshatraTe: 'పుష్యమి',
    districtEn: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    educationEn: 'B.Tech, MS · Product Designer',
    educationTe: 'బి.టెక్, ఎంఎస్ · ప్రొడక్ట్ డిజైనర్',
    vocationEn: 'Creative & Tech',
    vocationTe: 'సాంకేతిక రంగం',
    badgeEn: 'NS-ID Verified',
    badgeTe: 'ఎన్ఎస్-ఐడీ ధృవీకృతం',
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

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://nayisamakhya.org/#organization',
        name: 'Nayi Samakhya Matrimonial Portal',
        alternateName: 'నాయీ సమాఖ్య కల్యాణ వేదిక',
        url: 'https://nayisamakhya.org/matrimony',
        logo: 'https://nayisamakhya.org/matrimony/og-banner.jpg',
        description: 'Official matrimonial platform for Telangana & Andhra Pradesh Nayi Brahmin community with Sagothra protection and DPDP privacy.',
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Telangana' },
          { '@type': 'AdministrativeArea', name: 'Andhra Pradesh' },
          { '@type': 'Country', name: 'India' },
        ],
      },
      {
        '@type': 'MarriageAgency',
        '@id': 'https://nayisamakhya.org/matrimony/#agency',
        name: 'నాయీ సమాఖ్య కల్యాణ వేదిక (Nayi Samakhya Matrimony)',
        url: 'https://nayisamakhya.org/matrimony',
        parentOrganization: { '@id': 'https://nayisamakhya.org/#organization' },
        priceRange: 'Free Community Service',
        serviceType: 'Matrimonial Matchmaking',
      },
    ],
  };

  return (
    <main className="shell wide notranslate">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      {/* Sacred Invocation & Auspicious Thoranam Header */}
      <AuspiciousHeader />
      
      {/* Concept 1: Split Hero Section (Responsive Grid) */}
      <section className="hero-grid" style={{ maxWidth: '1200px', margin: '1rem auto 3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#FFF1F2', color: '#801426', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800, border: '1.5px solid #FECDD3', display: 'inline-block', marginBottom: '1rem', letterSpacing: '0.02em' }}>
            <Bi en="★ Sacred Sagothra Protection & Legal DPDP Privacy" te="★ పవిత్ర సగోత్ర రక్షణ & చట్టబద్ధమైన గోప్యత" />
          </span>

          <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.1rem)', color: '#1A202C', margin: '0 0 1rem', lineHeight: '1.25', fontWeight: 800 }}>
            <Bi 
              en="Dignified Kalyana Vedika for Nayi Brahmin Families" 
              te="తెలంగాణ నాయీ బ్రాహ్మణుల గౌరవప్రదమైన కల్యాణ వేదిక" 
            />
          </h1>

          <p style={{ fontSize: '1.08rem', color: '#4A5568', lineHeight: '1.75', margin: '0 0 1.8rem' }}>
            <Bi 
              en="Telangana's official, lineage-guarded matrimonial forum connecting families across 33 districts and 589 mandals. Absolutely zero private brokers or commercial exploitation." 
              te="33 జిల్లాల 589 మండలాల్లోని మన సమాజ కుటుంబాలను ఒకచోట చేర్చే నమ్మకమైన అధికారిక వేదిక. ఎటువంటి ప్రైవేటు దళారులు లేకుండా, పారదర్శకమైన విధానంతో సంబంధాలను వెతకండి." 
            />
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #801426 0%, #5B0C1A 100%)',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 8px 24px rgba(128, 20, 38, 0.3)'
              }}
            >
              <Bi en="Register Free Profile →" te="ఉచిత ప్రొఫైల్ నమోదు చేసుకోండి →" />
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
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <Bi en="Member Login (OTP)" te="సభ్యుల లాగిన్ (ఓటీపీ)" />
            </Link>
          </div>
        </div>

        {/* Quick Search Card */}
        <QuickSearch districts={TELANGANA_DISTRICTS} />
      </section>

      {/* Featured Candidate Showcase (10 Sample Profiles with Real Photos) */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ marginBottom: '0.4rem', fontSize: '0.85rem', background: '#FFF8EB', color: '#92400E', border: '1px solid #FDE68A' }}>
              <Bi en="Verified Community Alliances" te="సరికొత్త సంబంధాలు" />
            </span>
            <h2 style={{ fontSize: '2.1rem', margin: '0.2rem 0', color: '#1A202C' }}>
              <Bi en="Featured Community Profiles (10 Verified)" te="ధృవీకరించబడిన ప్రొఫైల్స్" />
            </h2>
            <p className="hint" style={{ fontSize: '0.95rem' }}>
              <Bi en="Every profile is verified by local Mandal Lineage Coordinators across Telangana." te="ప్రతి ప్రొఫైల్ మండల సమన్వయకర్తల ద్వారా క్షేత్రస్థాయిలో ధృవీకరించబడుతుంది." />
            </p>
          </div>
          <Link href="/discover" className="btn-ghost link-btn" style={{ fontSize: '0.95rem', fontWeight: 800, padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
            <Bi en="View All Matches →" te="అన్ని సంబంధాలు చూడండి →" />
          </Link>
        </div>

        {/* Responsive Grid with Strictly Constrained Portrait Cards */}
        <div className="cards">
          {FEATURED_PROFILES.map((p) => (
            <article key={p.id} className="profile-card">
              {/* Profile Photo Container (Fixed height, top-centered portrait) */}
              <div style={{ height: '280px', width: '100%', position: 'relative', overflow: 'hidden', background: '#F8F4EE' }}>
                <img 
                  src={p.photoUrl} 
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  loading="lazy"
                />

                {/* Top Badges */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                  <span 
                    style={{ 
                      background: 'rgba(128, 20, 38, 0.92)', 
                      color: '#FFFFFF', 
                      padding: '0.28rem 0.7rem', 
                      borderRadius: '999px', 
                      fontSize: '0.74rem', 
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(212, 175, 55, 0.5)'
                    }}
                  >
                    ✓ <Bi en={p.badgeEn} te={p.badgeTe} />
                  </span>

                  <span 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.94)', 
                      color: '#801426', 
                      padding: '0.28rem 0.65rem', 
                      borderRadius: '999px', 
                      fontSize: '0.74rem', 
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
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
                      {p.name}
                    </h3>
                    <p style={{ margin: '0.15rem 0 0', color: '#FCD34D', fontSize: '0.85rem', fontWeight: 700 }}>
                      {p.age} <Bi en="Yrs" te="సం." /> · <Bi en={p.genderEn} te={p.genderTe} />
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
                    📍 <Bi en={p.districtEn} te={p.districtTe} />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #EEDCC8', paddingBottom: '0.35rem' }}>
                    <span style={{ color: '#801426', fontWeight: 700 }}>
                      🕉️ <Bi en="Gothra" te="గోత్రం" />:
                    </span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      <Bi en={p.gothraEn} te={p.gothraTe} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #EEDCC8', paddingBottom: '0.35rem' }}>
                    <span style={{ color: '#801426', fontWeight: 700 }}>
                      ✨ <Bi en="Nakshatra" te="నక్షత్రం" />:
                    </span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      <Bi en={p.nakshatraEn} te={p.nakshatraTe} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', paddingTop: '0.1rem' }}>
                    <span style={{ color: '#801426', fontWeight: 700 }}>🎓</span>
                    <span style={{ color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
                      <Bi en={p.educationEn} te={p.educationTe} />
                    </span>
                  </div>
                </div>

                {/* Full Profile CTA Button */}
                <div style={{ marginTop: 'auto' }}>
                  <Link 
                    href={`/profiles/${p.id}`} 
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
      </section>

      {/* 4. Pillars of Cultural & Legal Integrity (Infographic Cards) */}
      <section style={{ margin: '4.5rem 0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem', padding: '0.35rem 1rem', fontSize: '0.9rem', background: '#FFF8EB', color: '#92400E', border: '1px solid #FDE68A' }}>
            <Bi en="Sacred Pillars of Trust" te="విశ్వసనీయతకు 4 మూలస్తంభాలు" />
          </span>
          <h2 style={{ fontSize: '2.2rem', margin: '0.3rem 0 0.5rem', color: '#1A202C' }}>
            <Bi en="Why Nayi Samakhya Matrimony?" te="ఈ కల్యాణ వేదిక విశిష్టతలు" />
          </h2>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: '#64748B', fontSize: '1rem', lineHeight: 1.6 }}>
            <Bi 
              en="Telangana's exclusive, lineage-guarded matrimonial network ensuring sacred traditions, zero commercial exploitation, and verified family alliances." 
              te="మన సమాజ సంస్కృతి, సగోత్ర సంప్రదాయాల రక్షణ మరియు చట్టబద్ధమైన గోప్యతతో నడిచే అధికారిక కల్యాణ వేదిక." 
            />
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.8rem' }}>
          {/* Card 1: Sacred Sagothra */}
          <article 
            className="card" 
            style={{ 
              borderRadius: '20px', 
              padding: '2rem', 
              background: '#FFFFFF', 
              border: '1.5px solid var(--gold-border, #E2D9CC)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FFF1F2', color: '#801426', display: 'grid', placeItems: 'center', fontSize: '1.8rem', border: '1px solid #FECDD3' }}>
                🛡️
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pillar 1</span>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#801426', fontWeight: 800 }}>
                  <Bi en="Strict Sagothra Exclusion" te="సగోత్ర రక్షణ & వంశ గౌరవం" />
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>
              <Bi 
                en="Same-gothra alliances are strictly prohibited at the database schema level. Matches sharing your paternal Gothra will never be shown, preserving our sacred gotra lineages across generations."
                te="డేటాబేస్ స్థాయిలో సగోత్ర సంబంధాల సంపూర్ణ నిషేధం. మీ పితృస్వామ్య గోత్రానికి చెందిన ప్రొఫైల్స్ ఏవీ మీకు చూపించబడవు; మన వంశ పవిత్రత మరియు సంప్రదాయం సంపూర్ణంగా రక్షించబడుతుంది."
              />
            </p>
          </article>

          {/* Card 2: DPDP Privacy */}
          <article 
            className="card" 
            style={{ 
              borderRadius: '20px', 
              padding: '2rem', 
              background: '#FFFFFF', 
              border: '1.5px solid var(--gold-border, #E2D9CC)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#ECFDF5', color: '#059669', display: 'grid', placeItems: 'center', fontSize: '1.8rem', border: '1px solid #A7F3D0' }}>
                🔐
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pillar 2</span>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#801426', fontWeight: 800 }}>
                  <Bi en="DPDP Act 2023 Shield" te="చట్టబద్ధమైన గోప్యత & నంబర్ రక్షణ" />
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>
              <Bi 
                en="Candidate mobile numbers and residential addresses are AES-256 encrypted. Contact details remain completely masked and unlock ONLY when both families mutually accept."
                te="అభ్యర్థుల ఫోన్, వాట్సాప్ మరియు ఇంటి చిరునామాలు సైబర్ ఎన్‌క్రిప్షన్‌తో భద్రంగా ఉంటాయి. ఇరు కుటుంబాలు పరస్పరం ఆసక్తి వ్యక్తం చేసి సమ్మతించిన తర్వాతే నంబర్లు విడుదలవుతాయి."
              />
            </p>
          </article>

          {/* Card 3: 589 Mandal Lineage Coordinators */}
          <article 
            className="card" 
            style={{ 
              borderRadius: '20px', 
              padding: '2rem', 
              background: '#FFFFFF', 
              border: '1.5px solid var(--gold-border, #E2D9CC)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center', fontSize: '1.8rem', border: '1px solid #BFDBFE' }}>
                🏛️
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pillar 3</span>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#801426', fontWeight: 800 }}>
                  <Bi en="589 Mandal Coordinators" te="589 మండల సమన్వయకర్తల నెట్‌వర్క్" />
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>
              <Bi 
                en="Real grassroots verification in every mandal across all 33 Telangana districts. Our local community coordinators cross-verify identity, family background, and lineage authenticity."
                te="తెలంగాణలోని మొత్తం 33 జిల్లాల 589 మండలాల్లో నియమించబడిన స్థానిక నాయీ సమాఖ్య సమన్వయకర్తల ద్వారా అభ్యర్థుల కుటుంబ నేపథ్యం మరియు గుర్తింపు ప్రత్యక్షంగా ధృవీకరించబడుతుంది."
              />
            </p>
          </article>

          {/* Card 4: Tiered Curated Trust (10 Free Profiles + Premium Matchmaking) */}
          <article 
            className="card" 
            style={{ 
              borderRadius: '20px', 
              padding: '2rem', 
              background: '#FFFFFF', 
              border: '1.5px solid var(--gold-border, #E2D9CC)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF3C7', color: '#B45309', display: 'grid', placeItems: 'center', fontSize: '1.8rem', border: '1px solid #FDE68A' }}>
                💎
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pillar 4</span>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#801426', fontWeight: 800 }}>
                  <Bi en="10 Free Views + Premium Matchmaking" te="10 ఉచిత ప్రొఫైల్స్ & ప్రీమియం సేవలు" />
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>
              <Bi 
                en="Every verified member gets 10 curated profile views completely free. Transparent, affordable premium membership unlocks unlimited matching without private brokers or high commission fees."
                te="ప్రతి ధృవీకరించబడిన సభ్యునికి 10 సంబంధాల ఉచిత వీక్షణలు లభిస్తాయి. ఎటువంటి ప్రైవేట్ దళారులు లేకుండా, పారదర్శక ప్రీమియం సేవలతో మరిన్ని సంబంధాలను నేరుగా సంప్రదించవచ్చు."
              />
            </p>
          </article>
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ textAlign: 'center', padding: '2.5rem 1rem 1.5rem', borderTop: '1.5px solid #E7DCD0', marginTop: '3rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: '#801426', fontWeight: 800, fontSize: '1.05rem' }}>
          <Bi en="Nayi Samakhya Telangana · Sovereign Matrimonial Alliance" te="నాయీ సమాఖ్య తెలంగాణ · అధికారిక కల్యాణ వేదిక" />
        </p>
        <p className="hint" style={{ fontSize: '0.88rem', color: '#64748B' }}>
          <Bi 
            en="Headquarters: Hyderabad, Telangana · For assistance, contact your Mandal Lineage Coordinator" 
            te="ప్రధాన కార్యాలయం: హైదరాబాద్, తెలంగాణ · సహాయం కోసం మీ మండల సమన్వయకర్తను సంప్రదించండి" 
          />
        </p>
      </footer>
    </main>
  );
}
