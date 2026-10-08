'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';

export default function LoginPage() {
  const [method, setMethod] = useState<'ns_id' | 'phone'>('ns_id');
  const [identifier, setIdentifier] = useState('');
  const [pinOrOtp, setPinOrOtp] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    // Simulated verification / API linkage
    setTimeout(() => {
      setIsSubmitting(false);
      if (!identifier.trim()) {
        setStatusMsg({ type: 'error', text: 'Please enter your registered NS-ID or Phone Number.' });
        return;
      }
      setStatusMsg({
        type: 'info',
        text: 'Parent SSO verification: Redirecting to verify credentials securely...',
      });
      // Redirect to onboarding or profile
      window.location.href = '/matrimony/onboarding';
    }, 800);
  };

  return (
    <main className="shell">
      <Nav />
      <div style={{ maxWidth: '520px', margin: '2.5rem auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="badge" style={{ marginBottom: '0.6rem' }}>
              <Bi en="Matrimonial Member Access" te="వివాహ సభ్యుల లాగిన్" />
            </span>
            <h1 style={{ fontSize: '1.8rem', margin: '0.4rem 0' }}>
              <Bi en="Sign In to Your Profile" te="మీ వివాహ ఖాతాలోకి ప్రవేశించండి" />
            </h1>
            <p className="hint">
              <Bi 
                en="Dedicated candidate & parent portal for Nayi Samakhya Matrimony" 
                te="నాయీ సమాఖ్య కల్యాణ వేదిక సభ్యులు మరియు కుటుంబాల కోసం ప్రత్యేక ప్రవేశం" 
              />
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#0e1c36', padding: '0.3rem', borderRadius: '10px' }}>
            <button
              type="button"
              className={method === 'ns_id' ? 'btn' : 'btn-ghost'}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderRadius: '8px' }}
              onClick={() => { setMethod('ns_id'); setStatusMsg(null); }}
            >
              <Bi en="Nayi ID (NS-ID)" te="నాయీ ఐడీ (NS-ID)" />
            </button>
            <button
              type="button"
              className={method === 'phone' ? 'btn' : 'btn-ghost'}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderRadius: '8px' }}
              onClick={() => { setMethod('phone'); setStatusMsg(null); }}
            >
              <Bi en="Mobile OTP" te="మొబైల్ ఓటీపీ" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {method === 'ns_id' ? (
              <div className="field">
                <label htmlFor="ns_id">
                  <Bi en="Community Membership ID" te="నాయీ సమాఖ్య సభ్యత్వ ఐడీ (NS-ID)" />
                </label>
                <input
                  id="ns_id"
                  type="text"
                  placeholder="e.g. NS-TG-HYDB-00123"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <p className="hint">
                  <Bi en="Found on your Nayi Samakhya member card" te="మీ నాయీ సమాఖ్య సభ్యత్వ గుర్తింపు కార్డుపై ఉన్న నంబర్" />
                </p>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="phone">
                  <Bi en="Registered Mobile Number" te="నమోదిత మొబైల్ నంబర్" />
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9848012345"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field" style={{ marginTop: '1rem' }}>
              <label htmlFor="security">
                <Bi en={method === 'ns_id' ? 'Account Passcode / PIN' : 'OTP Code'} te={method === 'ns_id' ? 'పాస్‌కోడ్ / పిన్' : 'ఓటీపీ కోడ్'} />
              </label>
              <input
                id="security"
                type="password"
                placeholder="••••••"
                value={pinOrOtp}
                onChange={(e) => setPinOrOtp(e.target.value)}
                required
              />
            </div>

            {statusMsg && (
              <p className={statusMsg.type === 'error' ? 'alert' : 'notice'} style={{ marginTop: '1rem' }}>
                {statusMsg.text}
              </p>
            )}

            <div style={{ marginTop: '1.8rem' }}>
              <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem' }} disabled={isSubmitting}>
                <Bi en={isSubmitting ? 'Authenticating…' : 'Enter Matrimony Portal →'} te={isSubmitting ? 'ధృవీకరిస్తోంది…' : 'కల్యాణ వేదికలోకి ప్రవేశించండి →'} />
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.8rem', borderTop: '1px solid var(--navy-line)', paddingTop: '1.2rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
              <Bi en="New candidate or looking to register?" te="కొత్తగా సంబంధం నమోదు చేసుకోవాలా?" />{' '}
              <Link href="/onboarding" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>
                <Bi en="Create 7-Step Profile" te="ఇక్కడ నమోదు చేసుకోండి" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
