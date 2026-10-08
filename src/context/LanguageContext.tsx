'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'te' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'te',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('te');

  useEffect(() => {
    // Default to 'te' for Telangana / Telugu region
    const saved = localStorage.getItem('nsm_lang') as Lang | null;
    if (saved === 'en' || saved === 'te') {
      setLangState(saved);
      document.documentElement.setAttribute('data-lang', saved);
    } else {
      setLangState('te');
      document.documentElement.setAttribute('data-lang', 'te');
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('nsm_lang', newLang);
    document.documentElement.setAttribute('data-lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
