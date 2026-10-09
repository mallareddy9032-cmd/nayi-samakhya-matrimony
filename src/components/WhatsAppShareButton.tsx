"use client";

import React, { useState } from "react";

interface WhatsAppShareButtonProps {
  uniqueId: string;
  displayName: string;
  age: number;
  district: string;
  occupation?: string;
  education?: string;
}

export function WhatsAppShareButton({
  uniqueId,
  displayName,
  age,
  district,
  occupation = "Professional",
  education = "Graduate",
}: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const portalUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/matrimony` 
    : "https://nayisamakhya.org/matrimony";

  // Traditional respectful Telugu family alliance share message format
  const shareText = 
`🙏 *శ్రీ ధన్వంతరి ప్రసన్నః* 🙏
నాయీ సమాఖ్య అధికారిక వివాహ వేదిక (nayisamakhya.org/matrimony)

*సంబంధం వివరాలు:*
🆔 *యూనిక్ ఐడీ:* ${uniqueId}
👤 *అభ్యర్థి:* ${displayName}
🎂 *వయస్సు:* ${age} సంవత్సరాలు
📍 *జిల్లా:* ${district}
🎓 *విద్య:* ${education}
💼 *ఉద్యోగం / వృత్తి:* ${occupation}

పూర్తి వివరాలు, గోత్రం మరియు జాతక పరిశీలన కొరకు అధికారిక వెబ్‌సైట్ చూడండి:
👉 ${portalUrl}

_🔒 DPDP Act 2023 ద్వారా వ్యక్తిగత గోప్యత రక్షించబడింది._`;

  const handleShare = () => {
    const encoded = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '0.45rem',
      width: '100%',
      alignItems: 'center'
    }}>
      {/* Primary WhatsApp Family Share CTA */}
      <button
        type="button"
        onClick={handleShare}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          padding: '0.55rem 0.85rem',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 700,
          borderRadius: '10px',
          border: 'none',
          boxShadow: '0 2px 6px rgba(18, 140, 126, 0.25)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          lineHeight: 1.2
        }}
        title="కుటుంబ సభ్యులకు వాట్సాప్‌లో షేర్ చేయండి"
      >
        <svg 
          style={{ width: '16px', height: '16px', fill: '#FFFFFF', flexShrink: 0 }} 
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.584 1.961.947 2.796.947 3.179 0 5.765-2.587 5.765-5.768 0-3.179-2.585-5.732-5.765-5.732zm3.38 8.167c-.14.394-.813.729-1.127.776-.307.046-.7.067-2.008-.476-1.571-.652-2.582-2.254-2.66-2.359-.078-.105-.636-.846-.636-1.616 0-.77.404-1.147.547-1.303.14-.156.312-.196.417-.196.104 0 .208.002.299.007.098.005.228-.037.357.273.136.326.467 1.14.508 1.223.041.083.068.182.013.292-.055.11-.083.179-.164.275-.082.096-.172.215-.246.289-.082.083-.167.172-.072.335.095.163.422.696.906 1.127.622.553 1.146.724 1.309.805.163.082.259.068.355-.041.096-.11.41-477.52-.641.11-.164.22-.137.368-.082.148.055.941.444 1.103.525.162.081.27.122.31.19.04.068.04.394-.1.788z"/>
        </svg>
        <span>వాట్సాప్ షేర్ (WhatsApp)</span>
      </button>

      {/* Copy Text Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem',
          padding: '0.55rem 0.75rem',
          background: '#F8FAFC',
          color: copied ? '#059669' : '#475569',
          border: '1.5px solid #E2E8F0',
          borderRadius: '10px',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        title="సందేశాన్ని కాపీ చేయండి"
      >
        <span>{copied ? "✓" : "📋"}</span>
        <span>{copied ? "కాపీ అయింది!" : "కాపీ"}</span>
      </button>
    </div>
  );
}
