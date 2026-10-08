export type ProfileCompleteness = {
  percentage: number;
  stars: number;
  tier: 'bronze' | 'silver' | 'gold';
  tierLabel: { en: string; te: string };
  missingItems: { en: string; te: string }[];
  canAccessProfiles: boolean;
};

export function calculateCompleteness(profile: {
  displayName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  gothraId?: string | null;
  district?: string | null;
  mandal?: string | null;
  photoCount?: number;
  nakshatra?: string | null;
  maternalLineage?: string | null;
  educationDegree?: string | null;
  occupation?: string | null;
  incomeBracket?: string | null;
  dpdpConsent?: boolean;
}): ProfileCompleteness {
  let score = 0;
  const missing: { en: string; te: string }[] = [];

  // 1. Basic & Lineage (30%)
  if (profile.displayName && profile.gender && profile.dateOfBirth && profile.gothraId && profile.district && profile.mandal) {
    score += 30;
  } else {
    missing.push({ en: 'Basic Identity & Gothra Lineage (30%)', te: 'ప్రాథమిక వివరాలు & గోత్రం (30%)' });
  }

  // 2. Mandatory Photos (20% for 2 photos, +10% bonus for 3-4 photos)
  const photos = profile.photoCount ?? 0;
  if (photos >= 2) {
    score += 20;
    if (photos >= 3) score += 5;
    if (photos >= 4) score += 5;
  } else {
    missing.push({ en: `2 Mandatory Photos (${photos}/2 uploaded) (20%)`, te: `2 తప్పనిసరి ఫోటోలు (${photos}/2 అప్‌లోడ్ అయ్యాయి) (20%)` });
  }

  // 3. Horoscope & Maternal Lineage (15%)
  if (profile.nakshatra || profile.maternalLineage) {
    score += 15;
  } else {
    missing.push({ en: 'Horoscope / Maternal Lineage (15%)', te: 'జాతకం / తల్లి వంశం (15%)' });
  }

  // 4. Education & Career (15%)
  if (profile.educationDegree || profile.occupation || profile.incomeBracket) {
    score += 15;
  } else {
    missing.push({ en: 'Education & Career Details (15%)', te: 'విద్య & ఉద్యోగ వివరాలు (15%)' });
  }

  // 5. Privacy & DPDP Consent (10%)
  if (profile.dpdpConsent) {
    score += 10;
  } else {
    missing.push({ en: 'DPDP Privacy Consent (10%)', te: 'డిజిటల్ డేటా సమ్మతి (10%)' });
  }

  // Cap at 100
  score = Math.min(100, score);

  let stars = 1;
  let tier: 'bronze' | 'silver' | 'gold' = 'bronze';
  let tierLabel = { en: '⭐ Bronze Candidate', te: '⭐ కాంస్య సభ్యులు' };

  if (score >= 90) {
    stars = 3;
    tier = 'gold';
    tierLabel = { en: '⭐⭐⭐ Gold Community Certified', te: '⭐⭐⭐ స్వర్ణ ధృవీకృత సభ్యులు' };
  } else if (score >= 70) {
    stars = 2;
    tier = 'silver';
    tierLabel = { en: '⭐⭐ Silver Candidate', te: '⭐⭐ రజత సభ్యులు' };
  }

  return {
    percentage: score,
    stars,
    tier,
    tierLabel,
    missingItems: missing,
    canAccessProfiles: score >= 50 && photos >= 2,
  };
}
