"use client";

import React, { useState } from "react";
import { KALYANA_SEVA_PLAN, generateUpiPaymentUri } from "../lib/payments.ts";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  uniqueUserId?: string;
  applicantPhone?: string;
  onSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  uniqueUserId = "NS-M1042",
  applicantPhone = "9876543210",
  onSuccess,
}: PaymentModalProps) {
  const [utr, setUtr] = useState("");
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const upiUri = generateUpiPaymentUri(uniqueUserId, KALYANA_SEVA_PLAN.amount);
  // Render clean high-res QR code via standard Google Chart / QR SVG api
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(KALYANA_SEVA_PLAN.upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^\d{12}$/.test(cleanUtr)) {
      setStatusMsg({
        type: "error",
        text: "దయచేసి సరిగ్గా 12 అంకెల UPI Transaction Reference (UTR) నంబర్ నమోదు చేయండి. (Must be exactly 12 digits)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniqueUserId,
          applicantPhone,
          utrNumber: cleanUtr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit UTR");

      setStatusMsg({
        type: "success",
        text: "ధన్యవాదాలు! మీ ₹599 సహకార UTR రసీదు ధృవీకరించబడింది. 50 ప్రొఫైల్స్ మరియు జాతకాల పూర్తి వివరాలు అన్‌లాక్ చేయబడ్డాయి!",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "నెట్‌వర్క్ లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <h3 className="font-serif font-bold text-lg md:text-xl text-amber-100">
                {KALYANA_SEVA_PLAN.teluguName}
              </h3>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              1 సంవత్సరం / 50 ప్రొఫైల్స్ పూర్తి యాక్సెస్ · ₹{KALYANA_SEVA_PLAN.amount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white text-2xl font-bold p-1 leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Transparent Ethical Scope Notice */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <span>⚖️</span> పారదర్శక సేవా నియమాలు (Transparent Community Rules)
            </div>
            <p className="leading-relaxed">
              ఈ ₹599 సహకారం కేవలం <strong>వెబ్‌సైట్ సర్వర్ల నిర్వహణ మరియు 50 మంది ప్రొఫైల్స్ &amp; జాతకాల పరిశీలన కొరకు మాత్రమే</strong>. 
              వ్యక్తిగత వివాహ మధ్యవర్తిత్వం (Personal Coordinator Mediation) లేదా సంబంధాల హామీ ఉండదు.
            </p>
          </div>

          {/* QR Code & VPA Display */}
          <div className="flex flex-col items-center bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-stone-600 mb-2">
              PhonePe / Google Pay / Paytm / Any UPI App ద్వారా స్కాన్ చేయండి
            </p>

            <div className="p-3 bg-white rounded-xl shadow-md border border-amber-200 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="flex items-center gap-2 bg-amber-100/70 border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-950 font-bold">
              <span>UPI ID: {KALYANA_SEVA_PLAN.upiVpa}</span>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="ml-2 text-xs bg-amber-700 hover:bg-amber-800 text-white px-2 py-0.5 rounded transition"
              >
                {copiedVpa ? "కాపీ అయింది! ✓" : "Copy"}
              </button>
            </div>

            <div className="mt-2 text-[11px] text-stone-500">
              చెల్లించవలసిన మొత్తం: <strong className="text-stone-900 font-bold text-sm">₹599.00</strong> · రిఫరెన్స్: <code className="bg-stone-200 px-1 py-0.5 rounded">NSM-{uniqueUserId}</code>
            </div>
          </div>

          {/* UTR Submission Form */}
          <form onSubmit={handleSubmitUtr} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                చెల్లింపు పూర్తయిన తర్వాత 12 అంకెల UTR / Ref No. నమోదు చేయండి:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="ఉదా: 428901234567"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center font-mono tracking-widest text-lg font-bold px-3 py-2.5 border-2 border-stone-300 rounded-xl focus:border-amber-600 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                💡 మీ PhonePe, GPay లేదా బ్యాంక్ SMS లో &apos;UPI Ref ID&apos; లేదా &apos;UTR&apos; గా 12 అంకెలు కనిపిస్తాయి.
              </p>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                    : "bg-rose-50 border border-rose-300 text-rose-800"
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || utr.length !== 12}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow transition flex items-center justify-center gap-2 ${
                utr.length === 12 && !isSubmitting
                  ? "bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white cursor-pointer"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "ధృవీకరిస్తున్నాము..." : "ధృవీకరించి 50 ప్రొఫైల్స్ అన్‌లాక్ చేయండి ✓"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
