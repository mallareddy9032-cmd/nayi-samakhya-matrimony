import Link from 'next/link';
import { getOptionalSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';
import { AuspiciousHeader } from './onboarding/AuspiciousHeader.tsx';
import { QuickSearch } from '../components/QuickSearch.tsx';
import { formatMaskedDisplayName } from '../lib/onboarding.ts';
import { WhatsAppShareButton } from '../components/WhatsAppShareButton';

// 10 Sample candidates representing community matches across Telangana with real photos
const FEATURED_PROFILES = [
  {
    id: 'sample-1',
    uniqueId: 'NS-M1042',
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
    uniqueId: 'NS-F1043',
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
    uniqueId: 'NS-M1044',
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
    uniqueId: 'NS-F1045',
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
    uniqueId: 'NS-M1046',
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
    uniqueId: 'NS-F1047',
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
    uniqueId: 'NS-M1048',
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
    uniqueId: 'NS-F1049',
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
    uniqueId: 'NS-M1050',
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
    uniqueId: 'NS-F1051',
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
  // Telangana (33 Districts)
  'Hyderabad', 'Warangal', 'Hanumakonda', 'Karimnagar', 'Nalgonda', 'Khammam', 'Nizamabad',
  'Rangareddy', 'Medchal-Malkajgiri', 'Siddipet', 'Suryapet', 'Mahabubnagar',
  'Adilabad', 'Bhadradri Kothagudem', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
  'Jogulamba Gadwal', 'Kamareddy', 'Komaram Bheem Asifabad', 'Mahabubabad',
  'Mancherial', 'Medak', 'Mulugu', 'Nagarkurnool', 'Narayanpet', 'Nirmal',
  'Peddapalli', 'Rajanna Sircilla', 'Sangareddy', 'Vikarabad', 'Wanaparthy',
  'Yadadri Bhuvanagiri',
  // Andhra Pradesh (26 Districts)
  'Visakhapatnam', 'NTR (Vijayawada)', 'Guntur', 'Tirupati', 'Kurnool', 'Kakinada',
  'Nellore (SPSR Nellore)', 'East Godavari (Rajamahendravaram)', 'West Godavari (Bhimavaram)',
  'Krishna (Machilipatnam)', 'Eluru', 'Prakasam (Ongole)', 'Bapatla', 'Palnadu (Narasaraopet)',
  'YSR Kadapa', 'Ananthapuramu', 'Sri Sathya Sai (Puttaparthi)', 'Chittoor',
  'Annamayya (Rayachoti)', 'Nandyal', 'Srikakulam', 'Vizianagaram',
  'Parvathipuram Manyam', 'Alluri Sitharama Raju', 'Anakapalli', 'Dr. B.R. Ambedkar Konaseema'
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

      {/* Option 2: Luxury Velvet Glassmorphism Hero Section */}
      <section 
        className="hero-luxury"
        style={{ 
          maxWidth: '1240px', 
          margin: '0.75rem auto 3rem', 
          background: 'linear-gradient(135deg, #450814 0%, #2A040B 50%, #160205 100%)',
          borderRadius: '32px',
          padding: '3rem 2.5rem',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 30px 70px rgba(22, 2, 5, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Gold Radial Glow Overlays */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(128, 20, 38, 0.4) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left Column: Emotion, Prestige, & Social Proof */}
          <div>
            {/* Sacred Invocation Shimmer */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🪔</span>
              <span style={{
                color: '#FDE68A',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.5)'
              }}>
                ॥ శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు ॥
              </span>
            </div>

            {/* Official Initiative Badge */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ 
                background: 'rgba(212, 175, 55, 0.15)', 
                color: '#FCD34D', 
                padding: '0.4rem 1.1rem', 
                borderRadius: '999px', 
                fontSize: '0.84rem', 
                fontWeight: 800, 
                border: '1.2px solid rgba(212, 175, 55, 0.45)', 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}>
                <span>✨</span>
                <Bi 
                  en="Official Community Matrimonial Initiative · 59 Districts (TG & AP) · Pan-India" 
                  te="అధికారిక నాయీ సమాఖ్య కల్యాణ వేదిక · తెలంగాణ & ఆంధ్రప్రదేశ్ · అఖిల భారత వేదిక" 
                />
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{ 
              fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)', 
              color: '#FFFFFF', 
              margin: '0 0 1.2rem', 
              lineHeight: '1.22', 
              fontWeight: 800,
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
            }}>
              <Bi 
                en="Dignified Matrimony for the Next Generation of Nayi Brahmin Families" 
                te="రెండు సంస్కారవంతమైన కుటుంబాల పవిత్ర కల్యాణ బంధం" 
              />
            </h1>

            {/* Compelling Paragraph */}
            <p style={{ 
              fontSize: '1.08rem', 
              color: '#F1F5F9', 
              lineHeight: '1.75', 
              margin: '0 0 1.8rem',
              fontWeight: 400,
              maxWidth: '580px',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
            }}>
              <Bi 
                en="Connecting verified families across 59 districts of Telangana & Andhra Pradesh, alongside Telugu Nayi Brahmin families settled across India and worldwide. 100% Sagothra protected, DPDP-grade privacy, and absolutely zero private brokers or commercial exploitation." 
                te="తెలంగాణ (33 జిల్లాలు) & ఆంధ్రప్రదేశ్ (26 జిల్లాలు) మరియు దేశవ్యాప్తంగా స్థిరపడిన మన తెలుగు నాయీ బ్రాహ్మణ కుటుంబాల పవిత్ర కల్యాణ వేదిక. 100% సగోత్ర రక్షణ, చట్టబద్ధమైన గోప్యత, మరియు ఎటువంటి ప్రైవేటు దళారులు లేని పారదర్శక సేవ." 
              />
            </p>

            {/* Live Social Proof Floating Chips */}
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.08)', 
                border: '1px solid rgba(255, 255, 255, 0.18)', 
                borderRadius: '999px', 
                padding: '0.4rem 0.95rem', 
                color: '#FFFFFF', 
                fontSize: '0.82rem', 
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>💍</span>
                <Bi en="1,240+ Verified Candidates" te="1,240+ ధృవీకరించబడిన సంబంధాలు" />
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.08)', 
                border: '1px solid rgba(255, 255, 255, 0.18)', 
                borderRadius: '999px', 
                padding: '0.4rem 0.95rem', 
                color: '#FFFFFF', 
                fontSize: '0.82rem', 
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>📍</span>
                <Bi en="Active in 59 Districts & Pan-India" te="59 జిల్లాలు & అఖిల భారత విస్తృతి" />
              </div>

              <div style={{ 
                background: 'rgba(212, 175, 55, 0.15)', 
                border: '1px solid rgba(212, 175, 55, 0.4)', 
                borderRadius: '999px', 
                padding: '0.4rem 0.95rem', 
                color: '#FDE68A', 
                fontSize: '0.82rem', 
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>⚡</span>
                <Bi en="100% Sagothra Guarded" te="100% సగోత్ర నిషిద్ధం" />
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="hero-cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/onboarding"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #C59B27 50%, #A67C1E 100%)',
                  color: '#2A040B',
                  padding: '1rem 2.2rem',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 10px 30px rgba(212, 175, 55, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <span>✨</span>
                <Bi en="Register Free Profile (2 Mins) →" te="ఉచిత ప్రొఫైల్ నమోదు చేసుకోండి →" />
              </Link>
              
              <Link
                href="/discover"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  padding: '1rem 1.8rem',
                  borderRadius: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔍</span>
                <Bi en="Explore Matches →" te="సంబంధాల అన్వేషణ →" />
              </Link>
            </div>
          </div>

          {/* Right Column: Quick Match Frosted Glass Engine */}
          <div>
            <QuickSearch districts={TELANGANA_DISTRICTS} />
          </div>
        </div>
      </section>

      {/* 1-Click Vocation & Lifestyle Discovery Pills (Option 2 Feature) */}
      <section style={{ maxWidth: '1240px', margin: '-1rem auto 3.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#801426', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎯</span>
              <Bi en="Explore Profiles by Profession & Background" te="వృత్తి & రంగం ఆధారంగా సంబంధాలు అన్వేషించండి" />
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: '#64748B' }}>
              <Bi en="Click any stream for instant curated matchmaking" te="మీకు నచ్చిన రంగాన్ని ఎంచుకుని నేరుగా సంబంధాలను చూడండి" />
            </p>
          </div>
          <Link href="/discover" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#801426', textDecoration: 'none' }}>
            <Bi en="View All Streams →" te="అన్ని రంగాలు చూడండి →" />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: '0.85rem'
        }}>
          {[
            {
              icon: '💻',
              en: 'Software & IT Tech',
              te: 'సాఫ్ట్‌వేర్ & ఐటీ',
              count: '340+',
              vocation: 'corporate_tech_civil',
              gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              color: '#1D4ED8'
            },
            {
              icon: '🩺',
              en: 'Doctors & Healthcare',
              te: 'వైద్యులు & ఫార్మా',
              count: '95+',
              vocation: 'healthcare',
              gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
              color: '#047857'
            },
            {
              icon: '🏛️',
              en: 'Govt & Civil Services',
              te: 'ప్రభుత్వ ఉద్యోగులు',
              count: '120+',
              vocation: 'government',
              gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              color: '#B45309'
            },
            {
              icon: '💈',
              en: 'Salon & Wellness Founders',
              te: 'సెలూన్ వ్యవస్థాపకులు',
              count: '210+',
              vocation: 'wellness_artisan',
              gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
              color: '#BE123C'
            },
            {
              icon: '🎵',
              en: 'Classical Music Masters',
              te: 'నాదోపాసన విద్వాంసులు',
              count: '45+',
              vocation: 'nadopasana',
              gradient: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)',
              color: '#7E22CE'
            },
            {
              icon: '🎓',
              en: 'Teachers & Academics',
              te: 'ఉపాధ్యాయులు & విద్య',
              count: '80+',
              vocation: 'scholarly_academic',
              gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
              color: '#15803D'
            },
          ].map((item) => (
            <Link
              key={item.vocation}
              href={`/discover?vocation=${item.vocation}`}
              style={{
                textDecoration: 'none',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1rem',
                border: '1.5px solid #E2D9CC',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="vocation-card"
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: item.gradient,
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.35rem',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Bi en={item.en} te={item.te} />
                </strong>
                <span style={{ fontSize: '0.76rem', color: item.color, fontWeight: 700 }}>
                  {item.count} <Bi en="Profiles" te="సంబంధాలు" />
                </span>
              </div>
            </Link>
          ))}
        </div>
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
              {/* Profile Photo Container (Fixed height, top-centered portrait with Gaussian blur protection) */}
              <div style={{ height: '280px', width: '100%', position: 'relative', overflow: 'hidden', background: '#F8F4EE' }}>
                <img 
                  src={p.photoUrl} 
                  alt={formatMaskedDisplayName(p.name, p.uniqueId)}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    objectPosition: 'top center', 
                    display: 'block',
                    filter: 'blur(7px) brightness(0.9)',
                    transform: 'scale(1.06)',
                    transition: 'all 0.3s ease'
                  }}
                  loading="lazy"
                />

                {/* Centered Golden Frosted Lock Badge */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid #D4AF37',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>🔒</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#801426' }}>
                    <Bi en="Login to View Full Photo" te="పూర్తి ఫోటో కోసం లాగిన్ అవ్వండి" />
                  </span>
                </div>

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
                    <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      {formatMaskedDisplayName(p.name, p.uniqueId)}
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

                {/* Full Profile CTA Button & WhatsApp Family Share */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <WhatsAppShareButton
                      uniqueId={p.uniqueId}
                      displayName={formatMaskedDisplayName(p.name, p.uniqueId)}
                      age={p.age}
                      district={p.districtTe}
                      education={p.educationTe}
                    />
                  </div>

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
                  <Bi en="Grassroots Mandal Coordinators" te="మండల సమన్వయకర్తల నెట్‌వర్క్" />
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>
              <Bi 
                en="Grassroots verification across mandals in Telangana, Andhra Pradesh, and nationwide community hubs. Our local coordinators cross-verify identity, family background, and lineage authenticity."
                te="తెలంగాణ, ఆంధ్రప్రదేశ్‌లోని సమగ్ర మండలాల్లో మరియు దేశవ్యాప్త నెట్‌వర్క్‌లో స్థానిక నాయీ సమాఖ్య సమన్వయకర్తల ద్వారా అభ్యర్థుల కుటుంబ నేపథ్యం మరియు గుర్తింపు ప్రత్యక్షంగా ధృవీకరించబడుతుంది."
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
