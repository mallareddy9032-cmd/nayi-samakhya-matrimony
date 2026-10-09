import { NextRequest, NextResponse } from 'next/server';
import { getOptionalSession } from '../../../../../lib/session.ts';
import { dbContext } from '../../../../../lib/onboarding-store.ts';
import { getProfileView } from '../../../../../lib/match-store.ts';
import { withTx } from '../../../../../lib/db.ts';

// Sample Candidate Profile fallback for offline sammelanams & preview
const SAMPLE_PROFILES_BIODATA: Record<string, any> = {
  'sample-1': {
    displayName: 'S. Sai Krishna',
    age: 27,
    district: { en: 'Hyderabad', te: 'హైదరాబాద్' },
    mandal: 'Ameerpet',
    vocation: 'Corporate Tech & Civil Services',
    educationDegree: 'B.Tech in Computer Science',
    occupation: 'Lead Cloud Architect @ MNC, Hyderabad',
    incomeBracket: '25L - 50L PA',
    nakshatra: 'Rohini (రోహిణి)',
    birthTime: '06:45 AM',
    birthPlace: 'Hyderabad',
  },
  'sample-2': {
    displayName: 'K. Snehalatha',
    age: 24,
    district: { en: 'Warangal', te: 'వరంగల్' },
    mandal: 'Hanamkonda',
    vocation: 'Scholarly & Academic',
    educationDegree: 'M.Sc (Physics), B.Ed',
    occupation: 'Govt Model High School Teacher',
    incomeBracket: '6L - 12L PA',
    nakshatra: 'Hasta (హస్త)',
    birthTime: '02:15 PM',
    birthPlace: 'Warangal',
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const claims = await getOptionalSession();
  const { id } = await params;

  let profile: any = null;

  // 1. Check database if claims are present
  if (claims) {
    try {
      const ctx = dbContext(claims);
      profile = await getProfileView(ctx, id);
    } catch {
      // Fallback to sample
    }
  }

  // 2. Fallback to sample or sample blank form for physical sammelanam
  if (!profile) {
    if (SAMPLE_PROFILES_BIODATA[id]) {
      profile = SAMPLE_PROFILES_BIODATA[id];
    } else {
      // Blank application form for offline meets (/offline-meets)
      profile = {
        displayName: '________________________________',
        age: '___',
        district: { en: 'Telangana / Andhra Pradesh', te: 'తెలంగాణ / ఆంధ్రప్రదేశ్' },
        mandal: '____________________',
        vocation: 'సాంప్రదాయ నాయీ బ్రాహ్మణ వృత్తి / ఉద్యోగం',
        educationDegree: '____________________',
        occupation: '____________________',
        incomeBracket: '____________________',
        nakshatra: '____________________',
        birthTime: '______',
        birthPlace: '____________________',
      };
    }
  }

  // Check if mutual consent exists to reveal contact details
  let contactUnlocked = false;
  let contactDetails: { phone?: string; email?: string } | null = null;

  if (claims && profile?.interest?.status === 'contact_unlocked') {
    contactUnlocked = true;
    try {
      const ctx = dbContext(claims);
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>వివాహ పరిచయ పత్రం · Biodata - ${escapeHtml(profile.displayName)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .border-container { box-shadow: none !important; }
    }
    body {
      font-family: 'Noto Sans Telugu', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 16px;
      color: #0b172d;
      background: #fdfbf7;
      position: relative;
      line-height: 1.5;
    }
    .print-actions {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid #E2D9CC;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .print-btn {
      background: #801426;
      color: #FFFFFF;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 46px;
      font-weight: 800;
      color: rgba(214, 158, 46, 0.08);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
      border: 5px dashed rgba(214, 158, 46, 0.12);
      padding: 20px 40px;
    }
    .border-container {
      max-width: 800px;
      margin: 0 auto;
      border: 3.5px double #801426;
      border-radius: 12px;
      padding: 28px;
      position: relative;
      z-index: 1;
      background: #FFFFFF;
      box-shadow: inset 0 0 0 2px #D4AF37, 0 4px 16px rgba(0,0,0,0.04);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 4px 0;
      color: #801426;
      font-size: 24px;
      letter-spacing: 0.02em;
    }
    .header h2 {
      margin: 2px 0;
      color: #1E293B;
      font-size: 15px;
      font-weight: 600;
    }
    .stamp-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 12px;
      background: #FEF9E7;
      color: #801426;
      border: 1.5px solid #D4AF37;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 10px;
      grid-column: span 2;
    }
    .field {
      margin-bottom: 6px;
    }
    .field-label {
      font-size: 11px;
      color: #6b7280;
      display: block;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 13.5px;
      font-weight: 600;
      color: #1f2937;
    }
    .masked-notice {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 10px;
      border-radius: 8px;
      font-size: 11.5px;
      color: #475569;
      text-align: center;
      grid-column: span 2;
    }
    .footer {
      text-align: center;
      font-size: 10.5px;
      color: #94a3b8;
      margin-top: 20px;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <span style="font-size: 13px; color: #475569; font-weight: 600;">
      📄 నాయీ సమాఖ్య ప్రామాణిక వివాహ పరిచయ పత్రం (A4 Print Format)
    </span>
    <button onclick="window.print()" class="print-btn">
      🖨️ ప్రింట్ / PDF సేవ్ చేయండి (Print A4)
    </button>
  </div>

  <div class="watermark">NAYI SAMAKHYA VERIFIED</div>
  <div class="border-container">
    <div class="header">
      <div style="font-size: 17px; color: #d69e2e;">卐 శ్రీ ధన్వంతరి ప్రసన్నః 卐</div>
      <h1>నాయీ సమాఖ్య వివాహ వేదిక</h1>
      <h2>వధూవరుల పరిచయ పత్రం (Matrimonial Bio-Data)</h2>
      <div class="stamp-badge">✓ COMMUNITY SOVEREIGN MATRIMONIAL RECORD</div>
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
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
