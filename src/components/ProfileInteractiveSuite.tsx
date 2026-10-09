'use client';

import React, { useState } from 'react';
import { KalyanaPatrikaModal } from './KalyanaPatrikaModal.tsx';
import { ElderAssistNarrator } from './ElderAssistNarrator.tsx';

export interface ProfileInteractiveSuiteProps {
  candidate: {
    id: string;
    displayName: string;
    age: number;
    gender: string;
    district: { en: string; te: string };
    mandal: string;
    gothra: string;
    nakshatra?: string;
    rasi?: string;
    birthTime?: string;
    birthPlace?: string;
    educationDegree: string;
    occupation: string;
    incomeBracket?: string;
    vocation?: string;
    fatherName?: string;
    motherName?: string;
    siblings?: string;
    photoUrl?: string;
  };
  lang?: 'te' | 'en';
}

export function ProfileInteractiveSuite({
  candidate: c,
  lang = 'te',
}: ProfileInteractiveSuiteProps) {
  const [isPatrikaOpen, setIsPatrikaOpen] = useState(false);

  // Natural Telugu voice narration text for elders
  const summaryTe = `నమస్కారం! నాయీ సమాఖ్య వివాహ వేదిక ద్వారా సంబంధం వివరాలు: ` +
    `${c.gender === 'male' ? 'శ్రీ' : 'శ్రీమతి/కుమారి'} ${c.displayName}. ` +
    `వయస్సు: ${c.age} సంవత్సరాలు. ` +
    `చదువు: ${c.educationDegree}. ` +
    `వృత్తి: ${c.occupation}. ` +
    `స్వస్థలం: ${c.mandal}, ${c.district.te}. ` +
    `గోత్రం: ${c.gothra}. ` +
    `జన్మ నక్షత్రం: ${c.nakshatra || 'వివరాలు అందుబాటులో ఉన్నాయి'}. రాశి: ${c.rasi || ''}. ` +
    `తల్లిదండ్రులు: ${c.fatherName || 'సభ్యులు'} మరియు ${c.motherName || ''}. ` +
    `ఈ ప్రొఫైల్ సమాజ-ధృవీకరణ పొందినది.`;

  const summaryEn = `Hello. Matrimonial candidate details on Nayi Samakhya: ` +
    `${c.displayName}, age ${c.age} years. ` +
    `Education: ${c.educationDegree}. Profession: ${c.occupation}. ` +
    `Native Place: ${c.mandal}, ${c.district.en}. ` +
    `Gotra: ${c.gothra}. Star: ${c.nakshatra || ''}, Rasi: ${c.rasi || ''}. ` +
    `Verified community profile.`;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Elder Voice Summary Button */}
        <ElderAssistNarrator summaryTe={summaryTe} summaryEn={summaryEn} lang={lang} />

        {/* Kalyana Patrika Modal Button */}
        <button
          type="button"
          onClick={() => setIsPatrikaOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)',
            transition: 'all 0.2s ease',
            fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
          }}
        >
          <span>📜</span>
          <span>{lang === 'te' ? 'కల్యాణ పరిచయ పత్రిక (WhatsApp Patrika)' : 'Share Kalyana Patrika'}</span>
        </button>
      </div>

      {/* The Patrika Modal Dialog */}
      <KalyanaPatrikaModal
        isOpen={isPatrikaOpen}
        onClose={() => setIsPatrikaOpen(false)}
        candidate={c}
        lang={lang}
      />
    </>
  );
}
