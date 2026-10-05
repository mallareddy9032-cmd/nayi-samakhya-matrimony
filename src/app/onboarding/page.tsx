import { dbContext, getOnboardingStatus, listDistricts, listGothras, listMandals } from '../../lib/onboarding-store.ts';
import { requireSession } from '../../lib/session.ts';
import { AuspiciousHeader } from './AuspiciousHeader.tsx';
import { Bi, Confirmation, Wizard } from './Wizard.tsx';

// Step 1 (session + membership guard) happens here, server-side, before any form is rendered.
export default async function OnboardingPage() {
  const claims = await requireSession();
  const ctx = dbContext(claims);
  const status = await getOnboardingStatus(ctx);

  return (
    <main className="shell">
      <AuspiciousHeader />
      {status.state === 'erased' ? (
        <p className="alert" role="status">
          <Bi en="Your profile was erased at your request. Contact the Grievance Officer to start again." te="మీ అభ్యర్థన మేరకు మీ ప్రొఫైల్ తొలగించబడింది. మళ్లీ ప్రారంభించడానికి ఫిర్యాదుల అధికారిని సంప్రదించండి." />
        </p>
      ) : status.step === 7 && status.matrimonialId !== null ? (
        <Confirmation matrimonialId={status.matrimonialId} coordinatorAssigned={status.coordinatorAssigned} status={status.state} />
      ) : (
        <Wizard
          membershipId={claims.ns_membership_id}
          gothras={await listGothras(ctx)}
          districts={await listDistricts(ctx)}
          mandals={await listMandals(ctx)}
          startStep={status.step}
          reviewNote={status.state === 'rejected' ? status.reviewNote : null}
        />
      )}
    </main>
  );
}
