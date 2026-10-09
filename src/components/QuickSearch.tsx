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
        background: 'rgba(255, 255, 255, 0.96)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '24px', 
        padding: '2.2rem', 
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset', 
        border: '1.5px solid rgba(212, 175, 55, 0.55)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Golden Top Glow Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #801426, #D4AF37, #801426)'
      }} />

      {/* Header with Live Online Pulse Badge */}
      <div style={{ borderBottom: '1.5px solid #F1E9DE', paddingBottom: '1rem', marginBottom: '1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.35rem' }}>✨</span>
            <h3 style={{ margin: 0, color: '#801426', fontSize: '1.35rem', fontWeight: 800 }}>
              <Bi en="Quick Match Search" te="సంబంధాల శోధన" />
            </h3>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#ECFDF5',
            color: '#065F46',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid #A7F3D0'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
            <Bi en="450+ Active Profiles" te="450+ ప్రత్యక్ష ప్రొఫైల్స్" />
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
          <Bi en="Find verified community matches aligned with your preferences" te="మీ ప్రాధాన్యతలకు తగిన పవిత్ర సంబంధాలను వెంటనే శోధించండి" />
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
        {/* Looking For: Interactive Toggle Tiles */}
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            <Bi en="Looking For:" te="నేను వెతుకుతున్నది:" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setLookingFor('female')}
              style={{
                padding: '0.85rem 0.6rem',
                borderRadius: '14px',
                border: lookingFor === 'female' ? '2px solid #801426' : '1.5px solid #E2E8F0',
                background: lookingFor === 'female' ? 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' : '#F8FAFC',
                color: lookingFor === 'female' ? '#801426' : '#64748B',
                fontWeight: lookingFor === 'female' ? 800 : 600,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: lookingFor === 'female' ? '0 6px 16px rgba(128, 20, 38, 0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>👰🏻</span>
              <span><Bi en="Bride" te="వధువు" /></span>
            </button>

            <button
              type="button"
              onClick={() => setLookingFor('male')}
              style={{
                padding: '0.85rem 0.6rem',
                borderRadius: '14px',
                border: lookingFor === 'male' ? '2px solid #801426' : '1.5px solid #E2E8F0',
                background: lookingFor === 'male' ? 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' : '#F8FAFC',
                color: lookingFor === 'male' ? '#801426' : '#64748B',
                fontWeight: lookingFor === 'male' ? 800 : 600,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: lookingFor === 'male' ? '0 6px 16px rgba(128, 20, 38, 0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🤵🏻</span>
              <span><Bi en="Groom" te="వరుడు" /></span>
            </button>
          </div>
        </div>

        {/* Age and District Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <label htmlFor="qs-age" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              <Bi en="Age Range:" te="వయస్సు:" />
            </label>
            <select
              id="qs-age"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.8rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 600 }}
            >
              <option value="18-24">{lang === 'en' ? '18 - 24 Years' : '18 - 24 సంవత్సరాలు'}</option>
              <option value="21-26">{lang === 'en' ? '21 - 26 Years' : '21 - 26 సంవత్సరాలు'}</option>
              <option value="25-30">{lang === 'en' ? '25 - 30 Years' : '25 - 30 సంవత్సరాలు'}</option>
              <option value="31-35">{lang === 'en' ? '31 - 35 Years' : '31 - 35 సంవత్సరాలు'}</option>
              <option value="36-45">{lang === 'en' ? '36 - 45 Years' : '36 - 45 సంవత్సరాలు'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="qs-district" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              <Bi en="Native District:" te="స్వస్థల జిల్లా:" />
            </label>
            <select
              id="qs-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.8rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 600 }}
            >
              <option value="">{lang === 'en' ? 'All Districts (Telangana & AP)' : 'అన్ని జిల్లాలు (తెలంగాణ & ఆంధ్రప్రదేశ్)'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vocation / Stream */}
        <div>
          <label htmlFor="qs-vocation" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            <Bi en="Profession / Stream:" te="వృత్తి / విద్యారంగం:" />
          </label>
          <select
            id="qs-vocation"
            value={vocation}
            onChange={(e) => setVocation(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.8rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 600 }}
          >
            <option value="">{lang === 'en' ? 'All Professions & Streams' : 'అన్ని వృత్తులు & రంగాలు'}</option>
            <option value="corporate_tech_civil">{lang === 'en' ? '💻 Software & IT Tech' : '💻 సాఫ్ట్‌వేర్ & ఐటీ ఇంజనీరింగ్'}</option>
            <option value="healthcare">{lang === 'en' ? '🩺 Doctors & Healthcare' : '🩺 డాక్టర్లు & ఫార్మా'}</option>
            <option value="government">{lang === 'en' ? '🏛️ Government & Civil Services' : '🏛️ ప్రభుత్వ ఉద్యోగాలు'}</option>
            <option value="wellness_artisan">{lang === 'en' ? '💈 Salon & Wellness Founders' : '💈 సెలూన్ వ్యవస్థాపకులు'}</option>
            <option value="nadopasana">{lang === 'en' ? '🎵 Classical & Heritage Artists' : '🎵 నాదోపాసన విద్వాంసులు'}</option>
            <option value="scholarly_academic">{lang === 'en' ? '🎓 Lecturers, Teachers & Academics' : '🎓 ఉపాధ్యాయులు & లెక్చరర్లు'}</option>
          </select>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #C59B27 50%, #A67C1E 100%)',
            color: '#2A040B',
            padding: '1rem',
            borderRadius: '14px',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            fontWeight: 800,
            fontSize: '1.05rem',
            cursor: 'pointer',
            marginTop: '0.3rem',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4), 0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <span><Bi en="Search Verified Matches (10 Free Views) →" te="సంబంధాలను వెతకండి (10 ఉచితం) →" /></span>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
        </button>
      </form>
    </div>
  );
}
