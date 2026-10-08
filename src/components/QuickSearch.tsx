'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bi } from '../app/onboarding/Wizard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export function QuickSearch({ districts }: { districts: string[] }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [lookingFor, setLookingFor] = useState<'female' | 'male'>('female');
  const [ageRange, setAgeRange] = useState('21-25');
  const [district, setDistrict] = useState('');
  const [vocation, setVocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [ageMin, ageMax] = ageRange ? ageRange.split('-') : ['21', '35'];
    const params = new URLSearchParams();
    if (lookingFor) params.set('gender', lookingFor);
    if (ageMin) params.set('ageMin', ageMin);
    if (ageMax) params.set('ageMax', ageMax);
    if (district) params.set('district', district.toLowerCase());
    if (vocation) params.set('vocation', vocation);

    router.push(`/discover?${params.toString()}`);
  };

  return (
    <div 
      className="card"
      style={{ 
        background: '#FFFFFF', 
        borderRadius: '24px', 
        padding: '2rem', 
        boxShadow: '0 20px 40px rgba(139, 29, 44, 0.08), 0 1px 3px rgba(0,0,0,0.05)', 
        border: '1.5px solid var(--gold-border, #E2D9CC)',
        position: 'relative'
      }}
    >
      <div style={{ borderBottom: '2px solid #F7F3EE', paddingBottom: '0.9rem', marginBottom: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🔍</span>
          <h3 style={{ margin: 0, color: 'var(--maroon, #8B1D2C)', fontSize: '1.35rem', fontWeight: 800 }}>
            <Bi en="Quick Match Search" te="సంబంధాల శోధన" />
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
          <Bi en="Find verified matches aligned with your preferences" te="మీ ప్రాధాన్యతలకు తగిన సంబంధాలను వెంటనే శోధించండి" />
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
        {/* Looking For: Interactive Toggle Buttons */}
        <div>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            <Bi en="Looking For:" te="నేను వెతుకుతున్నది:" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setLookingFor('female')}
              style={{
                padding: '0.75rem 0.6rem',
                borderRadius: '12px',
                border: lookingFor === 'female' ? '2px solid #8B1D2C' : '1.5px solid #CBD5E1',
                background: lookingFor === 'female' ? '#FFF1F2' : '#FFFFFF',
                color: lookingFor === 'female' ? '#8B1D2C' : '#475569',
                fontWeight: lookingFor === 'female' ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: lookingFor === 'female' ? '0 4px 12px rgba(139, 29, 44, 0.12)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>👰</span>
              <span><Bi en="Bride" te="వధువు" /></span>
            </button>

            <button
              type="button"
              onClick={() => setLookingFor('male')}
              style={{
                padding: '0.75rem 0.6rem',
                borderRadius: '12px',
                border: lookingFor === 'male' ? '2px solid #8B1D2C' : '1.5px solid #CBD5E1',
                background: lookingFor === 'male' ? '#FFF1F2' : '#FFFFFF',
                color: lookingFor === 'male' ? '#8B1D2C' : '#475569',
                fontWeight: lookingFor === 'male' ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: lookingFor === 'male' ? '0 4px 12px rgba(139, 29, 44, 0.12)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>🤵</span>
              <span><Bi en="Groom" te="వరుడు" /></span>
            </button>
          </div>
        </div>

        {/* Age and District Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label htmlFor="qs-age" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              <Bi en="Age Range:" te="వయస్సు:" />
            </label>
            <select
              id="qs-age"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
            >
              <option value="18-24">{lang === 'en' ? '18 - 24 Years' : '18 - 24 సంవత్సరాలు'}</option>
              <option value="21-26">{lang === 'en' ? '21 - 26 Years' : '21 - 26 సంవత్సరాలు'}</option>
              <option value="25-30">{lang === 'en' ? '25 - 30 Years' : '25 - 30 సంవత్సరాలు'}</option>
              <option value="31-35">{lang === 'en' ? '31 - 35 Years' : '31 - 35 సంవత్సరాలు'}</option>
              <option value="36-45">{lang === 'en' ? '36 - 45 Years' : '36 - 45 సంవత్సరాలు'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="qs-district" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              <Bi en="Native District:" te="స్వస్థల జిల్లా:" />
            </label>
            <select
              id="qs-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
            >
              <option value="">{lang === 'en' ? 'All 33 Districts' : 'అన్ని జిల్లాలు'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vocation / Stream */}
        <div>
          <label htmlFor="qs-vocation" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            <Bi en="Profession / Stream:" te="వృత్తి / రంగం:" />
          </label>
          <select
            id="qs-vocation"
            value={vocation}
            onChange={(e) => setVocation(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
          >
            <option value="">{lang === 'en' ? 'All Professions' : 'అన్ని రంగాలు'}</option>
            <option value="corporate_tech_civil">{lang === 'en' ? 'Software & IT Tech' : 'సాఫ్ట్‌వేర్ & ఐటీ'}</option>
            <option value="government">{lang === 'en' ? 'Government Sector' : 'ప్రభుత్వ రంగం'}</option>
            <option value="wellness_artisan">{lang === 'en' ? 'Salon & Wellness Founders' : 'సెలూన్ వ్యవస్థాపకులు'}</option>
            <option value="healthcare">{lang === 'en' ? 'Healthcare & Pharma' : 'వైద్య రంగం'}</option>
            <option value="nadopasana">{lang === 'en' ? 'Classical & Heritage Arts' : 'నాదోపాసన కళలు'}</option>
          </select>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
            color: '#1A202C',
            padding: '0.9rem',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.05rem',
            cursor: 'pointer',
            marginTop: '0.4rem',
            boxShadow: '0 6px 16px rgba(212, 175, 55, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <span><Bi en="Search Verified Matches →" te="సంబంధాలు శోధించండి →" /></span>
          <span style={{ fontSize: '1.15rem' }}>🔍</span>
        </button>
      </form>
    </div>
  );
}
