import Link from 'next/link';
import { listInterests } from '../../lib/match-store.ts';
import type { Bilingual } from '../../lib/onboarding.ts';
import { dbContext } from '../../lib/onboarding-store.ts';
import { requireSession } from '../../lib/session.ts';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';

const STATUS: Record<string, Bilingual> = {
  sent: { en: 'Awaiting response', te: 'స్పందన కోసం వేచి ఉంది' },
  accepted: { en: 'Accepted — contact consent pending', te: 'అంగీకరించబడింది — సంప్రదింపు సమ్మతి పెండింగ్' },
  contact_unlocked: { en: 'Contact unlocked', te: 'సంప్రదింపు అందుబాటులో ఉంది' },
  declined: { en: 'Declined', te: 'తిరస్కరించబడింది' },
  withdrawn: { en: 'Withdrawn', te: 'ఉపసంహరించబడింది' },
  expired: { en: 'Expired', te: 'గడువు ముగిసింది' },
};

export default async function InterestsPage() {
  const claims = await requireSession();
  const interests = await listInterests(dbContext(claims));
  return (
    <main className="shell">
      <Nav claims={claims} />
      <h1><Bi en="Interests" te="ఆసక్తులు" /></h1>
      <p className="hint"><Bi en="Accept, decline and share or withdraw contact consent on each profile page." te="ప్రతి ప్రొఫైల్ పేజీలో అంగీకరించండి, తిరస్కరించండి, సంప్రదింపు సమ్మతి ఇవ్వండి లేదా ఉపసంహరించుకోండి." /></p>
      {interests.length === 0 ? (
        <p className="lead"><Bi en="No interests yet." te="ఇంకా ఆసక్తులు లేవు." /></p>
      ) : (
        <ul className="list">
          {interests.map((i) => (
            <li key={i.id} className="card">
              <span className="badge">{i.sentByMe ? <Bi en="Sent" te="పంపినవి" /> : <Bi en="Received" te="అందినవి" />}</span>{' '}
              {i.otherId && i.otherName
                ? <Link href={`/profiles/${i.otherId}`}>{i.otherName}</Link>
                : <Bi en="Profile no longer available" te="ప్రొఫైల్ ఇక అందుబాటులో లేదు" />}
              {' · '}
              <Bi {...(STATUS[i.status] ?? { en: i.status, te: i.status })} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
