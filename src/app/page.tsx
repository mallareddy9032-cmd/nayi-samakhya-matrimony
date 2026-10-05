import Link from 'next/link';
import { requireSession } from '../lib/session.ts';
import { Nav } from './Nav.tsx';
import { Bi } from './onboarding/Wizard.tsx';

export default async function Home() {
  const session = await requireSession();
  return (
    <main className="shell">
      <Nav claims={session} />
      <h1>Nayi Samakhya Matrimony</h1>
      <p>{`Signed in as ${session.ns_membership_id} (${session.assigned_mandal}, ${session.assigned_district})`}</p>
      <ul className="list">
        <li><Link href="/onboarding"><Bi en="Create or view your matrimonial profile" te="మీ వివాహ ప్రొఫైల్‌ను సృష్టించండి లేదా చూడండి" /></Link></li>
        <li><Link href="/discover"><Bi en="Discover verified matches" te="ధృవీకరించబడిన సంబంధాలను అన్వేషించండి" /></Link></li>
        <li><Link href="/settings/privacy"><Bi en="Privacy, photo and consent settings" te="గోప్యత, ఫోటో, సమ్మతి సెట్టింగ్‌లు" /></Link></li>
      </ul>
    </main>
  );
}
