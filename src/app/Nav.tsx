import Link from 'next/link';
import { ADMIN_ROLES } from '../lib/matrimony.ts';
import type { SsoClaims } from '../lib/sso.ts';
import { Bi } from './onboarding/Wizard.tsx';
import { LanguageToggle } from '../components/LanguageToggle.tsx';

export function Nav({ claims }: { claims?: SsoClaims | null }) {
  const admin = claims?.roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
  return (
    <nav className="topnav" aria-label="Matrimony" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%', 
            background: 'var(--maroon)', 
            display: 'grid', 
            placeItems: 'center', 
            color: 'var(--gold-bright)', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            border: '2px solid var(--gold-bright)',
            boxShadow: '0 2px 8px rgba(139, 29, 44, 0.2)' 
          }}>
            NS
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.15rem', color: 'var(--maroon)', fontWeight: 800, lineHeight: 1.15 }}>
              నాయీ సమాఖ్య కల్యాణ వేదిక
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Nayi Samakhya Matrimony · 33 Districts
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontWeight: 600, fontSize: '0.92rem' }}><Bi en="Home" te="హోమ్" /></Link>
        <Link href="/discover" style={{ fontWeight: 600, fontSize: '0.92rem' }}><Bi en="Discover" te="అన్వేషణ" /></Link>
        {claims && <Link href="/interests" style={{ fontWeight: 600, fontSize: '0.92rem' }}><Bi en="Interests" te="ఆసక్తులు" /></Link>}
        {claims && <Link href="/settings/privacy" style={{ fontWeight: 600, fontSize: '0.92rem' }}><Bi en="Privacy" te="గోప్యత" /></Link>}
        {admin && <Link href="/nsm-admin" style={{ fontWeight: 600, fontSize: '0.92rem' }}><Bi en="Admin" te="నిర్వహణ" /></Link>}
        <LanguageToggle />
        {!claims && (
          <Link href="/login" className="btn link-btn" style={{ padding: '0.45rem 1.2rem', fontSize: '0.88rem' }}>
            <Bi en="Member Login (OTP)" te="సభ్యుల లాగిన్" />
          </Link>
        )}
      </div>
    </nav>
  );
}
