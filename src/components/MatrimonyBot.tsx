"use client";

import React, { useState, useMemo } from "react";
import { BOT_FAQS, type BotFaqItem } from "../lib/bot-faq-data.ts";

export function MatrimonyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"te" | "en">("te");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<BotFaqItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Text to Speech synthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("వాయిస్ స్పీచ్ మీ బ్రౌజర్‌లో అందుబాటులో లేదు.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "te" ? "te-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectFaq = (faq: BotFaqItem) => {
    setSelectedFaq(faq);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          }
          setIsOpen(!isOpen);
        }}
        aria-label="Open Kalyana Mitra Bot"
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-amber-300"
      >
        <span className="text-2xl animate-pulse">🪔</span>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold leading-tight text-amber-200">
            {lang === "te" ? "కల్యాణ మిత్ర సహాయం" : "Kalyana Mitra AI"}
          </div>
          <div className="text-[11px] text-amber-100/90 leading-tight">
            {lang === "te" ? "30 ప్రశ్నలు & వాయిస్ సమాధానాలు" : "30 FAQs & Audio Voice"}
          </div>
        </div>
      </button>

      {/* Main Bot Dialog / Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] max-w-[420px] bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[82vh] transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shadow-inner">
                🪔
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-amber-100 leading-tight">
                  {lang === "te" ? "కల్యాణ మిత్ర (Kalyana Mitra)" : "Kalyana Mitra Matrimony Bot"}
                </h3>
                <p className="text-[11px] text-amber-200/80">
                  {lang === "te" ? "నాయీ సమాఖ్య అధికారిక సహాయనిధి" : "Community Sovereign Guidance"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === "te" ? "en" : "te")}
                className="bg-amber-700/80 hover:bg-amber-600 text-white text-xs px-2.5 py-1 rounded-full font-bold border border-amber-400/50 transition"
                title="భాష మార్చండి (Change Language)"
              >
                {lang === "te" ? "English" : "తెలుగు"}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsSpeaking(false);
                }}
                className="text-amber-200 hover:text-white text-2xl font-bold px-1 leading-none"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-2">
            <input
              type="text"
              placeholder={lang === "te" ? "🔍 మీ ప్రశ్నను వెతకండి (ఉదా: ₹599, ఫోటో, గోత్రం)..." : "🔍 Search question (e.g. ₹599, photo, gothra)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 bg-white"
            />

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
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
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? "bg-amber-800 text-white shadow-sm"
                      : "bg-stone-200/80 text-stone-700 hover:bg-stone-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area: FAQ List or Detailed Answer */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[50vh]">
            {selectedFaq ? (
              // Selected FAQ View with Voice Playback
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFaq(null);
                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSpeaking(false);
                  }}
                  className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
                >
                  ← {lang === "te" ? "అన్ని ప్రశ్నలకు తిరిగి వెళ్ళండి" : "Back to questions list"}
                </button>

                <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  #{selectedFaq.id} · {lang === "te" ? selectedFaq.categoryTe : selectedFaq.category}
                </div>

                <h4 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  {lang === "te" ? selectedFaq.questionTe : selectedFaq.questionEn}
                </h4>

                <div className="p-3 bg-white rounded-xl border border-amber-200 text-stone-800 text-xs sm:text-sm leading-relaxed shadow-sm">
                  {lang === "te" ? selectedFaq.answerTe : selectedFaq.answerEn}
                </div>

                {/* Voice Speech Synthesis Control */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => speakText(lang === "te" ? selectedFaq.answerTe : selectedFaq.answerEn)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    <span>{isSpeaking ? "⏹️" : "🔊"}</span>
                    <span>{isSpeaking ? (lang === "te" ? "ఆపండి (Stop)" : "Stop Audio") : (lang === "te" ? "వాయిస్ వినండి (Listen)" : "Listen to Voice")}</span>
                  </button>

                  <span className="text-[11px] text-stone-500">
                    {lang === "te" ? "బ్రౌజర్ ఆడియో స్పీచ్" : "Audio Synthesis"}
                  </span>
                </div>
              </div>
            ) : (
              // FAQ Question List
              <div className="space-y-2">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    {lang === "te" ? "మీ ప్రశ్నకు సరిపోలే సమాధానాలు లేవు. దయచేసి వేరే పదం వెతకండి." : "No matching questions found. Try searching another term."}
                  </div>
                ) : (
                  filteredFaqs.map((faq: BotFaqItem) => (
                    <button
                      key={faq.id}
                      type="button"
                      onClick={() => handleSelectFaq(faq)}
                      className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 transition flex items-start justify-between gap-2 group shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-amber-800">
                          #{faq.id} · {lang === "te" ? faq.categoryTe : faq.category}
                        </div>
                        <div className="text-xs sm:text-[13px] font-semibold text-stone-800 group-hover:text-amber-950 leading-snug">
                          {lang === "te" ? faq.questionTe : faq.questionEn}
                        </div>
                      </div>
                      <span className="text-stone-400 group-hover:text-amber-700 font-bold text-xs">
                        →
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-stone-100 p-2 text-center text-[10px] text-stone-500 border-t border-stone-200">
            {lang === "te" 
              ? "నాయీ సమాఖ్య స్వతంత్ర వివాహ వేదిక · DPDP చట్టం 2023 గోప్యత రక్షణ" 
              : "Nayi Samakhya Matrimonial Portal · Protected under DPDP Act 2023"}
          </div>
        </div>
      )}
    </>
  );
}
