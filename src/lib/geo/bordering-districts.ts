/**
 * Cross-Border & Intra-State District Adjacency Matrix
 * Models continuous geographic boundaries between Telangana (33) and Andhra Pradesh (26)
 * to support proximity-ranked matching across state borders.
 */

export const BORDERING_DISTRICTS_MAP: Record<string, string[]> = {
  // --- TELANGANA - ANDHRA PRADESH BORDER DISTRICTS ---
  'khammam': [
    // Andhra Pradesh neighbors
    'vijayawada-ntr', 'krishna', 'eluru',
    // Telangana neighbors
    'bhadradri-kothagudem', 'suryapet', 'mahabubabad'
  ],
  'suryapet': [
    // Andhra Pradesh neighbors
    'vijayawada-ntr', 'guntur', 'palnadu',
    // Telangana neighbors
    'nalgonda', 'khammam', 'jangaon', 'mahabubabad'
  ],
  'nalgonda': [
    // Andhra Pradesh neighbors
    'palnadu', 'guntur', 'bapatla',
    // Telangana neighbors
    'suryapet', 'rangareddy', 'yadadri-bhuvanagiri', 'nagarkurnool'
  ],
  'bhadradri-kothagudem': [
    // Andhra Pradesh neighbors
    'alluri-sitharama-raju', 'eluru', 'east-godavari',
    // Telangana neighbors
    'khammam', 'mahabubabad', 'mulugu', 'jayashankar-bhupalpally'
  ],
  'jogulamba-gadwal': [
    // Andhra Pradesh neighbors
    'kurnool', 'nandyal',
    // Telangana neighbors
    'wanaparthy', 'narayanpet'
  ],
  'wanaparthy': [
    // Andhra Pradesh neighbors
    'kurnool',
    // Telangana neighbors
    'nagarkurnool', 'mahabubnagar', 'jogulamba-gadwal'
  ],
  'nagarkurnool': [
    // Andhra Pradesh neighbors
    'nandyal', 'prakasam', 'palnadu',
    // Telangana neighbors
    'nalgonda', 'rangareddy', 'wanaparthy', 'mahabubnagar'
  ],

  // --- ANDHRA PRADESH - TELANGANA BORDER DISTRICTS ---
  'kurnool': [
    // Telangana neighbors
    'jogulamba-gadwal', 'wanaparthy',
    // Andhra Pradesh neighbors
    'nandyal', 'anantapur'
  ],
  'nandyal': [
    // Telangana neighbors
    'jogulamba-gadwal', 'nagarkurnool',
    // Andhra Pradesh neighbors
    'kurnool', 'prakasam', 'kadapa-ysr', 'anantapur'
  ],
  'palnadu': [
    // Telangana neighbors
    'suryapet', 'nalgonda', 'nagarkurnool',
    // Andhra Pradesh neighbors
    'guntur', 'bapatla', 'prakasam'
  ],
  'vijayawada-ntr': [
    // Telangana neighbors
    'khammam', 'suryapet',
    // Andhra Pradesh neighbors
    'krishna', 'guntur', 'eluru'
  ],
  'eluru': [
    // Telangana neighbors
    'khammam', 'bhadradri-kothagudem',
    // Andhra Pradesh neighbors
    'vijayawada-ntr', 'krishna', 'west-godavari', 'east-godavari', 'alluri-sitharama-raju'
  ],
  'alluri-sitharama-raju': [
    // Telangana neighbors
    'bhadradri-kothagudem',
    // Andhra Pradesh neighbors
    'parvathipuram-manyam', 'anakapalli', 'kakinada', 'east-godavari', 'eluru'
  ],

  // --- COASTAL ANDHRA SISTER CLUSTERS ---
  'visakhapatnam': ['anakapalli', 'vizianagaram'],
  'anakapalli': ['visakhapatnam', 'vizianagaram', 'alluri-sitharama-raju', 'kakinada'],
  'vizianagaram': ['visakhapatnam', 'anakapalli', 'srikakulam', 'parvathipuram-manyam'],
  'srikakulam': ['vizianagaram', 'parvathipuram-manyam'],
  'parvathipuram-manyam': ['srikakulam', 'vizianagaram', 'alluri-sitharama-raju'],
  'kakinada': ['anakapalli', 'alluri-sitharama-raju', 'east-godavari', 'konaseema'],
  'konaseema': ['kakinada', 'east-godavari', 'west-godavari'],
  'east-godavari': ['kakinada', 'konaseema', 'west-godavari', 'eluru', 'alluri-sitharama-raju'],
  'west-godavari': ['east-godavari', 'konaseema', 'eluru', 'krishna'],
  'krishna': ['west-godavari', 'eluru', 'vijayawada-ntr', 'bapatla'],
  'guntur': ['vijayawada-ntr', 'palnadu', 'bapatla'],
  'bapatla': ['guntur', 'palnadu', 'prakasam', 'krishna'],
  'prakasam': ['bapatla', 'palnadu', 'nandyal', 'sri-potti-sriramulu-nellore', 'kadapa-ysr'],
  'sri-potti-sriramulu-nellore': ['prakasam', 'kadapa-ysr', 'annamayya', 'tirupati'],

  // --- RAYALASEEMA SISTER CLUSTERS ---
  'anantapur': ['kurnool', 'nandyal', 'sri-sathya-sai'],
  'sri-sathya-sai': ['anantapur', 'kadapa-ysr', 'annamayya'],
  'kadapa-ysr': ['nandyal', 'prakasam', 'sri-potti-sriramulu-nellore', 'annamayya', 'sri-sathya-sai'],
  'annamayya': ['kadapa-ysr', 'sri-sathya-sai', 'chittoor', 'tirupati', 'sri-potti-sriramulu-nellore'],
  'tirupati': ['sri-potti-sriramulu-nellore', 'annamayya', 'chittoor'],
  'chittoor': ['tirupati', 'annamayya'],

  // --- HYDERABAD & CORE TELANGANA CLUSTERS ---
  'hyderabad': ['rangareddy', 'medchal-malkajgiri'],
  'rangareddy': ['hyderabad', 'medchal-malkajgiri', 'vikarabad', 'mahabubnagar', 'nalgonda', 'yadadri-bhuvanagiri'],
  'medchal-malkajgiri': ['hyderabad', 'rangareddy', 'sangareddy', 'siddipet', 'yadadri-bhuvanagiri'],
  'warangal': ['hanumakonda', 'jangaon', 'mahabubabad', 'jayashankar-bhupalpally'],
  'hanumakonda': ['warangal', 'jangaon', 'karimnagar', 'siddipet', 'jayashankar-bhupalpally'],
  'karimnagar': ['hanumakonda', 'peddapalli', 'jagtial', 'rajanna-sircilla', 'siddipet'],
  'nizamabad': ['kamareddy', 'nirmal', 'jagtial'],
};

/**
 * Checks if two districts share a physical boundary or are contiguous sister districts
 */
export function areDistrictsBordering(d1: string, d2: string): boolean {
  if (!d1 || !d2) return false;
  if (d1 === d2) return true;
  const neighbors1 = BORDERING_DISTRICTS_MAP[d1] || [];
  const neighbors2 = BORDERING_DISTRICTS_MAP[d2] || [];
  return neighbors1.includes(d2) || neighbors2.includes(d1);
}

/**
 * Get all neighboring districts for a given district slug (including cross-border)
 */
export function getBorderingDistricts(districtSlug: string): string[] {
  if (!districtSlug) return [];
  const list = BORDERING_DISTRICTS_MAP[districtSlug] || [];
  return Array.from(new Set([districtSlug, ...list]));
}

/**
 * Calculates geographic proximity tier between viewer and candidate
 * 0: Same Mandal & District
 * 1: Same District
 * 2: Bordering Sister District (cross-border or contiguous)
 * 3: Rest of Telugu States / Diaspora
 */
export function calculateProximityTier(
  viewerDistrict: string,
  viewerMandal: string,
  candidateDistrict: string,
  candidateMandal: string
): number {
  if (!viewerDistrict || !candidateDistrict) return 3;
  if (viewerDistrict === candidateDistrict && viewerMandal === candidateMandal) return 0;
  if (viewerDistrict === candidateDistrict) return 1;
  if (areDistrictsBordering(viewerDistrict, candidateDistrict)) return 2;
  return 3;
}
