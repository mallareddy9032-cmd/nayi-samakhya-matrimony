/**
 * Types & Data Models for Phase 3:
 * Physical Verification & Village Elder / Nayee Community Endorsement System
 * and Kalyana Rayabharam (Elder Concierge Mediation) Protocol.
 */

export type EndorsementType = 
  | 'village_elder'        // గ్రామ పెద్దల ధృవీకరణ
  | 'sangham_president'    // మండల నాయి సేవా సంఘం అధ్యక్షులు
  | 'mandal_coordinator'   // మండల సమన్వయకర్త క్షేత్ర పరిశీలన
  | 'community_patron';    // కుల సంఘ పోషకులు

export type PhysicalVerificationStatus = 
  | 'verified_in_person'          // ప్రత్యక్ష విచారణ పూర్తయినది
  | 'home_visit_completed'        // గృహ సందర్శన & చిరునామా నిర్ధారణ
  | 'family_known_generations';   // 3 తరాలుగా సుపరిచిత కుటుంబం

export interface CommunityEndorsement {
  id: string;
  profileId: string;
  candidateName: string;
  elderName: string;            // e.g. "శ్రీ పులిపాటి నారాయణ రావు గారు"
  elderTitle: string;           // e.g. "గౌరవ అధ్యక్షులు, మండల నాయి బ్రాహ్మణ సేవా సంఘం"
  elderVillage: string;         // e.g. "కూసుమంచి (Kusumanchi)"
  elderMandal: string;
  elderDistrict: { en: string; te: string };
  elderPhoneMasked: string;     // e.g. "+91 98480 •••••"
  endorsementType: EndorsementType;
  physicalVerificationStatus: PhysicalVerificationStatus;
  verificationDate: string;     // e.g. "2026-10-04"
  reputationScore: number;      // 1 to 5 (or 100%)
  attestationStatementTe: string;
  attestationStatementEn: string;
  digitalSeal: string;          // e.g. "NS-ELDER-VERIFIED-2026"
  isDoorAddressVerified: boolean;
}

export interface PhysicalVerificationRecord {
  profileId: string;
  coordinatorId: string;
  verifiedAt: string;
  doorAddressConfirmed: boolean;
  familyBackgroundKnown: boolean;
  notes: string;
  endorsementId?: string;
}

export type MediationVenue = 
  | 'temple_meet'   // స్థానిక పుణ్యక్షేత్రం / ఆలయ ప్రాంగణంలో
  | 'home_visit'    // కుటుంబ పెద్దల సమక్షంలో గృహ సందర్శన
  | 'guided_call';  // సమన్వయకర్త సమక్షంలో టెలి-సంభాషణ

export type MediationStatus = 
  | 'requested'     // రాయబార అభ్యర్థన సమర్పించబడింది
  | 'in_dialogue'   // పెద్దల సంప్రదింపులు జరుగుతున్నాయి
  | 'blessed'       // శుభ ముహూర్తం ఖరారైంది
  | 'declined';     // ప్రస్తుతానికి తిరస్కరించబడింది

export interface ElderMediationRequest {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  coordinatorOrElderName: string;
  preferredVenue: MediationVenue;
  status: MediationStatus;
  notes?: string;
  requestedAt: string;
}
