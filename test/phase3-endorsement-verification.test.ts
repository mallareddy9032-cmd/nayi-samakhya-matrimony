import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getProfileEndorsement, 
  recordElderEndorsement, 
  submitElderMediationRequest, 
  listElderMediationRequests 
} from '../src/lib/endorsement/endorsement-store.ts';
import { ReviewActionSchema, ElderMediationRequestSchema } from '../src/lib/matrimony.ts';

test('phase 3: village elder endorsement retrieval & authentic Telugu attestation', () => {
  const endorsement = getProfileEndorsement('sample-1');
  assert.ok(endorsement);
  assert.equal(endorsement?.profileId, 'sample-1');
  assert.equal(endorsement?.elderName, 'శ్రీ పులిపాటి నారాయణ రావు గారు');
  assert.equal(endorsement?.elderTitle, 'గౌరవ అధ్యక్షులు, భాగ్యనగర్ నాయి బ్రాహ్మణ సేవా సంఘం');
  assert.equal(endorsement?.physicalVerificationStatus, 'family_known_generations');
  assert.equal(endorsement?.digitalSeal, 'NS-ELDER-VERIFIED-HYD-001');
  assert.ok(endorsement?.attestationStatementTe.includes('సత్ప్రవర్తన'));
});

test('phase 3: fallback elder endorsement for uncurated profiles', () => {
  const fallback = getProfileEndorsement('custom-profile-999');
  assert.ok(fallback);
  assert.equal(fallback?.profileId, 'custom-profile-999');
  assert.equal(fallback?.physicalVerificationStatus, 'verified_in_person');
  assert.ok(fallback?.digitalSeal.startsWith('NS-ELDER-VERIFIED-CUSTOM-P'));
});

test('phase 3: recording elder endorsement preserves audit metadata', () => {
  const custom = recordElderEndorsement('test-user-123', {
    elderName: 'కోదాటి లక్ష్మీనారాయణ',
    elderTitle: 'గ్రామ పటేల్ & సంఘ పెద్ద',
    elderVillage: 'వరంగల్ అర్బన్',
    endorsementType: 'village_elder',
    attestationStatementTe: 'కుటుంబం ఎంతో మంచిది, వివాహ సంబంధానికి సంపూర్ణ యోగ్యులు.'
  });

  assert.equal(custom.profileId, 'test-user-123');
  assert.equal(custom.elderName, 'కోదాటి లక్ష్మీనారాయణ');
  
  // Check retrieval
  const fetched = getProfileEndorsement('test-user-123');
  assert.equal(fetched?.elderName, 'కోదాటి లక్ష్మీనారాయణ');
});

test('phase 3: ReviewActionSchema accepts physical_verify and elder_endorse actions', () => {
  const physicalAction = {
    profileId: '11111111-1111-4111-8111-111111111111',
    action: 'physical_verify',
    notes: 'క్షేత్ర విచారణ పూర్తయింది. చిరునామా మరియు పూర్వపరాలు నిజమని తేలినవి.'
  };
  const parsePhysical = ReviewActionSchema.safeParse(physicalAction);
  assert.equal(parsePhysical.success, true);

  const elderAction = {
    profileId: '11111111-1111-4111-8111-111111111111',
    action: 'elder_endorse',
    elderName: 'కోదాటి లక్ష్మీనారాయణ',
    elderTitle: 'గ్రామ పటేల్ & సంఘ పెద్ద',
    statement: 'గ్రామ సంఘ పెద్దల నుంచి లేఖ మరియు స్వయంతృప్తి పత్రం సమర్పించబడినది.'
  };
  const parseElder = ReviewActionSchema.safeParse(elderAction);
  assert.equal(parseElder.success, true);
});

test('phase 3: Kalyana Rayabharam (Elder Concierge Mediation) request workflow', () => {
  const reqPayload = {
    toProfileId: '22222222-2222-4222-8222-222222222222',
    preferredVenue: 'temple_meet' as const,
    notes: 'ఇరు కుటుంబాలు కలిసి మాట్లాడుకోవడానికి పెద్దల సమక్షం కోరుచున్నాము.'
  };

  // Schema validation
  const parsed = ElderMediationRequestSchema.safeParse(reqPayload);
  assert.equal(parsed.success, true);

  // Submission
  const created = submitElderMediationRequest({
    fromProfileId: '11111111-1111-4111-8111-111111111111',
    toProfileId: reqPayload.toProfileId,
    preferredVenue: 'temple_meet',
    notes: reqPayload.notes,
  });
  assert.ok(created.id.includes('RAYABHARAM-'));
  assert.equal(created.status, 'requested');
  assert.equal(created.preferredVenue, 'temple_meet');

  // Retrieval
  const allRequests = listElderMediationRequests('11111111-1111-4111-8111-111111111111');
  assert.ok(allRequests.some(r => r.id === created.id));
});
