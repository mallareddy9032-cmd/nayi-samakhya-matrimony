/**
 * Maternal Lineage (మాతృవంశం) & Menarikam (మేనరికం) Cultural Kinship Engine
 * Evaluates genealogical relationships between candidates across paternal and maternal lineages
 * according to Telugu cultural and community traditions.
 */

export interface LineageProfile {
  gothra: string;            // Paternal Gotra (పితృస్వామ్య గోత్రం)
  maternalLineage?: string | null; // Mother's maiden gotra / Maternal Uncle's Gotra (మేనమామ గోత్రం)
}

export type KinshipRelation = {
  isSagothra: boolean;
  isMenarikam: boolean;
  relationType: 'sagothra_blocked' | 'menarikam_related' | 'shared_maternal' | 'independent';
  titleTe: string;
  titleEn: string;
  descriptionTe: string;
  descriptionEn: string;
  badgeStyle: {
    bg: string;
    color: string;
    border: string;
  };
};

function normalizeGothra(g: string | null | undefined): string {
  if (!g) return '';
  return g.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Evaluates kinship relationship between two profiles
 */
export function evaluateKinship(viewer: LineageProfile, candidate: LineageProfile): KinshipRelation {
  const vPat = normalizeGothra(viewer.gothra);
  const cPat = normalizeGothra(candidate.gothra);
  const vMat = normalizeGothra(viewer.maternalLineage);
  const cMat = normalizeGothra(candidate.maternalLineage);

  // 1. Strict Paternal Sagothra (Forbidden)
  if (vPat && cPat && vPat === cPat) {
    return {
      isSagothra: true,
      isMenarikam: false,
      relationType: 'sagothra_blocked',
      titleTe: 'సగోత్ర వర్జితం (Sagothra Excluded)',
      titleEn: 'Same Paternal Gotra (Excluded)',
      descriptionTe: 'ఒకే పితృస్వామ్య గోత్రం ఉన్నందున శాస్త్రోక్తంగా వివాహం నిషిద్ధం.',
      descriptionEn: 'Marriage is strictly prohibited as both belong to the same paternal lineage.',
      badgeStyle: { bg: '#FEE2E2', color: '#991B1B', border: '#F87171' },
    };
  }

  // 2. Cross-Cousin / Maternal Uncle Lineage (మేనరికం)
  const isCandidateInViewerMaternal = vMat && cPat && vMat === cPat;
  const isViewerInCandidateMaternal = cMat && vPat && cMat === vPat;

  if (isCandidateInViewerMaternal || isViewerInCandidateMaternal) {
    return {
      isSagothra: false,
      isMenarikam: true,
      relationType: 'menarikam_related',
      titleTe: 'మేనరిక బాంధవ్యం (Menarikam Lineage)',
      titleEn: 'Maternal Uncle Lineage Link (Menarikam)',
      descriptionTe: 'మాతృవంశ గోత్ర సాన్నిహిత్యం కలదు (మేనరికం సాంప్రదాయం ప్రకారం పరిశీలించదగినది).',
      descriptionEn: 'Connected through maternal uncle gotra (eligible under traditional Menarikam customs if mutually preferred).',
      badgeStyle: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
    };
  }

  // 3. Shared Maternal Gothra
  if (vMat && cMat && vMat === cMat) {
    return {
      isSagothra: false,
      isMenarikam: false,
      relationType: 'shared_maternal',
      titleTe: 'ఉమ్మడి మాతృ గోత్రం (Shared Maternal Lineage)',
      titleEn: 'Shared Maternal Gotra',
      descriptionTe: 'ఇరువైపులా తల్లిగారి పుట్టింటి గోత్రం సమానంగా ఉన్నది.',
      descriptionEn: 'Both parties share the same maternal gotra lineage.',
      badgeStyle: { bg: '#EFF6FF', color: '#1E40AF', border: '#93C5FD' },
    };
  }

  // 4. Completely Independent Lineages (Ideal)
  return {
    isSagothra: false,
    isMenarikam: false,
    relationType: 'independent',
    titleTe: 'స్వతంత్ర వంశ ధార (Independent Lineages)',
    titleEn: 'Completely Independent Lineages',
    descriptionTe: 'పితృ మరియు మాతృ గోత్రాలు రెండూ వేర్వేరుగా ఉన్న శుభకరమైన సంబంధం.',
    descriptionEn: 'Both paternal and maternal lineages are completely distinct and independent.',
    badgeStyle: { bg: '#ECFDF5', color: '#065F46', border: '#10B981' },
  };
}
