import Link from 'next/link';
import { privacyOverview } from '../../../lib/match-store.ts';
import { CONSENT_NOTICES } from '../../../lib/matrimony.ts';
import type { Bilingual } from '../../../lib/onboarding.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';
import { requireSession } from '../../../lib/session.ts';
import { ActionButton, ConsentControl, PhotoUpload } from '../../components.tsx';
import { Nav } from '../../Nav.tsx';
import { Bi } from '../../onboarding/Wizard.tsx';
import { PhotoFrame } from '../../profiles/PhotoFrame.tsx';

const PURPOSES: [keyof typeof CONSENT_NOTICES, Bilingual][] = [
  ['community_pledge', { en: 'Self-Respect Pledge', te: 'ఆత్మగౌరవ ప్రతిజ్ఞ' }],
  ['profile_processing', { en: 'Profile processing for matchmaking (DPDP s.6)', te: 'సంబంధాల కోసం ప్రొఫైల్ ప్రాసెసింగ్ (డీపీడీపీ సె.6)' }],
  ['coordinator_verification', { en: 'Coordinator verification, incl. door address', te: 'సమన్వయకర్త ధృవీకరణ, ఇంటి చిరునామాతో సహా' }],
];

export default async function PrivacyPage() {
  const claims = await requireSession();
  const o = await privacyOverview(dbContext(claims));
  const photoConsent = o.consents.photo_display?.granted === true;

  return (
    <main className="shell">
      <Nav claims={claims} />
      <h1><Bi en="Privacy & consent" te="గోప్యత & సమ్మతి" /></h1>
      {o.status === 'suspended' && (
        <p className="alert" role="status">
          <Bi
            en="Your profile is suspended because a consent was withdrawn: it is hidden and not processed. Give all three consents again to send it back for verification."
            te="ఒక సమ్మతి ఉపసంహరించబడినందున మీ ప్రొఫైల్ నిలిపివేయబడింది: అది దాచబడింది, ప్రాసెస్ చేయబడదు. మళ్లీ ధృవీకరణకు పంపడానికి మూడు సమ్మతులనూ మళ్లీ ఇవ్వండి."
          />
        </p>
      )}
      {o.status === 'not_started' || o.status === 'erased' ? (
        <p className="lead"><Link href="/onboarding"><Bi en="Profile status" te="ప్రొఫైల్ స్థితి" /></Link></p>
      ) : (
        <>
          <section className="card">
            <h2><Bi en="Your consents" te="మీ సమ్మతులు" /></h2>
            <p className="hint"><Bi en="Withdrawing any of these stops processing at once and hides your profile." te="వీటిలో ఏదైనా ఉపసంహరిస్తే ప్రాసెసింగ్ వెంటనే ఆగి, మీ ప్రొఫైల్ దాచబడుతుంది." /></p>
            {PURPOSES.map(([purpose, title]) => {
              const c = o.consents[purpose];
              return (
                <fieldset key={purpose}>
                  <legend><Bi {...title} /></legend>
                  <p className="badge">{c?.granted ? <Bi en="Given" te="ఇవ్వబడింది" /> : <Bi en="Withdrawn" te="ఉపసంహరించబడింది" />}{c && ` · ${c.version} · ${c.at.toISOString().slice(0, 10)}`}</p>
                  <ConsentControl url="/matrimony/api/consents" body={{ purpose }} notice={CONSENT_NOTICES[purpose]} granted={c?.granted === true} />
                </fieldset>
              );
            })}
          </section>

          <section className="card">
            <h2><Bi en="Photo" te="ఫోటో" /></h2>
            {o.photo && <PhotoFrame photo={o.photo} name="you" />}
            {photoConsent && o.photo && (
              <fieldset>
                <legend><Bi en="Photo consent" te="ఫోటో సమ్మతి" /></legend>
                <p className="hint"><Bi en="Withdrawing deletes your photo." te="ఉపసంహరిస్తే మీ ఫోటో తొలగించబడుతుంది." /></p>
                <ConsentControl url="/matrimony/api/consents" body={{ purpose: 'photo_display' }} notice={CONSENT_NOTICES.photo_display} granted allowGrant={false} />
              </fieldset>
            )}
            {o.status !== 'suspended' && (
              <>
                <p className="hint"><Bi en="A new photo sends a verified profile back to your coordinator for review." te="కొత్త ఫోటో పెడితే ధృవీకరించబడిన ప్రొఫైల్ మళ్లీ సమన్వయకర్త సమీక్షకు వెళ్తుంది." /></p>
                <PhotoUpload />
              </>
            )}
          </section>

          <section className="card">
            <h2><Bi en="Contact sharing" te="సంప్రదింపు వివరాల పంపకం" /></h2>
            <p className="lead">
              <Bi en="You give and withdraw contact consent per match, on that member's profile page." te="ప్రతి సంబంధానికి సంప్రదింపు సమ్మతిని ఆ సభ్యుని ప్రొఫైల్ పేజీలో ఇవ్వవచ్చు, ఉపసంహరించుకోవచ్చు." />{' '}
              <Link href="/interests"><Bi en="Your interests" te="మీ ఆసక్తులు" /></Link>
            </p>
          </section>

          <section className="card">
            <h2><Bi en="Erase my data" te="నా డేటాను తొలగించండి" /></h2>
            <p className="hint">
              <Bi
                en="Two Grievance Officers must approve an erasure. Your profile, photo and contact details are then deleted; the consent and audit records the law requires are kept."
                te="తొలగింపును ఇద్దరు ఫిర్యాదుల అధికారులు ఆమోదించాలి. ఆ తర్వాత మీ ప్రొఫైల్, ఫోటో, సంప్రదింపు వివరాలు తొలగించబడతాయి; చట్టం కోరే సమ్మతి, ఆడిట్ రికార్డులు మాత్రం ఉంటాయి."
              />
            </p>
            <ActionButton
              url="/matrimony/api/grievances"
              body={{ category: 'data_erasure', profileId: null }}
              label={{ en: 'Request erasure', te: 'తొలగింపును అభ్యర్థించండి' }}
              ghost
              fields={[{ name: 'description', kind: 'textarea', required: true, maxLength: 2000, label: { en: 'Reason', te: 'కారణం' } }]}
            />
          </section>
        </>
      )}

      {o.tickets.length > 0 && (
        <section className="card">
          <h2><Bi en="Your requests to the Grievance Officer" te="ఫిర్యాదుల అధికారికి మీ అభ్యర్థనలు" /></h2>
          <ul className="list">
            {o.tickets.map((t) => <li key={t.id}>{`${t.category} · ${t.status} · ${t.created_at.toISOString().slice(0, 10)}`}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
