'use client';

import React, { useState, useEffect } from 'react';

export interface ElderAssistNarratorProps {
  summaryTe: string;
  summaryEn: string;
  lang?: 'te' | 'en';
}

export function ElderAssistNarrator({
  summaryTe,
  summaryEn,
  lang = 'te',
}: ElderAssistNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleNarrate = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('వాయిస్ స్పీచ్ సదుపాయం మీ బ్రౌజర్‌లో అందుబాటులో లేదు.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = lang === 'te' ? summaryTe : summaryEn;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.88; // Deliberate gentle cadence for elderly comprehension

    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const teVoice = availableVoices.find(v => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'));
    if (teVoice && lang === 'te') {
      utterance.voice = teVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggleNarrate}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '999px',
        background: isPlaying ? 'linear-gradient(135deg, #801426, #5B0C1A)' : '#FFFDF9',
        color: isPlaying ? '#FEF3C7' : '#801426',
        border: '1.5px solid #D4AF37',
        fontSize: '13px',
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: isPlaying ? '0 4px 14px rgba(128, 20, 38, 0.35)' : '0 2px 6px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
      }}
      aria-label="Narrate profile summary"
    >
      <span style={{ fontSize: '16px' }}>{isPlaying ? '🔊' : '🔈'}</span>
      <span>
        {isPlaying
          ? (lang === 'te' ? 'ఆపండి (Stop Voice)' : 'Stop Narration')
          : (lang === 'te' ? 'వాయిస్ వివరణ వినండి (Listen Voice)' : 'Listen Voice Summary')}
      </span>
      {isPlaying && (
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#22C55E',
          animation: 'pulse 1s infinite',
        }} />
      )}
    </button>
  );
}
