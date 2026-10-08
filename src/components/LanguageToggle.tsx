'use client';

import { useLanguage } from '../context/LanguageContext.tsx';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        background: '#FFF8F0', 
        borderRadius: '999px', 
        padding: '2px', 
        border: '1.5px solid var(--gold-border, #E2D9CC)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <button
        type="button"
        onClick={() => setLang('te')}
        style={{
          padding: '0.25rem 0.65rem',
          borderRadius: '999px',
          border: 'none',
          background: lang === 'te' ? 'var(--maroon, #8B1D2C)' : 'transparent',
          color: lang === 'te' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
          fontSize: '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="తెలుగులో చూడండి"
      >
        తెలుగు
      </button>

      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          padding: '0.25rem 0.65rem',
          borderRadius: '999px',
          border: 'none',
          background: lang === 'en' ? 'var(--maroon, #8B1D2C)' : 'transparent',
          color: lang === 'en' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
          fontSize: '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="View in English"
      >
        English
      </button>
    </div>
  );
}
