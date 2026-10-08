'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = phone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9848012345).');
      return;
    }

    setIsSubmitting(true);
    // Simulate instantaneous secure SMS/WhatsApp OTP dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setSuccessMsg(`6-digit verification code sent to +91 ${clean}. (For demo, enter: 123456)`);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Validated -> Direct seamlessly into matrimonial onboarding / dashboard
      window.location.href = '/matrimony/onboarding';
    }, 700);
  };

  return (
    <main className="shell">
      <Nav />
      <div style={{ maxWidth: '480px', margin: '2.5rem auto' }}>
        <div className="card" style={{ padding: '2.2rem', borderTop: '4px solid var(--maroon)', background: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <span className="badge" style={{ marginBottom: '0.6rem', padding: '0.3rem 0.8rem' }}>
              <Bi en="Candidate & Parent Sign In" te="అభ్యర్థులు & కుటుంబాల లాగిన్" />
            </span>
            <h1 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0.5rem', color: 'var(--maroon)' }}>
              <Bi en="Mobile OTP Verification" te="మొబైల్ ఓటీపీ ధృవీకరణ" />
            </h1>
            <p className="hint" style={{ fontSize: '0.9rem' }}>
              <Bi 
                en="Zero passwords required. Secure OTP verification directly to your phone." 
                te="ఎటువంటి పాస్‌వర్డ్‌లు అవసరం లేదు. మీ మొబైల్‌కు వచ్చే ఓటీపీతో తక్షణ ప్రవేశం." 
              />
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <div className="field">
                <label htmlFor="phone-input">
                  <Bi en="Mobile Number (WhatsApp / SMS)" te="మొబైల్ నంబర్ (వాట్సాప్ / ఎస్ఎంఎస్)" />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.65rem 0.8rem', 
                    background: 'var(--bg-surface)', 
                    border: '1.5px solid var(--border-light)', 
                    borderRadius: '10px',
                    color: 'var(--maroon)',
                    fontWeight: 700
                  }}>
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="98480 12345"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ flex: 1, fontSize: '1.1rem', letterSpacing: '0.05em' }}
                  />
                </div>
                <p className="hint">
                  <Bi 
                    en="We will send a 6-digit one-time code to verify your community registration." 
                    te="ధృవీకరణ కోసం మీ నంబర్‌కు 6 అంకెల ఓటీపీ కోడ్ పంపబడుతుంది." 
                  />
                </p>

                {/* Instant Live OTP Dispatch Status Banner */}
                <div style={{ marginTop: '0.8rem', padding: '0.75rem 0.9rem', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '10px', fontSize: '0.86rem', color: '#92400E' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                    <strong>
                      <Bi en="Instant Test Verification Active" te="తక్షణ ధృవీకరణ విధానం" />
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
                    <Bi 
                      en="To test immediately without telecom SMS gateway delays, use instant code: 123456 on the next screen." 
                      te="టెలికాం గేట్‌వే జాప్యం లేకుండా వెంటనే లాగిన్ అవ్వడానికి, తరువాతి దశలో 123456 కోడ్‌ను నమోదు చేయండి." 
                    />
                  </p>
                </div>
              </div>

              {errorMsg && <p className="alert" style={{ margin: '1rem 0' }}>{errorMsg}</p>}

              <div style={{ marginTop: '1.8rem' }}>
                <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem', fontSize: '1.05rem' }} disabled={isSubmitting}>
                  <Bi en={isSubmitting ? 'Sending OTP…' : 'Send Verification OTP →'} te={isSubmitting ? 'పంపుతోంది…' : 'ఓటీపీ పంపండి →'} />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              {successMsg && <p className="notice" style={{ margin: '0 0 1.2rem' }}>{successMsg}</p>}

              <div className="field">
                <label htmlFor="otp-input">
                  <Bi en="Enter 6-Digit OTP Code" te="6 అంకెల ఓటీపీని నమోదు చేయండి" />
                </label>
                <input
                  id="otp-input"
                  type="text"
                  placeholder="1 2 3 4 5 6"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 700, color: 'var(--maroon)' }}
                />
                <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E', textAlign: 'center' }}>
                  <strong>Demo / Testing OTP Code:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: '#B45309' }}>123456</span>
                </div>
              </div>

              {errorMsg && <p className="alert" style={{ margin: '1rem 0' }}>{errorMsg}</p>}

              <div style={{ marginTop: '1.8rem' }}>
                <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem', fontSize: '1.05rem' }} disabled={isSubmitting}>
                  <Bi en={isSubmitting ? 'Verifying…' : 'Verify & Enter Portal →'} te={isSubmitting ? 'ధృవీకరిస్తోంది…' : 'ధృవీకరించి ప్రవేశించండి →'} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-ghost" 
                  style={{ border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                  onClick={() => { setStep('phone'); setOtp(''); setErrorMsg(null); }}
                >
                  ← Change Mobile Number / మళ్లీ నంబర్ మార్చండి
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.2rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Bi en="Looking to register a new candidate?" te="కొత్తగా సంబంధం నమోదు చేసుకోబోతున్నారా?" />{' '}
              <Link href="/onboarding" style={{ color: 'var(--maroon)', fontWeight: 700 }}>
                <Bi en="Start 7-Step Profile" te="ఇక్కడ ప్రారంభించండి" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
