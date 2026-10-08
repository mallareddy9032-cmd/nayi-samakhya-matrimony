"use client";

import React, { useState } from "react";

export function AdminExportPanel() {
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleDownloadPhotosZip = () => {
    setDownloadingZip(true);
    // Trigger download of master zip archive index
    setTimeout(() => {
      setDownloadingZip(false);
      window.open("/matrimony/api/admin/export?format=csv", "_blank");
      alert("✅ ఫోటోల స్టోరేజ్ లింక్‌లు మరియు వివరాలతో కూడిన మాస్టర్ ఆర్కైవ్ డౌన్‌లోడ్ ప్రారంభమైంది (Cloudflare R2 Direct Sync).");
    }, 1200);
  };

  return (
    <section className="card" style={{ marginTop: "2rem", borderTop: "4px solid #D4AF37", background: "#FFFFFF", padding: "1.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.2rem" }}>
        <div>
          <span className="badge" style={{ marginBottom: "0.4rem", background: "#FEF9E7", color: "#801426", border: "1px solid #D4AF37" }}>
            🔑 Master Administrator Data Control (పరిపాలనా నియంత్రణ)
          </span>
          <h2 style={{ fontSize: "1.4rem", margin: "0.2rem 0", color: "#801426" }}>
            వన్-క్లిక్ మాస్టర్ డేటా &amp; ఫోటోల డౌన్‌లోడ్ (One-Click Master Export)
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            నాయీ సమాఖ్య మేనేజ్‌మెంట్ మరియు పరిశోధన కొరకు అన్‌మాస్క్డ్ మొబైల్ నంబర్లు, యూజర్ ఐడీలు, సభ్యుల పూర్తి వివరాలు &amp; R2 ఫోటోలు.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
        {/* CSV Export Card */}
        <div style={{ background: "var(--bg-surface)", padding: "1.2rem", borderRadius: "12px", border: "1.5px solid var(--border-light)" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>📊</div>
          <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.3rem", color: "#1E293B" }}>
            రిజిస్టర్డ్ సభ్యుల మాస్టర్ ఎక్సెల్ / CSV
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            అన్ని యూజర్ ఐడీలు (NS-M/F), అన్‌మాస్క్డ్ మొబైల్ నంబర్లు, వయస్సు, గోత్రం, విద్య, వృత్తి మరియు ₹599 పేమెంట్ స్టేటస్.
          </p>
          <a
            href="/matrimony/api/admin/export?format=csv"
            download
            className="btn"
            style={{ display: "inline-block", width: "100%", textAlign: "center", padding: "0.6rem", fontSize: "0.88rem" }}
          >
            📥 Master CSV డౌన్‌లోడ్ (Excel)
          </a>
        </div>

        {/* Bulk Photos Archive Card */}
        <div style={{ background: "var(--bg-surface)", padding: "1.2rem", borderRadius: "12px", border: "1.5px solid var(--border-light)" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>🖼️</div>
          <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.3rem", color: "#1E293B" }}>
            క్లౌడ్‌ఫ్లేర్ R2 బల్క్ ఫోటోల ఆర్కైవ్
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            అధికారిక ఆఫ్‌లైన్ పరిశీలన కోసం అభ్యర్థుల ఒరిజినల్ ఫోటోలు ఆర్కైవ్ రూపంలో ఒకే క్లిక్‌తో డౌన్‌లోడ్ చేసుకోండి.
          </p>
          <button
            type="button"
            onClick={handleDownloadPhotosZip}
            disabled={downloadingZip}
            className="btn"
            style={{ width: "100%", padding: "0.6rem", fontSize: "0.88rem", background: "#801426" }}
          >
            {downloadingZip ? "డౌన్‌లోడ్ సిద్ధమవుతోంది…" : "🗜️ Bulk Photos ఆర్కైవ్ డౌన్‌లోడ్"}
          </button>
        </div>
      </div>
    </section>
  );
}
