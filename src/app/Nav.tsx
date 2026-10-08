import Link from 'next/link';
import { ADMIN_ROLES } from '../lib/matrimony.ts';
import type { SsoClaims } from '../lib/sso.ts';
import { Bi } from './onboarding/Wizard.tsx';
import { LanguageToggle } from '../components/LanguageToggle.tsx';

export function Nav({ claims }: { claims?: SsoClaims | null }) {
  const admin = claims?.roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
  return (
    <nav className="topnav" aria-label="Matrimony" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #801426 0%, #5B0C1A 100%)', 
            display: 'grid', 
            placeItems: 'center', 
            color: '#FCD34D', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            border: '2px solid #D4AF37',
            boxShadow: '0 4px 14px rgba(128, 20, 38, 0.25)' 
          }}>
            NS
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.18rem', color: '#801426', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              నాయీ సమాఖ్య కల్యాణ వేదిక
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              Nayi Samakhya Matrimony · 33 Districts
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}><Bi en="Home" te="హోమ్" /></Link>
        <Link href="/discover" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}><Bi en="Discover" te="అన్వేషణ" /></Link>
        {claims && <Link href="/interests" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}><Bi en="Interests" te="ఆసక్తులు" /></Link>}
        {claims && <Link href="/settings/privacy" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}><Bi en="Privacy" te="గోప్యత" /></Link>}
        {admin && <Link href="/nsm-admin" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}><Bi en="Admin" te="నిర్వహణ" /></Link>}
        <LanguageToggle />
        {!claims && (
          <Link 
            href="/login" 
            className="btn link-btn" 
            style={{ 
              padding: '0.55rem 1.4rem', 
              fontSize: '0.9rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #801426 0%, #5B0C1A 100%)',
              color: '#FFFFFF',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(128, 20, 38, 0.25)'
            }}
          >
            <Bi en="Member Login (OTP)" te="సభ్యుల లాగిన్" />
          </Link>
        )}
      </div>
    </nav>
  );
}
