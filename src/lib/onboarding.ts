// Onboarding payload contract, option labels and versioned notices. Pure: imported by the wizard
// (client) and by the API (server), so both validate with the same schema.
import { z } from 'zod';

export type Lang = 'en' | 'te';
export type Bilingual = { en: string; te: string };

const keysOf = <T extends Record<string, Bilingual>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const VOCATIONS = {
  nadopasana: { en: 'Nadopasana Custodian — Classical / Temple Musician', te: 'నాదోపాసన సంరక్షకులు — శాస్త్రీయ / ఆలయ సంగీత విద్వాంసులు' },
  wellness_artisan: { en: 'Soundarya & Wellness Artisan — Salon Founder / Stylist', te: 'సౌందర్య & ఆరోగ్య కళాకారులు — సెలూన్ వ్యవస్థాపకులు / స్టైలిస్ట్' },
  corporate_tech_civil: { en: 'Corporate, Technology & Civil Services', te: 'కార్పొరేట్, సాంకేతిక & పౌర సేవలు' },
  healthcare_traditional_medicine: { en: 'Healthcare & Traditional Medicine', te: 'ఆరోగ్య సంరక్షణ & సాంప్రదాయ వైద్యం' },
  scholarly_academic: { en: 'Scholarly & Academic', te: 'పాండిత్య & విద్యా రంగం' },
} satisfies Record<string, Bilingual>;

export const INCOME_BRACKETS = {
  upto_3l: { en: 'Up to ₹3 lakh', te: '₹3 లక్షల వరకు' },
  '3l_6l': { en: '₹3–6 lakh', te: '₹3–6 లక్షలు' },
  '6l_12l': { en: '₹6–12 lakh', te: '₹6–12 లక్షలు' },
  '12l_25l': { en: '₹12–25 lakh', te: '₹12–25 లక్షలు' },
  '25l_50l': { en: '₹25–50 lakh', te: '₹25–50 లక్షలు' },
  above_50l: { en: 'Above ₹50 lakh', te: '₹50 లక్షలకు పైగా' },
  prefer_not_to_say: { en: 'Prefer not to say', te: 'చెప్పకూడదనుకుంటున్నాను' },
} satisfies Record<string, Bilingual>;

export const PHOTO_VISIBILITY = {
  public_verified: { en: 'Visible to verified members', te: 'ధృవీకరించబడిన సభ్యులకు కనిపిస్తుంది' },
  blurred: { en: 'Blurred until mutual interest', te: 'పరస్పర ఆసక్తి వరకు మసకగా' },
  on_request: { en: 'Shown only when I approve a request', te: 'నేను అనుమతించినప్పుడు మాత్రమే' },
} satisfies Record<string, Bilingual>;

export const NAKSHATRAS = {
  ashwini: { en: 'Ashwini', te: 'అశ్విని' }, bharani: { en: 'Bharani', te: 'భరణి' }, krittika: { en: 'Krittika', te: 'కృత్తిక' },
  rohini: { en: 'Rohini', te: 'రోహిణి' }, mrigashira: { en: 'Mrigashira', te: 'మృగశిర' }, ardra: { en: 'Ardra', te: 'ఆర్ద్ర' },
  punarvasu: { en: 'Punarvasu', te: 'పునర్వసు' }, pushya: { en: 'Pushya', te: 'పుష్యమి' }, ashlesha: { en: 'Ashlesha', te: 'ఆశ్లేష' },
  magha: { en: 'Magha', te: 'మఖ' }, purva_phalguni: { en: 'Purva Phalguni', te: 'పుబ్బ' }, uttara_phalguni: { en: 'Uttara Phalguni', te: 'ఉత్తర' },
  hasta: { en: 'Hasta', te: 'హస్త' }, chitra: { en: 'Chitra', te: 'చిత్త' }, swati: { en: 'Swati', te: 'స్వాతి' },
  vishakha: { en: 'Vishakha', te: 'విశాఖ' }, anuradha: { en: 'Anuradha', te: 'అనూరాధ' }, jyeshtha: { en: 'Jyeshtha', te: 'జ్యేష్ఠ' },
  mula: { en: 'Mula', te: 'మూల' }, purva_ashadha: { en: 'Purva Ashadha', te: 'పూర్వాషాఢ' }, uttara_ashadha: { en: 'Uttara Ashadha', te: 'ఉత్తరాషాఢ' },
  shravana: { en: 'Shravana', te: 'శ్రవణం' }, dhanishta: { en: 'Dhanishta', te: 'ధనిష్ఠ' }, shatabhisha: { en: 'Shatabhisha', te: 'శతభిషం' },
  purva_bhadrapada: { en: 'Purva Bhadrapada', te: 'పూర్వాభాద్ర' }, uttara_bhadrapada: { en: 'Uttara Bhadrapada', te: 'ఉత్తరాభాద్ర' },
  revati: { en: 'Revati', te: 'రేవతి' },
} satisfies Record<string, Bilingual>;

// Versioned notices. The server logs `${version}.${lang}` and the exact text of the language the
// member chose; bump the version whenever any wording changes.
export const NOTICES = {
  pledge: {
    version: 'pledge-v1',
    en: 'Self-Respect Pledge. As a member of the Nayi Brahmin community, I join Nayi Samakhya Matrimony with self-respect and honesty. I will give only true information about myself and my family. I will treat every member and family with dignity, and I will neither ask for nor give dowry in any form. I will respect the privacy of others and never share their details outside this service. I am proud of our heritage of Mangala Nadaswaram, Dhanvantari wellness and modern enterprise.',
    te: 'ఆత్మగౌరవ ప్రతిజ్ఞ. నాయీ బ్రాహ్మణ సమాజ సభ్యులుగా నేను ఆత్మగౌరవంతో, నిజాయితీతో నాయీ సమాఖ్య వివాహ వేదికలో చేరుతున్నాను. నా గురించి, నా కుటుంబం గురించి నిజమైన సమాచారాన్ని మాత్రమే ఇస్తాను. ప్రతి సభ్యుడిని, ప్రతి కుటుంబాన్ని గౌరవంగా చూస్తాను; ఏ రూపంలోనూ కట్నం అడగను, ఇవ్వను. ఇతరుల గోప్యతను గౌరవిస్తాను; వారి వివరాలను ఈ వేదిక బయట ఎప్పుడూ పంచుకోను. మంగళ నాదస్వరం, ధన్వంతరి ఆరోగ్య సంప్రదాయం, ఆధునిక వ్యాపార వారసత్వం పట్ల నేను గర్విస్తున్నాను.',
  },
  profileProcessing: {
    version: 'dpdp-profile-v1',
    en: 'Consent under Section 6 of the Digital Personal Data Protection Act, 2023. I consent to Nayi Samakhya Matrimony processing the profile details I have entered (name, gender, date of birth, gothra, maternal lineage, ancestral district and mandal, education, occupation, income bracket, optional horoscope details and photo preference) for one purpose only: showing my profile to other community-verified members for matchmaking. My gothra is used to hide profiles of the same lineage. My phone, email, WhatsApp and address are stored encrypted and are shown to no one unless I accept a mutual interest and separately agree to share them. I can withdraw this consent at any time, as easily as I gave it; processing then stops, without affecting processing done before. Grievances: the NSM Grievance Officer, through the Nayi Samakhya portal.',
    te: 'డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 సెక్షన్ 6 ప్రకారం సమ్మతి. నేను నమోదు చేసిన ప్రొఫైల్ వివరాలను (పేరు, లింగం, పుట్టిన తేదీ, గోత్రం, తల్లి వంశం, పూర్వీకుల జిల్లా మరియు మండలం, విద్య, వృత్తి, ఆదాయ శ్రేణి, ఐచ్ఛిక జాతక వివరాలు, ఫోటో ప్రాధాన్యత) ఒకే ఒక ప్రయోజనం కోసం — సంబంధాల కోసం సమాజ-ధృవీకరణ పొందిన ఇతర సభ్యులకు నా ప్రొఫైల్‌ను చూపించడం కోసం — నాయీ సమాఖ్య వివాహ వేదిక ప్రాసెస్ చేయడానికి నేను సమ్మతిస్తున్నాను. ఒకే వంశం (సగోత్ర) ప్రొఫైల్‌లను దాచడానికి నా గోత్రాన్ని ఉపయోగిస్తారు. నా ఫోన్, ఇమెయిల్, వాట్సాప్, చిరునామా గుప్తీకరించి భద్రపరుస్తారు; నేను పరస్పర ఆసక్తిని అంగీకరించి, వాటిని పంచుకోవడానికి విడిగా సమ్మతిస్తే తప్ప ఎవరికీ చూపించరు. ఈ సమ్మతిని ఇచ్చినంత సులభంగా ఎప్పుడైనా ఉపసంహరించుకోవచ్చు; అప్పుడు ప్రాసెసింగ్ ఆగిపోతుంది, అంతకు ముందు జరిగిన ప్రాసెసింగ్‌పై ప్రభావం ఉండదు. ఫిర్యాదుల కోసం: నాయీ సమాఖ్య పోర్టల్ ద్వారా NSM ఫిర్యాదుల అధికారి.',
  },
  coordinatorVerification: {
    version: 'dpdp-coord-v1',
    en: 'I consent to the Nayi Samakhya Mandal Coordinator of my ancestral mandal (or, if none is assigned, the District Lineage Officer) viewing my profile details, including my door address, for one purpose only: verifying my identity, family and gothra before my profile is shown to other members. They may visit my address for this verification. Every access is recorded. I can withdraw this consent at any time; my profile will then not be verified or shown.',
    te: 'నా ప్రొఫైల్ ఇతర సభ్యులకు చూపించే ముందు నా గుర్తింపు, కుటుంబం, గోత్రాన్ని ధృవీకరించడం అనే ఒకే ప్రయోజనం కోసం — నా ఇంటి చిరునామాతో సహా నా ప్రొఫైల్ వివరాలను నా పూర్వీకుల మండలానికి చెందిన నాయీ సమాఖ్య మండల సమన్వయకర్త (వారు లేకపోతే జిల్లా వంశ అధికారి) చూడటానికి నేను సమ్మతిస్తున్నాను. ఈ ధృవీకరణ కోసం వారు నా చిరునామాను సందర్శించవచ్చు. ప్రతి వీక్షణ నమోదు చేయబడుతుంది. ఈ సమ్మతిని ఎప్పుడైనా ఉపసంహరించుకోవచ్చు; అప్పుడు నా ప్రొఫైల్ ధృవీకరించబడదు, చూపించబడదు.',
  },
  photoDisplay: {
    version: 'dpdp-photo-v1',
    en: 'I consent to Nayi Samakhya Matrimony storing my photo and showing it, according to my photo visibility setting, to community-verified members for matchmaking, to my Mandal Coordinator while my profile is being verified, and to a Grievance Officer handling a complaint about it. Location and device details are removed from the photo, it is stored privately, and it is shown only through short-lived links. I can withdraw this consent at any time, as easily as I gave it; my photo is then deleted.',
    te: 'నా ఫోటోను భద్రపరచి, నా ఫోటో గోప్యత ఎంపిక ప్రకారం సంబంధాల కోసం సమాజ-ధృవీకరణ పొందిన సభ్యులకు, నా ప్రొఫైల్ ధృవీకరణ సమయంలో నా మండల సమన్వయకర్తకు, దానిపై ఫిర్యాదును పరిష్కరిస్తున్న ఫిర్యాదుల అధికారికి చూపించడానికి నాయీ సమాఖ్య వివాహ వేదికకు నేను సమ్మతిస్తున్నాను. ఫోటో నుండి స్థలం, పరికరం వివరాలు తొలగించి గోప్యంగా భద్రపరుస్తారు; స్వల్పకాలిక లింకుల ద్వారా మాత్రమే చూపిస్తారు. ఈ సమ్మతిని ఇచ్చినంత సులభంగా ఎప్పుడైనా ఉపసంహరించుకోవచ్చు; అప్పుడు నా ఫోటో తొలగించబడుతుంది.',
  },
  contactShare: {
    version: 'dpdp-contact-v1',
    en: 'I consent to Nayi Samakhya Matrimony showing my phone number, email and WhatsApp number to this one member, with whom I have a mutually accepted interest, for one purpose only: contacting me about this marriage proposal. They are shown only after we have both given this consent, and every view is recorded. I can withdraw this consent at any time, as easily as I gave it; my details are then no longer shown to this member.',
    te: 'పరస్పరం అంగీకరించిన ఆసక్తి ఉన్న ఈ ఒక్క సభ్యునికి, ఈ వివాహ ప్రతిపాదన గురించి నన్ను సంప్రదించడం అనే ఒకే ప్రయోజనం కోసం, నా ఫోన్ నంబర్, ఇమెయిల్, వాట్సాప్ నంబర్‌ను నాయీ సమాఖ్య వివాహ వేదిక చూపించడానికి నేను సమ్మతిస్తున్నాను. మేమిద్దరం ఈ సమ్మతి ఇచ్చిన తర్వాతే అవి చూపించబడతాయి; ప్రతి వీక్షణ నమోదు చేయబడుతుంది. ఈ సమ్మతిని ఇచ్చినంత సులభంగా ఎప్పుడైనా ఉపసంహరించుకోవచ్చు; అప్పుడు నా వివరాలు ఈ సభ్యునికి ఇక చూపించబడవు.',
  },
} as const;

export const CONTACT_MASKING: Bilingual = {
  en: 'My phone, email, WhatsApp and address stay hidden. A match sees them only after we both accept the interest and both agree to share contact details.',
  te: 'నా ఫోన్, ఇమెయిల్, వాట్సాప్, చిరునామా దాగి ఉంటాయి. మేమిద్దరం ఆసక్తిని అంగీకరించి, సంప్రదింపు వివరాలు పంచుకోవడానికి ఇద్దరూ సమ్మతించిన తర్వాతే అవి ఆ సంబంధానికి కనిపిస్తాయి.',
};

/** Today's date in India (YYYY-MM-DD): the legal-age gate is judged on the member's calendar. */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
}

/** Prohibition of Child Marriage Act, 2006: 21 (male) / 18 (female), exact on the birthday. */
export function meetsLegalAge(dateOfBirth: string, gender: 'male' | 'female', today: string): boolean {
  const years = gender === 'male' ? 21 : 18;
  const cutoff = `${String(Number(today.slice(0, 4)) - years).padStart(4, '0')}${today.slice(4)}`;
  return dateOfBirth <= cutoff;
}

export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '');
}

const text = (max: number) => z.string().trim().min(1).max(max);
const phone = z.string().transform((s) => s.replace(/[\s-]/g, '')).pipe(z.string().regex(/^\+?[0-9]{10,15}$/));

export const PledgeSchema = z.strictObject({
  accepted: z.literal(true),
  noticeVersion: z.literal(NOTICES.pledge.version),
});

const GothraChoice = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('listed'), id: z.uuid() }),
  z.strictObject({
    kind: z.literal('proposed'),
    nameEn: z.string().trim().regex(/^[A-Za-z][A-Za-z .'-]{1,58}$/),
    nameTe: z.string().trim().min(1).max(60).nullable(),
  }),
]);

export const HeritageSchema = z
  .strictObject({
    displayName: text(80),
    gender: z.enum(['male', 'female']),
    dateOfBirth: z.iso.date(),
    gothra: GothraChoice,
    maternalLineage: text(80).nullable(),
    vocation: z.enum(keysOf(VOCATIONS)),
    ancestralNativeDistrict: z.string().regex(/^[a-z][a-z-]{1,40}$/),
    ancestralNativeMandal: z.string().transform(slugify).pipe(z.string().regex(/^[a-z][a-z-]{1,40}$/)),
  })
  .superRefine((h, ctx) => {
    const today = todayInIndia();
    if (h.dateOfBirth < '1940-01-02' || h.dateOfBirth > today) {
      ctx.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'invalid_date' });
    } else if (!meetsLegalAge(h.dateOfBirth, h.gender, today)) {
      ctx.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'below_legal_marriage_age' });
    }
  });

export const CareerSchema = z.strictObject({
  educationDegree: text(120),
  occupation: text(120),
  incomeBracket: z.enum(keysOf(INCOME_BRACKETS)),
  salonHubSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,62}$/).nullable(),
  birthTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  birthPlace: text(80).nullable(),
  nakshatra: z.enum(keysOf(NAKSHATRAS)).nullable(),
});

export const PrivacySchema = z.strictObject({
  photoVisibility: z.enum(keysOf(PHOTO_VISIBILITY)),
  contactMaskingAcknowledged: z.literal(true),
  profileProcessingConsent: z.literal(true),
  coordinatorVerificationConsent: z.literal(true),
  profileNoticeVersion: z.literal(NOTICES.profileProcessing.version),
  coordinatorNoticeVersion: z.literal(NOTICES.coordinatorVerification.version),
});

export const ContactSchema = z.strictObject({
  phone,
  email: z.email().max(254).nullable(),
  whatsapp: phone.nullable(),
  doorAddress: text(500),
});

// Strict objects: identity (sub, ns_membership_id) is never accepted from the body.
export const OnboardingSchema = z
  .strictObject({
    lang: z.enum(['en', 'te']),
    pledge: PledgeSchema,
    heritage: HeritageSchema,
    career: CareerSchema,
    privacy: PrivacySchema,
    contact: ContactSchema,
  })
  .superRefine((p, ctx) => {
    if (p.career.salonHubSlug !== null && p.heritage.vocation !== 'wellness_artisan') {
      ctx.addIssue({ code: 'custom', path: ['career', 'salonHubSlug'], message: 'enterprise_badge_needs_wellness_artisan' });
    }
  });
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

export type ProfileState = 'not_started' | 'draft' | 'pending_mandal_review' | 'verified' | 'rejected' | 'suspended' | 'erased';
export type OnboardingStatus = {
  state: ProfileState;
  step: number;
  matrimonialId: string | null;
  coordinatorAssigned: boolean;
  reviewNote: string | null;
};

/** Wizard step to resume at. After rejection the member starts over: pledge and consents are re-given. */
export function stepForState(state: ProfileState): number {
  return state === 'not_started' || state === 'draft' || state === 'rejected' ? 1 : 7;
}
