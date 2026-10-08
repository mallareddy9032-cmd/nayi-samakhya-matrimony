import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '../../../../../lib/session.ts';
import { dbContext } from '../../../../../lib/onboarding-store.ts';
import { getProfileView } from '../../../../../lib/match-store.ts';
import { withTx } from '../../../../../lib/db.ts';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const claims = await requireSession();
  const { id } = await params;
  const ctx = dbContext(claims);

  const profile = await getProfileView(ctx, id);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found or access restricted' }, { status: 404 });
  }

  // Check if mutual consent exists to reveal contact details
  let contactUnlocked = false;
  let contactDetails: { phone?: string; email?: string } | null = null;

  if (profile.interest?.status === 'contact_unlocked') {
    contactUnlocked = true;
    try {
      const { rows } = await withTx(ctx, async (tx) => {
        return tx.query(
          `SELECT phone, email FROM matrimony_shared.unmask_contact_details($1)`,
          [id]
        );
      });
      if (rows.length > 0) {
        contactDetails = rows[0];
      }
    } catch {
      contactUnlocked = false;
    }
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="utf-8"/>
  <title>వివాహ పరిచయ పత్రం · Biodata - ${escapeHtml(profile.displayName)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body {
      font-family: 'Noto Sans Telugu', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0b172d;
      background: #ffffff;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 52px;
      font-weight: 800;
      color: rgba(214, 158, 46, 0.08);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
      border: 6px dashed rgba(214, 158, 46, 0.12);
      padding: 20px 40px;
    }
    .border-container {
      border: 4px double #801426;
      border-radius: 12px;
      padding: 32px;
      position: relative;
      z-index: 1;
      background: #FFFFFF;
      box-shadow: inset 0 0 0 2px #D4AF37;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .invocation {
      color: #801426;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    .header h1 {
      margin: 4px 0;
      color: #801426;
      font-size: 26px;
      letter-spacing: 0.02em;
    }
    .header h2 {
      margin: 2px 0;
      color: #1E293B;
      font-size: 16px;
      font-weight: 600;
    }
    .stamp-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 14px;
      background: #FEF9E7;
      color: #801426;
      border: 1.5px solid #D4AF37;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 12px;
      grid-column: span 2;
    }
    .field {
      margin-bottom: 8px;
    }
    .field-label {
      font-size: 12px;
      color: #6b7280;
      display: block;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .masked-notice {
      background: #f3f4f6;
      border: 1px dashed #d1d5db;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #4b5563;
      text-align: center;
      grid-column: span 2;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 24px;
      border-top: 1px solid #f3f4f6;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="watermark">NAYI SAMAKHYA VERIFIED</div>
  <div class="border-container">
    <div class="header">
      <div style="font-size: 18px; color: #d69e2e;">卐 శ్రీ ధన్వంతరి ప్రసన్నః 卐</div>
      <h1>నాయీ సమాఖ్య వివాహ వేదిక</h1>
      <h2>వధూవరుల పరిచయ పత్రం (Matrimonial Bio-Data)</h2>
      <div class="stamp-badge">✓ COMMUNITY VERIFIED MATRIMONIAL RECORD</div>
    </div>

    <div class="grid">
      <div class="section-title">వ్యక్తిగత వివరాలు · Personal & Heritage Details</div>
      <div class="field">
        <span class="field-label">పేరు · Full Name</span>
        <span class="field-value">${escapeHtml(profile.displayName)}</span>
      </div>
      <div class="field">
        <span class="field-label">వయస్సు · Age</span>
        <span class="field-value">${profile.age} సంవత్సరాలు</span>
      </div>
      <div class="field">
        <span class="field-label">పూర్వీకుల జిల్లా · Native District</span>
        <span class="field-value">${escapeHtml(profile.district.te)} (${escapeHtml(profile.district.en)})</span>
      </div>
      <div class="field">
        <span class="field-label">మండలం · Mandal</span>
        <span class="field-value">${escapeHtml(profile.mandal)}</span>
      </div>

      <div class="section-title">విద్య మరియు వృత్తి · Education & Profession</div>
      <div class="field">
        <span class="field-label">విద్యార్హత · Qualification</span>
        <span class="field-value">${escapeHtml(profile.educationDegree || '—')}</span>
      </div>
      <div class="field">
        <span class="field-label">వృత్తి · Occupation</span>
        <span class="field-value">${escapeHtml(profile.occupation || '—')}</span>
      </div>
      <div class="field">
        <span class="field-label">వృత్తి శ్రేణి · Heritage Stream</span>
        <span class="field-value">${escapeHtml(profile.vocation)}</span>
      </div>
      <div class="field">
        <span class="field-label">వార్షిక ఆదాయం · Income Bracket</span>
        <span class="field-value">${escapeHtml(profile.incomeBracket || '—')}</span>
      </div>

      <div class="section-title">జాతక వివరాలు · Horoscope / Birth Details</div>
      <div class="field">
        <span class="field-label">జన్మ నక్షత్రం · Birth Star</span>
        <span class="field-value">${escapeHtml(profile.nakshatra || '—')}</span>
      </div>
      <div class="field">
        <span class="field-label">పుట్టిన సమయం & స్థలం · Birth Time & Place</span>
        <span class="field-value">${escapeHtml(profile.birthTime || '—')} / ${escapeHtml(profile.birthPlace || '—')}</span>
      </div>

      <div class="section-title">సంప్రదింపు వివరాలు · Contact & Guardian Details</div>
      ${contactUnlocked && contactDetails ? `
        <div class="field">
          <span class="field-label">మొబైల్ నంబర్ · Phone</span>
          <span class="field-value">${escapeHtml(contactDetails.phone || '—')}</span>
        </div>
        <div class="field">
          <span class="field-label">ఇమెయిల్ · Email</span>
          <span class="field-value">${escapeHtml(contactDetails.email || '—')}</span>
        </div>
      ` : `
        <div class="masked-notice">
          🔒 సంప్రదింపు వివరాలు రక్షించబడ్డాయి (Protected under DPDP Act 2023).<br/>
          Contact details become available upon mutual interest and bilateral consent approval.
        </div>
      `}
    </div>

    <div class="footer">
      Generated securely via Nayi Samakhya Matrimonial Portal (nayisamakhya.org/matrimony)<br/>
      Certified Sovereign Record · Digital Personal Data Protection Act, 2023 Compliant
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="biodata-${id}.html"`,
      'Cache-Control': 'private, no-cache',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
