import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getProfileView, type InterestState } from '../../../lib/match-store.ts';
import { badgesFor } from '../../../lib/matrimony.ts';
import { INCOME_BRACKETS, NAKSHATRAS, NOTICES, VOCATIONS, type Bilingual } from '../../../lib/onboarding.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';
import { requireSession } from '../../../lib/session.ts';
import { ActionButton, ConsentControl } from '../../components.tsx';
import { Nav } from '../../Nav.tsx';
import { Bi } from '../../onboarding/Wizard.tsx';
import { PhotoFrame } from '../PhotoFrame.tsx';

const API = '/matrimony/api';
const label = <T extends Record<string, Bilingual>>(map: T, key: string | null) => (key && key in map ? map[key as keyof T] : null);

function InterestPanel({ profileId, interest }: { profileId: string; interest: InterestState }) {
  if (!interest) {
    return <ActionButton url={`${API}/interests/express`} body={{ profileId }} label={{ en: 'Express sincere interest', te: 'నిజాయితీగల ఆసక్తిని తెలపండి' }} />;
  }
  const { id, status, sentByMe, myConsent, theirConsent } = interest;
  if (status === 'sent' && sentByMe) return <p className="badge"><Bi en="Interest sent — awaiting their response" te="ఆసక్తి పంపబడింది — వారి స్పందన కోసం వేచి ఉంది" /></p>;
  if (status === 'sent') {
    return (
      <div className="row">
        <ActionButton url={`${API}/interests/respond`} body={{ interestId: id, decision: 'accepted' }} label={{ en: 'Accept interest', te: 'ఆసక్తిని అంగీకరించండి' }} />
        <ActionButton url={`${API}/interests/respond`} body={{ interestId: id, decision: 'declined' }} label={{ en: 'Decline', te: 'తిరస్కరించండి' }} ghost />
      </div>
    );
  }
  const consent = (
    <ConsentControl url={`${API}/interests/consent-contact`} body={{ interestId: id }} notice={NOTICES.contactShare} granted={myConsent} />
  );
  if (status === 'accepted') {
    return (
      <>
        <p className="lead">
          {theirConsent
            ? <Bi en="They have agreed to share contact details. Contact unlocks once you agree too." te="వారు సంప్రదింపు వివరాలు పంచుకోవడానికి సమ్మతించారు. మీరూ సమ్మతిస్తే వివరాలు అందుబాటులోకి వస్తాయి." />
            : <Bi en="Interest accepted. Contact details unlock only when both of you agree to share them." te="ఆసక్తి అంగీకరించబడింది. మీరిద్దరూ సమ్మతిస్తేనే సంప్రదింపు వివరాలు అందుబాటులోకి వస్తాయి." />}
        </p>
        {consent}
      </>
    );
  }
  if (status === 'contact_unlocked') {
    return (
      <>
        <h3><Bi en="Contact card" te="సంప్రదింపు కార్డు" /></h3>
        <p className="hint"><Bi en="Each time contact details are shown, the view is recorded and visible to the member." te="సంప్రదింపు వివరాలు చూపిన ప్రతిసారీ ఆ వీక్షణ నమోదు చేయబడుతుంది, సభ్యునికి కనిపిస్తుంది." /></p>
        <ActionButton
          url={`${API}/interests/contact`}
          body={{ interestId: id }}
          label={{ en: 'Show contact details', te: 'సంప్రదింపు వివరాలు చూపించండి' }}
          reveal={{ phone: { en: 'Phone', te: 'ఫోన్' }, email: { en: 'Email', te: 'ఇమెయిల్' }, whatsapp: { en: 'WhatsApp', te: 'వాట్సాప్' } }}
        />
        {consent}
      </>
    );
  }
  return <p className="badge">{status === 'declined' ? <Bi en="Interest declined" te="ఆసక్తి తిరస్కరించబడింది" /> : <Bi en="This interest is closed" te="ఈ ఆసక్తి ముగిసింది" />}</p>;
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await requireSession();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const p = await getProfileView(dbContext(claims), id.data);
  if (!p) notFound();
  const vocation = label(VOCATIONS, p.vocation);
  const income = label(INCOME_BRACKETS, p.incomeBracket);
  const nakshatra = label(NAKSHATRAS, p.nakshatra);

  return (
    <main className="shell">
      <Nav claims={claims} />
      <section className="card profile">
        <PhotoFrame photo={p.photo} name={p.displayName} />
        <h1>{p.displayName}, {p.age}</h1>
        <ul className="badges">
          {badgesFor(p).map((b) => <li key={b.en} className="badge">{b.href ? <a href={b.href}><Bi {...b} /></a> : <Bi {...b} />}</li>)}
        </ul>
        <dl className="summary">
          <dt><Bi en="Ancestral place" te="పూర్వీకుల స్వస్థలం" /></dt><dd>{p.mandal}, <Bi {...p.district} /></dd>
          {vocation && <><dt><Bi en="Vocation" te="వృత్తి" /></dt><dd><Bi {...vocation} /></dd></>}
          {p.educationDegree && <><dt><Bi en="Education" te="విద్య" /></dt><dd>{p.educationDegree}</dd></>}
          {p.occupation && <><dt><Bi en="Occupation" te="ఉద్యోగం" /></dt><dd>{p.occupation}</dd></>}
          {income && <><dt><Bi en="Annual income" te="వార్షిక ఆదాయం" /></dt><dd><Bi {...income} /></dd></>}
          {nakshatra && <><dt><Bi en="Nakshatra" te="నక్షత్రం" /></dt><dd><Bi {...nakshatra} /></dd></>}
          {p.birthTime && <><dt><Bi en="Time of birth" te="పుట్టిన సమయం" /></dt><dd>{p.birthTime}</dd></>}
          {p.birthPlace && <><dt><Bi en="Place of birth" te="పుట్టిన స్థలం" /></dt><dd>{p.birthPlace}</dd></>}
        </dl>
        <InterestPanel profileId={p.id} interest={p.interest} />
      </section>
      <details className="card report">
        <summary><Bi en="Report this profile to the Grievance Officer" te="ఈ ప్రొఫైల్‌పై ఫిర్యాదుల అధికారికి ఫిర్యాదు చేయండి" /></summary>
        <ActionButton
          url={`${API}/grievances`}
          body={{ profileId: p.id }}
          label={{ en: 'Send report', te: 'ఫిర్యాదు పంపండి' }}
          ghost
          fields={[
            { name: 'category', kind: 'select', required: true, label: { en: 'Reason', te: 'కారణం' },
              options: [{ value: 'unauthorized_photo', label: 'Photo is not of this member · ఫోటో ఈ సభ్యునిది కాదు' }, { value: 'profile_dispute', label: 'Profile details are false · వివరాలు తప్పు' }] },
            { name: 'description', kind: 'textarea', required: true, maxLength: 2000, label: { en: 'Details (do not include phone numbers or addresses)', te: 'వివరాలు (ఫోన్ నంబర్లు, చిరునామాలు రాయవద్దు)' } },
          ]}
        />
      </details>
    </main>
  );
}
