import { dbContext, getOnboardingStatus, listDistricts, listGothras, listMandals } from '../../lib/onboarding-store.ts';
import { getOptionalSession } from '../../lib/session.ts';
import { AuspiciousHeader } from './AuspiciousHeader.tsx';
import { Bi, Confirmation, Wizard } from './Wizard.tsx';
import { Nav } from '../Nav.tsx';

// Fallback gothra list for demo/onboarding before DB seed
const FALLBACK_GOTHRAS = [
  { id: '11111111-1111-4111-a111-111111111111', slug: 'kashyapa', nameEn: 'Kashyapa', nameTe: 'కాశ్యప' },
  { id: '22222222-2222-4222-a222-222222222222', slug: 'bharadwaja', nameEn: 'Bharadwaja', nameTe: 'భరద్వాజ' },
  { id: '33333333-3333-4333-a333-333333333333', slug: 'gautama', nameEn: 'Gautama', nameTe: 'గౌతమ' },
  { id: '44444444-4444-4444-a444-444444444444', slug: 'vashishta', nameEn: 'Vashishta', nameTe: 'వశిష్ట' },
  { id: '55555555-5555-4555-a555-555555555555', slug: 'sandilya', nameEn: 'Sandilya', nameTe: 'శాండిల్య' },
  { id: '66666666-6666-4666-a666-666666666666', slug: 'agastya', nameEn: 'Agastya', nameTe: 'అగస్త్య' },
];

const FALLBACK_DISTRICTS = [
  { slug: 'hyderabad', code: 'HYDB', nameEn: 'Hyderabad', nameTe: 'హైదరాబాద్' },
  { slug: 'warangal', code: 'WRGL', nameEn: 'Warangal', nameTe: 'వరంగల్' },
  { slug: 'karimnagar', code: 'KRMN', nameEn: 'Karimnagar', nameTe: 'కరీంనగర్' },
  { slug: 'nalgonda', code: 'NLGD', nameEn: 'Nalgonda', nameTe: 'నల్గొండ' },
  { slug: 'khammam', code: 'KMMM', nameEn: 'Khammam', nameTe: 'ఖమ్మం' },
  { slug: 'nizamabad', code: 'NZMB', nameEn: 'Nizamabad', nameTe: 'నిజామాబాద్' },
  { slug: 'rangareddy', code: 'RNGR', nameEn: 'Rangareddy', nameTe: 'రంగారెడ్డి' },
  { slug: 'suryapet', code: 'SRPT', nameEn: 'Suryapet', nameTe: 'సూర్యాపేట' },
];

const FALLBACK_MANDALS = [
  { district: 'hyderabad', slug: 'ameerpet', nameEn: 'Ameerpet' },
  { district: 'hyderabad', slug: 'khairatabad', nameEn: 'Khairatabad' },
  { district: 'warangal', slug: 'hanamkonda', nameEn: 'Hanamkonda' },
  { district: 'warangal', slug: 'kazipet', nameEn: 'Kazipet' },
  { district: 'karimnagar', slug: 'karimnagar-urban', nameEn: 'Karimnagar Urban' },
  { district: 'nalgonda', slug: 'miryalaguda', nameEn: 'Miryalaguda' },
  { district: 'khammam', slug: 'khammam-urban', nameEn: 'Khammam Urban' },
  { district: 'nizamabad', slug: 'nizamabad-north', nameEn: 'Nizamabad North' },
];

export default async function OnboardingPage() {
  const claims = await getOptionalSession();

  let status: { state: string; step: number; matrimonialId: string | null; coordinatorAssigned: boolean; reviewNote: string | null } = { state: 'draft', step: 1, matrimonialId: null, coordinatorAssigned: false, reviewNote: null };
  let gothras = FALLBACK_GOTHRAS;
  let districts = FALLBACK_DISTRICTS;
  let mandals = FALLBACK_MANDALS;

  if (claims) {
    try {
      const ctx = dbContext(claims);
      status = await getOnboardingStatus(ctx);
      gothras = await listGothras(ctx);
      districts = await listDistricts(ctx);
      mandals = await listMandals(ctx);
    } catch {
      // Keep fallbacks active
    }
  }

  const membershipId = claims?.ns_membership_id ?? 'NS-TG-NEW-00001';

  return (
    <main className="shell">
      <Nav claims={claims} />
      <AuspiciousHeader />
      
      {status.state === 'erased' ? (
        <p className="alert" role="status">
          <Bi en="Your profile was erased at your request. Contact the Grievance Officer to start again." te="మీ అభ్యర్థన మేరకు మీ ప్రొఫైల్ తొలగించబడింది. మళ్లీ ప్రారంభించడానికి ఫిర్యాదుల అధికారిని సంప్రదించండి." />
        </p>
      ) : status.step === 7 && status.matrimonialId !== null ? (
        <Confirmation matrimonialId={status.matrimonialId} coordinatorAssigned={status.coordinatorAssigned} status={status.state} />
      ) : (
        <Wizard
          membershipId={membershipId}
          gothras={gothras}
          districts={districts}
          mandals={mandals}
          startStep={status.step}
          reviewNote={status.state === 'rejected' ? status.reviewNote : null}
        />
      )}
    </main>
  );
}
