import test from 'node:test';
import assert from 'node:assert/strict';
import { areDistrictsBordering, getBorderingDistricts, calculateProximityTier } from '../src/lib/geo/bordering-districts.ts';
import { evaluateKinship } from '../src/lib/lineage/maternal-menarikam.ts';
import { DiscoverQuerySchema } from '../src/lib/matrimony.ts';

test('phase 2: cross-border proximity matching across Telangana and Andhra Pradesh', () => {
  // Cross-border adjacency checks (TG ↔ AP)
  assert.equal(areDistrictsBordering('khammam', 'vijayawada-ntr'), true);
  assert.equal(areDistrictsBordering('khammam', 'krishna'), true);
  assert.equal(areDistrictsBordering('khammam', 'eluru'), true);
  assert.equal(areDistrictsBordering('suryapet', 'palnadu'), true);
  assert.equal(areDistrictsBordering('suryapet', 'guntur'), true);
  assert.equal(areDistrictsBordering('jogulamba-gadwal', 'kurnool'), true);
  assert.equal(areDistrictsBordering('nagarkurnool', 'nandyal'), true);
  assert.equal(areDistrictsBordering('bhadradri-kothagudem', 'alluri-sitharama-raju'), true);

  // Symmetry check
  assert.equal(areDistrictsBordering('kurnool', 'jogulamba-gadwal'), true);
  assert.equal(areDistrictsBordering('palnadu', 'suryapet'), true);

  // Intra-state cluster adjacency
  assert.equal(areDistrictsBordering('hyderabad', 'rangareddy'), true);
  assert.equal(areDistrictsBordering('visakhapatnam', 'anakapalli'), true);

  // Distant non-bordering districts
  assert.equal(areDistrictsBordering('adilabad', 'tirupati'), false);
  assert.equal(areDistrictsBordering('nizamabad', 'chittoor'), false);
  assert.equal(areDistrictsBordering('srikakulam', 'jogulamba-gadwal'), false);

  // Same district is considered contiguous
  assert.equal(areDistrictsBordering('khammam', 'khammam'), true);

  // getBorderingDistricts returns self + neighbors
  const khammamNeighbors = getBorderingDistricts('khammam');
  assert.ok(khammamNeighbors.includes('khammam'));
  assert.ok(khammamNeighbors.includes('vijayawada-ntr'));
  assert.ok(khammamNeighbors.includes('suryapet'));

  // Proximity tier scoring
  // 0: Same mandal & district
  assert.equal(calculateProximityTier('khammam', 'khammam-urban', 'khammam', 'khammam-urban'), 0);
  // 1: Same district, different mandal
  assert.equal(calculateProximityTier('khammam', 'khammam-urban', 'khammam', 'kallur'), 1);
  // 2: Bordering sister district (Cross-border Khammam ↔ Vijayawada NTR)
  assert.equal(calculateProximityTier('khammam', 'khammam-urban', 'vijayawada-ntr', 'vijayawada-urban'), 2);
  // 3: Distant non-bordering
  assert.equal(calculateProximityTier('khammam', 'khammam-urban', 'srikakulam', 'srikakulam'), 3);
});

test('phase 2: maternal lineage (మాతృవంశం) & Menarikam (మేనరికం) cultural kinship engine', () => {
  // 1. Strict Sagothra (Paternal gotra identical) -> Forbidden
  const sagothraRes = evaluateKinship(
    { gothra: 'Kashyapa', maternalLineage: 'Bharadwaja' },
    { gothra: 'Kashyapa', maternalLineage: 'Gautama' }
  );
  assert.equal(sagothraRes.isSagothra, true);
  assert.equal(sagothraRes.relationType, 'sagothra_blocked');
  assert.ok(sagothraRes.titleTe.includes('సగోత్ర వర్జితం'));

  // 2. Menarikam: Candidate paternal gotra matches viewer maternal lineage
  const menarikamRes1 = evaluateKinship(
    { gothra: 'Kashyapa', maternalLineage: 'Bharadwaja' },
    { gothra: 'Bharadwaja', maternalLineage: 'Vashishta' }
  );
  assert.equal(menarikamRes1.isSagothra, false);
  assert.equal(menarikamRes1.isMenarikam, true);
  assert.equal(menarikamRes1.relationType, 'menarikam_related');
  assert.ok(menarikamRes1.titleTe.includes('మేనరిక బాంధవ్యం'));

  // 3. Menarikam: Candidate maternal lineage matches viewer paternal gotra
  const menarikamRes2 = evaluateKinship(
    { gothra: 'Kashyapa', maternalLineage: 'Gautama' },
    { gothra: 'Sandilya', maternalLineage: 'Kashyapa' }
  );
  assert.equal(menarikamRes2.isSagothra, false);
  assert.equal(menarikamRes2.isMenarikam, true);
  assert.equal(menarikamRes2.relationType, 'menarikam_related');

  // 4. Shared Maternal Gotra: Both have identical maternal lineages
  const sharedMaternalRes = evaluateKinship(
    { gothra: 'Kashyapa', maternalLineage: 'Bharadwaja' },
    { gothra: 'Gautama', maternalLineage: 'Bharadwaja' }
  );
  assert.equal(sharedMaternalRes.isSagothra, false);
  assert.equal(sharedMaternalRes.isMenarikam, false);
  assert.equal(sharedMaternalRes.relationType, 'shared_maternal');
  assert.ok(sharedMaternalRes.titleTe.includes('ఉమ్మడి మాతృ గోత్రం'));

  // 5. Completely Independent Lineages (Ideal)
  const independentRes = evaluateKinship(
    { gothra: 'Kashyapa', maternalLineage: 'Bharadwaja' },
    { gothra: 'Gautama', maternalLineage: 'Sandilya' }
  );
  assert.equal(independentRes.isSagothra, false);
  assert.equal(independentRes.isMenarikam, false);
  assert.equal(independentRes.relationType, 'independent');
  assert.ok(independentRes.titleTe.includes('స్వతంత్ర వంశ ధార'));
});

test('phase 2: discovery query schema supports cross-border and maternal filter flags', () => {
  const parsed = DiscoverQuerySchema.parse({
    includeBorderDistricts: 'true',
    excludeMaternalGotra: 'true',
    district: 'khammam',
    after: '2.11111111-2222-3333-4444-555555555555',
  });
  assert.equal(parsed.includeBorderDistricts, true);
  assert.equal(parsed.excludeMaternalGotra, true);
  assert.equal(parsed.district, 'khammam');
  assert.equal(parsed.after, '2.11111111-2222-3333-4444-555555555555');

  // Higher tiers up to tier 4 support keyset pagination
  const tier3Parsed = DiscoverQuerySchema.parse({
    after: '3.11111111-2222-3333-4444-555555555555',
  });
  assert.equal(tier3Parsed.after, '3.11111111-2222-3333-4444-555555555555');
});
