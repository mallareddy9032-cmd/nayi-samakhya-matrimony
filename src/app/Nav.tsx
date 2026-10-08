import Link from 'next/link';
import { ADMIN_ROLES } from '../lib/matrimony.ts';
import type { SsoClaims } from '../lib/sso.ts';
import { Bi } from './onboarding/Wizard.tsx';

export function Nav({ claims }: { claims?: SsoClaims | null }) {
  const admin = claims?.roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
  return (
    <nav className="topnav" aria-label="Matrimony">
      <Link href="/"><Bi en="Home" te="హోమ్" /></Link>
      <Link href="/discover"><Bi en="Discover" te="అన్వేషణ" /></Link>
      {claims && <Link href="/interests"><Bi en="Interests" te="ఆసక్తులు" /></Link>}
      {claims && <Link href="/settings/privacy"><Bi en="Privacy" te="గోప్యత" /></Link>}
      {admin && <Link href="/nsm-admin"><Bi en="Admin" te="నిర్వహణ" /></Link>}
      {!claims && <Link href="/login" className="link-btn" style={{ marginLeft: 'auto', padding: '0.2rem 0.8rem', fontSize: '0.85rem' }}><Bi en="Member Login" te="సభ్యుల లాగిన్" /></Link>}
    </nav>
  );
}
