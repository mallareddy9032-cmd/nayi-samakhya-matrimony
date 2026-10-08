'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function QuickSearch({ districts }: { districts: string[] }) {
  const router = useRouter();
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
            సంబంధాల శోధన (Quick Search)
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
          మీ అర్హతలకు తగిన సంబంధాలను వెంటనే శోధించండి
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
        {/* Looking For: Interactive Toggle Buttons */}
        <div>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            నేను వెతుకుతున్నది (Looking For):
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
              <span>వధువు (Bride)</span>
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
              <span>వరుడు (Groom)</span>
            </button>
          </div>
        </div>

        {/* Age and District Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label htmlFor="qs-age" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              వయస్సు (Age):
            </label>
            <select
              id="qs-age"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
            >
              <option value="18-24">18 - 24 సంవత్సరాలు</option>
              <option value="21-26">21 - 26 సంవత్సరాలు</option>
              <option value="25-30">25 - 30 సంవత్సరాలు</option>
              <option value="31-35">31 - 35 సంవత్సరాలు</option>
              <option value="36-45">36 - 45 సంవత్సరాలు</option>
            </select>
          </div>

          <div>
            <label htmlFor="qs-district" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              స్వస్థల జిల్లా (District):
            </label>
            <select
              id="qs-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
            >
              <option value="">అన్ని జిల్లాలు (All)</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vocation / Stream */}
        <div>
          <label htmlFor="qs-vocation" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            వృత్తి / ఉద్యోగం (Profession):
          </label>
          <select
            id="qs-vocation"
            value={vocation}
            onChange={(e) => setVocation(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.92rem', color: '#1E293B', fontWeight: 500 }}
          >
            <option value="">అన్ని రంగాలు (All Occupations)</option>
            <option value="corporate_tech_civil">సాఫ్ట్‌వేర్ & ఐటీ (Software & IT)</option>
            <option value="government">ప్రభుత్వ రంగం (Government Sector)</option>
            <option value="wellness_artisan">సెలూన్ వ్యవస్థాపకులు (Salon Founders)</option>
            <option value="healthcare">వైద్య రంగం (Healthcare & Pharma)</option>
            <option value="nadopasana">నాదోపాసన (Classical & Tradition)</option>
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
          <span>సంబంధాలు శోధించండి</span>
          <span style={{ fontSize: '1.15rem' }}>🔍</span>
        </button>
      </form>
    </div>
  );
}
