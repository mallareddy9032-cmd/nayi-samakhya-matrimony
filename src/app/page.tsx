import Link from 'next/link';
import { getOptionalSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';
import { AuspiciousHeader } from './onboarding/AuspiciousHeader.tsx';

export default async function Home() {
  const session = await getOptionalSession();
  return (
    <main className="shell wide">
      <Nav claims={session} />
      <AuspiciousHeader />
      
      <section style={{ textAlign: 'center', margin: '2rem auto 3rem', maxWidth: '780px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.8rem' }}>
          <Bi en="Telangana Nayi-Brahmin Matrimonial Alliance" te="తెలంగాణ నాయీ బ్రాహ్మణ కల్యాణ వేదిక" />
        </h1>
        <p className="lead" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
          <Bi 
            en="A dignified, sovereign matrimonial initiative across 33 Telangana districts. Preserving cultural heritage, strict Sagothra exclusion, and verified lineage under the auspices of Nayi Samakhya." 
            te="తెలంగాణ 33 జిల్లాల నాయీ బ్రాహ్మణ కుటుంబాల కోసం ప్రత్యేకంగా రూపొందించబడిన గౌరవప్రదమైన కల్యాణ వేదిక. నాయీ సమాఖ్య పర్యవేక్షణలో సగోత్ర రక్షణ మరియు ధృవీకరించబడిన సంబంధాలు." 
          />
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.8rem', flexWrap: 'wrap' }}>
          <Link href="/onboarding" className="btn link-btn" style={{ fontSize: '1.05rem', padding: '0.75rem 1.8rem' }}>
            <Bi en="Begin Matrimonial Intake · 7 Steps" te="వివాహ నమోదు ప్రారంభించండి · 7 దశలు" />
          </Link>
          <Link href="/discover" className="btn-ghost link-btn" style={{ fontSize: '1.05rem', padding: '0.75rem 1.8rem' }}>
            <Bi en="Browse Verified Matches" te="సంబంధాలను అన్వేషించండి" />
          </Link>
        </div>
      </section>

      {session && (
        <section className="card" style={{ marginBottom: '2.5rem' }}>
          <p style={{ margin: 0 }}>
            <strong><Bi en="Active Session:" te="యాక్టివ్ సెషన్:" /></strong>{' '}
            {`Signed in as ${session.ns_membership_id} (${session.assigned_mandal}, ${session.assigned_district})`}
          </p>
        </section>
      )}

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
        <article className="card">
          <h2><Bi en="Sovereignty & Lineage Integrity" te="వంశ పవిత్రత \u0026 సగోత్ర రక్షణ" /></h2>
          <p className="lead">
            <Bi 
              en="Zero-tolerance Sagothra exclusion enforced at the database level. Direct verification through our 589 Mandal Lineage Coordinators across all 33 districts."
              te="డేటాబేస్ స్థాయిలో సగోత్ర సంబంధాల సంపూర్ణ మినహాయింపు. 33 జిల్లాల 589 మండల సమన్వయకర్తల ద్వారా క్షేత్రస్థాయి ధృవీకరణ."
            />
          </p>
        </article>

        <article className="card">
          <h2><Bi en="DPDP Act 2023 & Privacy First" te="చట్టబద్ధమైన గోప్యత \u0026 భద్రత" /></h2>
          <p className="lead">
            <Bi 
              en="All candidate contact details, phone numbers, and addresses are AES-256 encrypted. Contact details unlock exclusively upon double bilateral mutual consent."
              te="అభ్యర్థుల ఫోన్ నంబర్లు మరియు వివరాలు అత్యాధునిక ఎన్‌క్రిప్షన్‌తో భద్రపరచబడతాయి. ఇరుపక్షాల పరస్పర సమ్మతితో మాత్రమే సంప్రదింపు వివరాలు విడుదల చేయబడతాయి."
            />
          </p>
        </article>
      </div>

      <section style={{ textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid var(--navy-line)' }}>
        <p className="hint">
          <Bi 
            en="Official matrimonial portal of Nayi Samakhya Telangana (nayisamakhya.org). No external agents or commercial brokerages."
            te="నాయీ సమాఖ్య తెలంగాణ అధికారిక వివాహ వేదిక (nayisamakhya.org). ఎటువంటి ప్రైవేటు దళారులకు తావులేదు."
          />
        </p>
      </section>
    </main>
  );
}

