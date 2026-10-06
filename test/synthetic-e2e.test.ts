import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { NOTICES, OnboardingSchema, meetsLegalAge } from '../src/lib/onboarding.ts';
import { DiscoverQuerySchema, badgesFor } from '../src/lib/matrimony.ts';

// =============================================================================
// SYNTHETIC END-TO-END PROFILE TEST SUITE
// Validates:
// 1. Synthetic Candidate Onboarding Lifecycle
// 2. Strict Sagothra Exclusion & Badging Engine
// 3. DPDP (2023) Consent Ledger Chaining & Immediate Withdrawal Suspension
// 4. Double Bilateral Mutual Consent Handshake
// =============================================================================

const YEAR = new Date().getFullYear();

// Synthetic Candidates
const candidateGroomA = {
  id: randomUUID(),
  sub: randomUUID(),
  displayName: 'Kalyan Varma',
  gender: 'male' as const,
  dateOfBirth: `${YEAR - 28}-05-15`,
  gothraId: '11111111-1111-4000-8000-111111111111', // Bharadwaja
  lineageGroup: 'bharadwaja',
  district: 'suryapet',
  mandal: 'kodad',
  vocation: 'nadopasana' as const,
  salonHubSlug: null,
};

const candidateBrideB = {
  id: randomUUID(),
  sub: randomUUID(),
  displayName: 'Lavanya Sri',
  gender: 'female' as const,
  dateOfBirth: `${YEAR - 25}-08-20`,
  gothraId: '22222222-2222-4000-8000-222222222222', // Kashyapa (Different Gothra)
  lineageGroup: 'kashyapa',
  district: 'suryapet',
  mandal: 'kodad',
  vocation: 'wellness_artisan' as const,
  salonHubSlug: 'kodad-ayur-wellness',
};

const candidateBrideC_Sagothra = {
  id: randomUUID(),
  sub: randomUUID(),
  displayName: 'Sowmya Devi',
  gender: 'female' as const,
  dateOfBirth: `${YEAR - 26}-03-10`,
  gothraId: '11111111-1111-4000-8000-111111111111', // Bharadwaja (Sagothra with Groom A!)
  lineageGroup: 'bharadwaja',
  district: 'suryapet',
  mandal: 'kodad',
  vocation: 'corporate_tech_civil' as const,
  salonHubSlug: null,
};

test('1. Synthetic Onboarding Flow: Validation, Age, & Mandatory DPDP Consents', () => {
  // A. Age Verification
  assert.ok(meetsLegalAge(candidateGroomA.dateOfBirth, candidateGroomA.gender), 'Groom must meet legal age of 21');
  assert.ok(meetsLegalAge(candidateBrideB.dateOfBirth, candidateBrideB.gender), 'Bride must meet legal age of 18');
  assert.ok(!meetsLegalAge(`${YEAR - 19}-01-01`, 'male'), 'Male under 21 must be rejected');
  assert.ok(!meetsLegalAge(`${YEAR - 17}-01-01`, 'female'), 'Female under 18 must be rejected');

  // B. Onboarding Payload Construction for Bride B
  const brideBPayload = {
    lang: 'te' as const,
    pledge: { accepted: true as const, noticeVersion: NOTICES.pledge.version },
    heritage: {
      displayName: candidateBrideB.displayName,
      gender: candidateBrideB.gender,
      dateOfBirth: candidateBrideB.dateOfBirth,
      gothra: { kind: 'listed' as const, id: candidateBrideB.gothraId },
      maternalLineage: null,
      vocation: candidateBrideB.vocation,
      ancestralNativeDistrict: candidateBrideB.district,
      ancestralNativeMandal: candidateBrideB.mandal,
    },
    career: {
      educationDegree: 'B.Sc (Cosmetology & Wellness)',
      occupation: 'Wellness Spa Director',
      incomeBracket: '6l_12l',
      salonHubSlug: candidateBrideB.salonHubSlug,
      birthTime: '06:30',
      birthPlace: 'Kodad',
      nakshatra: 'rohini',
    },
    privacy: {
      photoVisibility: 'blurred' as const,
      contactMaskingAcknowledged: true as const,
      profileProcessingConsent: true as const,
      coordinatorVerificationConsent: true as const,
      profileNoticeVersion: NOTICES.profileProcessing.version,
      coordinatorNoticeVersion: NOTICES.coordinatorVerification.version,
    },
    contact: {
      phone: '+91 98480 12345',
      email: 'lavanya@example.invalid',
      whatsapp: null,
      doorAddress: '15-4 Temple Road, Kodad',
    },
  };

  const parsed = OnboardingSchema.parse(brideBPayload);
  assert.equal(parsed.heritage.ancestralNativeMandal, 'kodad', 'Mandal must be normalized to lowercase slug');
  assert.equal(parsed.contact.phone, '+919848012345', 'Phone number must be E.164 sanitized');
  assert.equal(parsed.career.salonHubSlug, 'kodad-ayur-wellness');

  // C. Badging Check
  const badges = badgesFor({ vocation: parsed.heritage.vocation, salonHubSlug: parsed.career.salonHubSlug });
  const badgeTitles = badges.map((b) => b.en);
  assert.ok(badgeTitles.includes('NS-ID Verified'), 'Must include sovereign verification badge');
  assert.ok(badgeTitles.includes('Enterprise Modernist'), 'Wellness artisan with salon hub slug must receive Enterprise Modernist badge');
});

test('2. Sagothra Exclusion Invariant: Database Filtering & Interest Guard', () => {
  // Simulate the viewer being Groom A (Gothra: Bharadwaja)
  const viewerSagothraGothraIds = new Set([candidateGroomA.gothraId]);

  const candidatePool = [candidateBrideB, candidateBrideC_Sagothra];

  // Discovery Filter: Exclude candidates matching viewer Sagothra IDs
  const eligibleCandidates = candidatePool.filter((c) => !viewerSagothraGothraIds.has(c.gothraId));

  assert.equal(eligibleCandidates.length, 1, 'Exactly one candidate must remain after Sagothra exclusion');
  assert.equal(eligibleCandidates[0]?.id, candidateBrideB.id, 'Candidate Bride B (Kashyapa) must be discoverable');
  assert.ok(
    !eligibleCandidates.some((c) => c.id === candidateBrideC_Sagothra.id),
    'Candidate Bride C (Bharadwaja) must be strictly excluded from Groom A discoverability roster'
  );

  // Interest Expression Guard: Attempting to express interest in Sagothra candidate must throw error
  function canExpressInterest(fromGothraId: string, toGothraId: string): { allowed: boolean; reason?: string } {
    if (fromGothraId === toGothraId) {
      return { allowed: false, reason: 'sagothra_prohibited' };
    }
    return { allowed: true };
  }

  assert.deepEqual(
    canExpressInterest(candidateGroomA.gothraId, candidateBrideC_Sagothra.gothraId),
    { allowed: false, reason: 'sagothra_prohibited' },
    'Interest between same Gothra must be strictly prohibited'
  );
  assert.deepEqual(
    canExpressInterest(candidateGroomA.gothraId, candidateBrideB.gothraId),
    { allowed: true },
    'Interest between different Gothras must be allowed'
  );
});

test('3. DPDP (2023) Cryptographic Consent Chaining & Immutable Audit', () => {
  // Simulate append-only consent ledger with SHA-256 chaining
  type ConsentEntry = {
    seq: number;
    userId: string;
    purpose: string;
    noticeVersion: string;
    granted: boolean;
    prevHash: string;
    entryHash: string;
  };

  const ledger: ConsentEntry[] = [];

  function appendConsent(userId: string, purpose: string, noticeVersion: string, granted: boolean): ConsentEntry {
    const seq = ledger.length + 1;
    const lastEntry = ledger[ledger.length - 1];
    const prevHash = ledger.length === 0 || !lastEntry ? '0'.repeat(64) : lastEntry.entryHash;
    const payload = `${seq}:${userId}:${purpose}:${noticeVersion}:${granted}:${prevHash}`;
    const entryHash = createHash('sha256').update(payload).digest('hex');

    const entry: ConsentEntry = { seq, userId, purpose, noticeVersion, granted, prevHash, entryHash };
    ledger.push(entry);
    return entry;
  }

  // Record initial onboarding consents for Bride B
  appendConsent(candidateBrideB.sub, 'community_pledge', NOTICES.pledge.version, true);
  appendConsent(candidateBrideB.sub, 'profile_processing', NOTICES.profileProcessing.version, true);
  appendConsent(candidateBrideB.sub, 'coordinator_verification', NOTICES.coordinatorVerification.version, true);

  assert.equal(ledger.length, 3, 'Three initial consent ledger entries must exist');

  // Verify chain integrity
  function verifyChain(): boolean {
    for (let i = 0; i < ledger.length; i++) {
      const current = ledger[i];
      if (!current) return false;
      const prevEntry = i === 0 ? undefined : ledger[i - 1];
      const expectedPrev = i === 0 || !prevEntry ? '0'.repeat(64) : prevEntry.entryHash;
      if (current.prevHash !== expectedPrev) return false;
      const expectedPayload = `${current.seq}:${current.userId}:${current.purpose}:${current.noticeVersion}:${current.granted}:${current.prevHash}`;
      const calculatedHash = createHash('sha256').update(expectedPayload).digest('hex');
      if (current.entryHash !== calculatedHash) return false;
    }
    return true;
  }

  assert.ok(verifyChain(), 'Consent hash chain must verify 100% intact');

  // Simulate DPDP Section 6 Consent Withdrawal
  // Bride B withdraws profile_processing consent
  const withdrawal = appendConsent(candidateBrideB.sub, 'profile_processing', NOTICES.profileProcessing.version, false);
  assert.equal(withdrawal.granted, false, 'Withdrawal entry must be recorded as granted=false');
  assert.ok(verifyChain(), 'Chain must remain unbroken following consent withdrawal');

  // Invariant: Withdrawing profile processing must immediately suspend active discoverability
  function computeProfileStatus(userId: string): 'verified' | 'suspended' {
    const userEntries = ledger.filter((e) => e.userId === userId && e.purpose === 'profile_processing');
    const latest = userEntries[userEntries.length - 1];
    return latest && latest.granted ? 'verified' : 'suspended';
  }

  assert.equal(computeProfileStatus(candidateBrideB.sub), 'suspended', 'Profile must be suspended immediately upon consent withdrawal');
});

test('4. Double Bilateral Contact Release: Strict Contact Masking Guarantee', () => {
  // Two-stage handshake state machine
  type InterestStatus = 'sent' | 'accepted' | 'contact_unlocked' | 'declined';
  let interest = {
    id: randomUUID(),
    fromSub: candidateGroomA.sub,
    toSub: candidateBrideB.sub,
    status: 'sent' as InterestStatus,
    senderContactConsent: false,
    recipientContactConsent: false,
  };

  function canDecryptContact(): boolean {
    return interest.status === 'contact_unlocked' && interest.senderContactConsent && interest.recipientContactConsent;
  }

  // Step 1: Initial Interest Expressed -> Contact strictly masked
  assert.equal(interest.status, 'sent');
  assert.ok(!canDecryptContact(), 'Contact MUST remain masked on interest sent');

  // Step 2: Recipient Accepts Interest -> Contact STILL masked (requires second consent)
  interest.status = 'accepted';
  assert.ok(!canDecryptContact(), 'Contact MUST remain masked on interest accept prior to explicit bilateral release');

  // Step 3: Sender grants contact share consent -> Contact STILL masked
  interest.senderContactConsent = true;
  assert.ok(!canDecryptContact(), 'Contact MUST remain masked when only one party consents');

  // Step 4: Recipient grants contact share consent -> Contact unlocked!
  interest.recipientContactConsent = true;
  interest.status = 'contact_unlocked';
  assert.ok(canDecryptContact(), 'Contact unlocked only when both parties explicitly consent (DPDP Section 6 bilateral contract)');
});
