"use client";

import React, { useState, useMemo, useEffect } from "react";
import { BOT_FAQS, type BotFaqItem } from "../lib/bot-faq-data.ts";

export function MatrimonyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"te" | "en">("te");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<BotFaqItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Stop any currently playing audio cleanly
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Filtered FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return BOT_FAQS.filter((faq: BotFaqItem) => {
      const matchesCat = selectedCategory === "ALL" || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const qText = (faq.questionTe + " " + faq.questionEn + " " + faq.answerTe + " " + faq.answerEn).toLowerCase();
      return matchesCat && qText.includes(query);
    });
  }, [selectedCategory, searchQuery]);

  // Play authentic studio Telugu audio MP3 (with zero device TTS glitch)
  const togglePlayAudio = (faq: BotFaqItem) => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    // Stop any previously playing audio instance
    stopAudio();

    if (typeof window === "undefined") return;

    // Direct path under basePath /matrimony
    const audioUrl = `/matrimony/audio/bot/faq-${faq.id}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsSpeaking(true);
    };

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.warn("Studio audio file load error, falling back to local speech synthesis...");
      setIsSpeaking(false);
      audioRef.current = null;
      // Graceful device speech synthesis fallback if audio file network fails
      if ("speechSynthesis" in window) {
        const text = lang === "te" ? `${faq.questionTe}. ${faq.answerTe}` : `${faq.questionEn}. ${faq.answerEn}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "te" ? "te-IN" : "en-IN";
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    };

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or interrupted:", err);
      setIsSpeaking(false);
    });
  };

  const handleSelectFaq = (faq: BotFaqItem) => {
    stopAudio();
    setSelectedFaq(faq);
  };

  return (
    <>
      {/* Floating Trigger Button with Guaranteed Inline Stacking */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            stopAudio();
          }
          setIsOpen(!isOpen);
        }}
        aria-label="Open Kalyana Mitra Bot"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "linear-gradient(135deg, #801426 0%, #5B0C1A 50%, #3B050E 100%)",
          color: "#FFFFFF",
          padding: "12px 20px",
          borderRadius: "999px",
          border: "2px solid #D4AF37",
          boxShadow: "0 10px 30px rgba(128, 20, 38, 0.45), 0 4px 12px rgba(212, 175, 55, 0.3)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: "24px", lineHeight: 1 }}>🪔</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#FDE68A", lineHeight: 1.2 }}>
            {lang === "te" ? "కల్యాణ మిత్ర సహాయం" : "Kalyana Mitra AI"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", lineHeight: 1.2 }}>
            {lang === "te" ? "30 ప్రశ్నలు & వాయిస్ సమాధానాలు" : "30 FAQs & Audio Voice"}
          </div>
        </div>
      </button>

      {/* Main Bot Dialog / Drawer with Guaranteed Inline Styles */}
      {isOpen && (
        <div 
          style={{
            position: "fixed",
            bottom: "88px",
            right: "20px",
            zIndex: 99999,
            width: "calc(100vw - 40px)",
            maxWidth: "430px",
            background: "#FFFFFF",
            borderRadius: "24px",
            border: "2.5px solid #D4AF37",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "80vh",
            fontFamily: "'Noto Sans Telugu', system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #801426 0%, #5B0C1A 100%)",
            color: "#FFFFFF",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#FEF9E7",
                display: "grid",
                placeItems: "center",
                fontSize: "20px",
                border: "1.5px solid #D4AF37",
              }}>
                🪔
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FEF3C7", lineHeight: 1.2 }}>
                  {lang === "te" ? "కల్యాణ మిత్ర (Kalyana Mitra)" : "Kalyana Mitra Bot"}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(254, 243, 199, 0.8)" }}>
                  {lang === "te" ? "నాయీ సమాఖ్య అధికారిక సహాయనిధి" : "Community Sovereign Guidance"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  setLang(lang === "te" ? "en" : "te");
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.18)",
                  border: "1px solid rgba(212, 175, 55, 0.6)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  cursor: "pointer",
                }}
              >
                {lang === "te" ? "English" : "తెలుగు"}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  stopAudio();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FDE68A",
                  fontSize: "26px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div style={{ padding: "12px 14px", background: "#FAF6F0", borderBottom: "1px solid #E7DCD0" }}>
            <input
              type="text"
              placeholder={lang === "te" ? "🔍 మీ ప్రశ్నను వెతకండి (ఉదా: ₹599, ఫోటో, గోత్రం)..." : "🔍 Search question (e.g. ₹599, photo, gothra)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "12.5px",
                border: "1.5px solid #CBD5E1",
                borderRadius: "10px",
                background: "#FFFFFF",
                outline: "none",
                marginBottom: "8px",
              }}
            />

            {/* Category Pills */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
              {[
                { id: "ALL", label: lang === "te" ? "అన్నీ (All)" : "All" },
                { id: "REGISTRATION", label: lang === "te" ? "నమోదు" : "Register" },
                { id: "PRIVACY", label: lang === "te" ? "గోప్యత" : "Privacy" },
                { id: "PAYMENT", label: lang === "te" ? "₹599 సేవ" : "₹599 Plan" },
                { id: "ALLIANCE", label: lang === "te" ? "గోత్రం" : "Gothra" },
                { id: "HOROSCOPE", label: lang === "te" ? "జాతకం" : "Kundali" },
                { id: "SECURITY", label: lang === "te" ? "రక్షణ" : "Security" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedFaq(null);
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: "none",
                    background: selectedCategory === cat.id ? "#801426" : "#E2E8F0",
                    color: selectedCategory === cat.id ? "#FFFFFF" : "#334155",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", maxHeight: "48vh" }}>
            {selectedFaq ? (
              <div style={{
                background: "#FFFDF9",
                border: "1.5px solid #F5EBE1",
                borderRadius: "14px",
                padding: "14px",
              }}>
                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    setSelectedFaq(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#801426",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: "8px",
                  }}
                >
                  ← {lang === "te" ? "అన్ని ప్రశ్నలకు తిరిగి వెళ్ళండి" : "Back to questions list"}
                </button>

                <div style={{ fontSize: "11px", fontWeight: 800, color: "#92400E", textTransform: "uppercase", marginBottom: "4px" }}>
                  #{selectedFaq.id} · {lang === "te" ? selectedFaq.categoryTe : selectedFaq.category}
                </div>

                <h4 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0F172A", fontWeight: 800, lineHeight: 1.3 }}>
                  {lang === "te" ? selectedFaq.questionTe : selectedFaq.questionEn}
                </h4>

                <div style={{
                  padding: "12px",
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  border: "1px solid #E2D9CC",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "#1E293B",
                  marginBottom: "12px",
                }}>
                  {lang === "te" ? selectedFaq.answerTe : selectedFaq.answerEn}
                </div>

                {/* Audio Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => togglePlayAudio(selectedFaq)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: isSpeaking ? "#991B1B" : "#801426",
                      color: "#FFFFFF",
                      borderRadius: "10px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: isSpeaking ? "0 0 12px rgba(220, 38, 38, 0.45)" : "0 2px 6px rgba(128, 20, 38, 0.2)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{isSpeaking ? "⏹️" : "🔊"}</span>
                    <span>
                      {isSpeaking 
                        ? (lang === "te" ? "ఆపండి (Stop)" : "Stop Voice") 
                        : (lang === "te" ? "వాయిస్ వినండి (Telugu Audio)" : "Listen to Voice")}
                    </span>
                  </button>

                  <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: 700 }}>
                    {isSpeaking ? "🔊 స్పష్టమైన తెలుగు వాయిస్ ప్లే అవుతోంది..." : (lang === "te" ? "🎧 స్పష్టమైన తెలుగు ఆడియో సాయం" : "🎧 Authentic Voice Guide")}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredFaqs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#64748B", fontSize: "12.5px" }}>
                    {lang === "te" ? "మీ ప్రశ్నకు సరిపోలే సమాధానాలు లేవు." : "No matching questions found."}
                  </div>
                ) : (
                  filteredFaqs.map((faq: BotFaqItem) => (
                    <button
                      key={faq.id}
                      type="button"
                      onClick={() => handleSelectFaq(faq)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #E2D9CC",
                        background: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#801426" }}>
                          #{faq.id} · {lang === "te" ? faq.categoryTe : faq.category}
                        </div>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>
                          {lang === "te" ? faq.questionTe : faq.questionEn}
                        </div>
                      </div>
                      <span style={{ color: "#94A3B8", fontWeight: 800, fontSize: "13px" }}>→</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div style={{
            background: "#F1F5F9",
            padding: "8px 12px",
            textAlign: "center",
            fontSize: "10.5px",
            color: "#64748B",
            borderTop: "1px solid #E2E8F0",
          }}>
            {lang === "te" 
              ? "నాయీ సమాఖ్య స్వతంత్ర వివాహ వేదిక · DPDP చట్టం 2023 గోప్యత రక్షణ" 
              : "Nayi Samakhya Matrimonial Portal · Protected under DPDP Act 2023"}
          </div>
        </div>
      )}
    </>
  );
}
