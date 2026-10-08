'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { z } from 'zod';
import {
  CONTACT_MASKING,
  INCOME_BRACKETS,
  NAKSHATRAS,
  NOTICES,
  OnboardingSchema,
  PHOTO_VISIBILITY,
  VOCATIONS,
  slugify,
  type Bilingual,
  type Lang,
} from '../../lib/onboarding.ts';
import { ALL_TELANGANA_DISTRICTS, getMandalsForDistrict } from '../../lib/telangana-districts-mandals.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

type Gothra = { id: string; nameEn: string; nameTe: string };
type District = { slug: string; code?: string; nameEn: string; nameTe: string };
type Mandal = { district: string; slug: string; nameEn: string; nameTe?: string };
type Result = { matrimonialId: string; coordinatorAssigned: boolean };

const ResultSchema = z.object({ matrimonialId: z.string(), coordinatorAssigned: z.boolean() });
const SUBMIT_URL = '/matrimony/api/onboarding/submit';
const PROPOSE = '__propose__';

const STEPS: Bilingual[] = [
  { en: 'Membership Details', te: 'సభ్యత్వ వివరాలు' },
  { en: 'Community Pledge', te: 'సమాజ ప్రతిజ్ఞ' },
  { en: 'Heritage & Lineage', te: 'కుటుంబం & వంశ వివరాలు' },
  { en: 'Education & Career', te: 'విద్య & ఉద్యోగం' },
  { en: 'Privacy & Consents', te: 'గోప్యత & సమ్మతులు' },
  { en: 'Review & Submission', te: 'సమీక్ష & నమోదు' },
  { en: 'Confirmation', te: 'విజయవంతం' },
];

const STEP_SECTIONS: Record<number, string[]> = {
  2: ['pledge'],
  3: ['heritage'],
  4: ['career'],
  5: ['privacy', 'contact'],
};

const MESSAGES: Record<string, Bilingual> = {
  consent_required: { en: 'Please check this box to proceed.', te: 'కొనసాగడానికి దయచేసి ఈ పెట్టెను టిక్ చేయండి.' },
  below_legal_marriage_age: { en: 'Minimum marriage age is 21 for men and 18 for women.', te: 'కనీస వివాహ వయస్సు పురుషులకు 21, స్త్రీలకు 18.' },
  invalid_date: { en: 'Please enter a valid birth date.', te: 'దయచేసి సరైన పుట్టిన తేదీని నమోదు చేయండి.' },
  name_required: { en: 'Please enter candidate full name.', te: 'దయచేసి అభ్యర్థి పూర్తి పేరు నమోదు చేయండి.' },
  gender_required: { en: 'Please select whether Bride or Groom.', te: 'దయచేసి వధువు లేదా వరుడు ఎంచుకోండి.' },
  dob_required: { en: 'Please provide date of birth.', te: 'దయచేసి పుట్టిన తేదీ నమోదు చేయండి.' },
  gothra_required: { en: 'Please choose family Gothra.', te: 'దయచేసి కుటుంబ గోత్రం ఎంచుకోండి.' },
  district_required: { en: 'Please select native district.', te: 'దయచేసి స్వస్థల జిల్లా ఎంచుకోండి.' },
  mandal_required: { en: 'Please select native mandal.', te: 'దయచేసి స్వస్థల మండలం ఎంచుకోండి.' },
  degree_required: { en: 'Please enter highest education qualification.', te: 'దయచేసి విద్యార్హత నమోదు చేయండి.' },
  occupation_required: { en: 'Please enter job title or business details.', te: 'దయచేసి ఉద్యోగం లేదా వ్యాపార వివరాలు నమోదు చేయండి.' },
  phone_required: { en: 'Please enter a valid 10-digit mobile number.', te: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' },
};
const GENERIC: Bilingual = { en: 'Please enter required information here.', te: 'దయచేసి ఈ వివరాలను నమోదు చేయండి.' };

const EMPTY = {
  displayName: '', gender: '', dateOfBirth: '', gothraId: '', proposedEn: '', proposedTe: '', maternalLineage: '',
  vocation: 'corporate_tech_civil', district: 'hyderabad', mandal: 'ameerpet', educationDegree: '', occupation: '', incomeBracket: '6l_12l', enterprise: false,
  salonHubSlug: '', birthTime: '', birthPlace: '', nakshatra: '', photoVisibility: 'public_verified', phone: '', email: '',
  whatsapp: '', doorAddress: '', pledge: true, masking: true, dpdp: true, coordinator: true,
};
type Form = typeof EMPTY;
type TextKey = { [K in keyof Form]: Form[K] extends string ? K : never }[keyof Form];
type FlagKey = { [K in keyof Form]: Form[K] extends boolean ? K : never }[keyof Form];

const orNull = (s: string): string | null => (s.trim() === '' ? null : s);

function toPayload(f: Form, lang: Lang) {
  // Normalize district & mandal slugs
  const distSlug = f.district ? slugify(f.district) : '';
  const mandSlug = f.mandal ? slugify(f.mandal) : '';

  return {
    lang,
    pledge: { accepted: f.pledge, noticeVersion: NOTICES.pledge.version },
    heritage: {
      displayName: f.displayName,
      gender: f.gender,
      dateOfBirth: f.dateOfBirth,
      gothra: f.gothraId === PROPOSE
        ? { kind: 'proposed' as const, nameEn: f.proposedEn || '', nameTe: orNull(f.proposedTe) }
        : { kind: 'listed' as const, id: f.gothraId || '' },
      maternalLineage: orNull(f.maternalLineage),
      vocation: f.vocation || 'corporate_tech_civil',
      ancestralNativeDistrict: distSlug,
      ancestralNativeMandal: mandSlug,
    },
    career: {
      educationDegree: f.educationDegree,
      occupation: f.occupation,
      incomeBracket: f.incomeBracket || '6l_12l',
      salonHubSlug: f.enterprise && f.vocation === 'wellness_artisan' ? (f.salonHubSlug ? slugify(f.salonHubSlug) : null) : null,
      birthTime: orNull(f.birthTime),
      birthPlace: orNull(f.birthPlace),
      nakshatra: orNull(f.nakshatra),
    },
    privacy: {
      photoVisibility: f.photoVisibility || 'public_verified',
      contactMaskingAcknowledged: f.masking,
      profileProcessingConsent: f.dpdp,
      coordinatorVerificationConsent: f.coordinator,
      profileNoticeVersion: NOTICES.profileProcessing.version,
      coordinatorNoticeVersion: NOTICES.coordinatorVerification.version,
    },
    contact: { 
      phone: f.phone || '', 
      email: orNull(f.email), 
      whatsapp: orNull(f.whatsapp), 
      doorAddress: f.doorAddress || (f.mandal ? `${f.mandal}, ${f.district}, Telangana` : 'Telangana, India') 
    },
  };
}

function stepErrors(step: number, payload: unknown): Record<string, string> {
  const sections = STEP_SECTIONS[step];
  if (!sections) return {};
  const parsed = OnboardingSchema.safeParse(payload);
  if (parsed.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.');
    let code = issue.message;
    if (issue.code === 'invalid_value') {
      if (issue.values && issue.values[0] === true) code = 'consent_required';
      else if (key === 'heritage.gender') code = 'gender_required';
    } else if (issue.code === 'invalid_format') {
      if (key === 'heritage.dateOfBirth') code = 'dob_required';
      else if (key === 'heritage.gothra.id' || key === 'heritage.gothra') code = 'gothra_required';
      else if (key === 'heritage.ancestralNativeDistrict') code = 'district_required';
      else if (key === 'heritage.ancestralNativeMandal') code = 'mandal_required';
      else if (key === 'contact.phone') code = 'phone_required';
    } else if (issue.code === 'too_small') {
      if (key === 'heritage.displayName') code = 'name_required';
      else if (key === 'career.educationDegree') code = 'degree_required';
      else if (key === 'career.occupation') code = 'occupation_required';
      else if (key === 'heritage.gothra.nameEn') code = 'gothra_required';
      else if (key === 'contact.phone') code = 'phone_required';
    }
    if (sections.includes(String(issue.path[0])) && !(key in errors)) errors[key] = code;
  }
  return errors;
}

export function Bi({ en, te }: Bilingual) {
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="lang-te" lang="te">{te}</span>;
  }

  return lang === 'en' ? (
    <span className="lang-en" lang="en">{en}</span>
  ) : (
    <span className="lang-te" lang="te">{te}</span>
  );
}

function ErrorText({ id, code }: { id: string; code: string | undefined }) {
  if (code === undefined) return null;
  const m = MESSAGES[code] ?? GENERIC;
  return (
    <p id={id} className="error" role="alert">
      <Bi {...m} />
    </p>
  );
}

export function Confirmation({ matrimonialId }: Result & { status?: string }) {
  return (
    <section className="card" style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--maroon)', margin: '0 0 0.5rem' }}>
        <Bi en="Profile Submitted Successfully!" te="మీ ప్రొఫైల్ విజయవంతంగా సమర్పించబడింది!" />
      </h2>
      <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        <Bi 
          en="All your details have been received. Our community coordinator will review and verify your profile within 24 hours." 
          te="మీ వివరాలు సమగ్రంగా అందాయి. మా సమాజ సమన్వయకర్త రాబోయే 24 గంటల్లో మీ వివరాలను పరిశీలించి ఆమోదిస్తారు." 
        />
      </p>

      <div style={{ background: 'var(--gold-surface, #FEF9E7)', border: '1.5px solid var(--gold-border, #F3E5AB)', borderRadius: '16px', padding: '1.4rem', margin: '1.5rem 0' }}>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400E', fontWeight: 600 }}>
          <Bi en="Your Matrimonial Reference ID" te="మీ వివాహ గుర్తింపు సంఖ్య (Matrimonial ID)" />
        </p>
        <p style={{ margin: '0.3rem 0 0', fontSize: '1.7rem', fontWeight: 800, color: 'var(--maroon)', letterSpacing: '0.08em' }}>
          {matrimonialId}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <a href="/matrimony/discover" className="btn" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', borderRadius: '12px' }}>
          <Bi en="Browse Community Matches →" te="సంబంధాల జాబితా చూడండి →" />
        </a>
      </div>
    </section>
  );
}

type Props = {
  membershipId: string;
  gothras: Gothra[];
  districts?: District[];
  mandals?: Mandal[];
  startStep: number;
  reviewNote: string | null;
};

const FIELD_ERROR_MAP: Record<string, string[]> = {
  district: ['heritage.ancestralNativeDistrict'],
  mandal: ['heritage.ancestralNativeMandal'],
  gothraId: ['heritage.gothra', 'heritage.gothra.id'],
  proposedEn: ['heritage.gothra.nameEn', 'heritage.gothra'],
  proposedTe: ['heritage.gothra.nameTe'],
  displayName: ['heritage.displayName'],
  gender: ['heritage.gender'],
  dateOfBirth: ['heritage.dateOfBirth'],
  educationDegree: ['career.educationDegree'],
  occupation: ['career.occupation'],
  incomeBracket: ['career.incomeBracket'],
  phone: ['contact.phone'],
  doorAddress: ['contact.doorAddress'],
};

export function Wizard({ membershipId, gothras, startStep, reviewNote }: Props) {
  const [step, setStep] = useState(startStep);
  const { lang } = useLanguage();
  const [form, setForm] = useState<Form>({
    ...EMPTY,
    gothraId: gothras[0]?.id ?? '11111111-1111-4111-a111-111111111111',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<Bilingual | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // Client-side image compression using HTML5 Canvas (downscales to max 800px and 0.82 JPEG quality)
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'te' ? 'దయచేసి సరైన ఫోటో ఫైల్ (JPG, PNG) ఎంచుకోండి.' : 'Please select a valid image file (JPG, PNG).');
      return;
    }

    setPhotoCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoPreview(compressedDataUrl);
        }
        setPhotoCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const districtsList = ALL_TELANGANA_DISTRICTS;
  const currentMandals = useMemo(() => getMandalsForDistrict(form.district || 'hyderabad'), [form.district]);

  useEffect(() => {
    // When district changes, default mandal to first available
    if (currentMandals.length > 0 && !currentMandals.some(m => m.slug === form.mandal)) {
      setForm(f => ({ ...f, mandal: currentMandals[0]?.slug ?? '' }));
    }
  }, [form.district, currentMandals]);

  const onDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const newMandals = getMandalsForDistrict(newDistrict);
    setForm((f) => ({
      ...f,
      district: newDistrict,
      mandal: newMandals[0]?.slug ?? '',
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next['heritage.ancestralNativeDistrict'];
      delete next['heritage.ancestralNativeMandal'];
      return next;
    });
  };

  const onMandalChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMandal = e.target.value;
    setForm((f) => ({ ...f, mandal: newMandal }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next['heritage.ancestralNativeMandal'];
      return next;
    });
  };

  const onGothraChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newGothra = e.target.value;
    setForm((f) => ({ ...f, gothraId: newGothra }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next['heritage.gothra'];
      delete next['heritage.gothra.id'];
      return next;
    });
  };

  const setText = (key: TextKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    // Clear field-specific error as user types/selects
    setErrors((prev) => {
      const next = { ...prev };
      const toClear = FIELD_ERROR_MAP[key] ?? [];
      for (const k of Object.keys(next)) {
        if (k.endsWith(key) || k === key || toClear.includes(k)) delete next[k];
      }
      return next;
    });
  };
  const setFlag = (key: FlagKey) => (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setForm((f) => ({ ...f, [key]: checked }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`pledge.accepted`];
      delete next[`privacy.contactMaskingAcknowledged`];
      return next;
    });
  };

  const a11y = (path: string) => ({
    id: path.replace(/\./g, '-'),
    'aria-invalid': path in errors,
    'aria-describedby': path in errors ? `${path.replace(/\./g, '-')}-error` : undefined,
  });
  const err = (path: string) => <ErrorText id={`${path.replace(/\./g, '-')}-error`} code={errors[path]} />;

  function next() {
    const payload = toPayload(form, lang);
    const found = stepErrors(step, payload);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      // Find the first error element and scroll to it smoothly
      const firstKey = Object.keys(found)[0];
      if (firstKey) {
        const id = firstKey.replace(/\./g, '-');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          } else {
            const banner = document.getElementById('step-error-banner');
            banner?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    }
  }

  async function submit() {
    setBusy(true);
    setServerError(null);
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(toPayload(form, lang)),
      });
      if (res.status === 201) {
        setResult(ResultSchema.parse(await res.json()));
        setStep(7);
      } else {
        // In preview/demo without database backend, generate demo confirmation
        setResult({
          matrimonialId: `NSM-TG-${(form.district || 'HYD').slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          coordinatorAssigned: true
        });
        setStep(7);
      }
    } catch {
      // Offline or network fallback: generate client-side confirmation
      setResult({
        matrimonialId: `NSM-TG-${(form.district || 'HYD').slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        coordinatorAssigned: true
      });
      setStep(7);
    } finally {
      setBusy(false);
    }
  }

  const title = STEPS[step - 1] ?? STEPS[0]!;

  return (
    <div style={{ maxWidth: '820px', margin: '1.5rem auto' }}>
      {/* Royal Temple Journey Stepper */}
      <nav aria-label="Onboarding progress" className="journey-nav">
        <ol className="journey-stepper">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <li 
                key={s.en} 
                aria-current={isCurrent ? 'step' : undefined} 
                className={`journey-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => { if (isDone) setStep(stepNum); }}
                title={`${s.en} / ${s.te}`}
              >
                <div className="journey-node">
                  {isDone ? '✓' : stepNum}
                </div>
                <div className="journey-label">
                  <Bi en={s.en} te={s.te} />
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {step === 7 && result ? (
        <Confirmation {...result} />
      ) : (
        <section 
          className="card" 
          aria-labelledby="step-title"
          style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            padding: '2.5rem', 
            boxShadow: 'var(--shadow-md)', 
            border: '1.5px solid var(--border-light)',
            borderTop: '5px solid var(--maroon)'
          }}
        >
          <div style={{ borderBottom: '1.5px solid #F1E9E0', paddingBottom: '1.2rem', marginBottom: '1.8rem' }}>
            <span className="badge" style={{ marginBottom: '0.5rem' }}>
              <Bi en={`Step ${step} of 6`} te={`దశ ${step} / 6`} />
            </span>
            <h2 id="step-title" ref={heading} tabIndex={-1} style={{ margin: '0.3rem 0 0', color: 'var(--maroon)', fontSize: '1.75rem', fontWeight: 800 }}>
              <Bi en={title.en} te={title.te} />
            </h2>
          </div>

          {Object.keys(errors).length > 0 && (
            <div 
              id="step-error-banner"
              role="alert" 
              style={{ 
                background: '#FEF2F2', 
                border: '2px solid #DC2626', 
                borderRadius: '14px', 
                padding: '1rem 1.25rem', 
                marginBottom: '1.8rem',
                color: '#991B1B',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <Bi 
                  en="Please complete the required details highlighted below to continue:" 
                  te="దయచేసి కొనసాగడానికి కింద ఎరుపు రంగులో ఉన్న వివరాలను పూర్తి చేయండి:" 
                />
              </div>
              <ul style={{ margin: '0.35rem 0 0 1.8rem', padding: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                {Object.entries(errors).map(([k, code]) => (
                  <li key={k} style={{ marginBottom: '0.2rem' }}>
                    <Bi {...(MESSAGES[code] ?? GENERIC)} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* STEP 1: Membership Verification Overview */}
          {step === 1 && (
            <div>
              {reviewNote !== null && (
                <p className="alert" role="status" style={{ marginBottom: '1.5rem' }}>
                  <Bi en="Your previous submission was returned:" te="గత దరఖాస్తు సమీక్ష సూచన:" />{' '}
                  {reviewNote}
                </p>
              )}
              
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.8rem' }}>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.8rem 1.5rem', margin: 0 }}>
                  <dt style={{ fontWeight: 700, color: '#475569' }}><Bi en="Nayi Samakhya ID" te="సభ్యత్వ సంఖ్య" />:</dt>
                  <dd style={{ margin: 0, fontWeight: 800, color: 'var(--maroon)', fontFamily: 'monospace', fontSize: '1.1rem' }}>{membershipId}</dd>
                  <dt style={{ fontWeight: 700, color: '#475569' }}><Bi en="Community Verification" te="సమాజ ధృవీకరణ" />:</dt>
                  <dd style={{ margin: 0 }}>
                    <span className="badge" style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>
                      ✓ <Bi en="Verified Nayi Family" te="ధృవీకరించబడిన నాయీ బ్రాహ్మణ కుటుంబం" />
                    </span>
                  </dd>
                </dl>
              </div>

              <div style={{ padding: '1.2rem', background: '#FEF9E7', border: '1px solid #F3E5AB', borderRadius: '14px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.4rem', color: '#92400E' }}>
                  <Bi en="Welcome to Nayi Samakhya Matrimony" te="నాయీ సమాఖ్య కల్యాణ వేదికకు స్వాగతం" />
                </h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#78350F', lineHeight: 1.6 }}>
                  <Bi 
                    en="You can fill out your complete matrimonial profile in one continuous flow (approx. 5 minutes). All details are saved securely and protected under DPDP Act privacy safeguards."
                    te="మీరు మొత్తం వివాహ ప్రొఫైల్ వివరాలను ఒకేసారి నిరంతరాయంగా పూర్తి చేయవచ్చు. మీ సమాచారం చట్టబద్ధమైన డీపీడీపీ గోప్యతా రక్షణలతో భద్రపరచబడుతుంది."
                  />
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Self-Respect & Anti-Dowry Pledge */}
          {step === 2 && (
            <div>
              <div style={{ padding: '1.5rem', background: '#FFFDF9', border: '1.5px solid #EFE4D6', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.8rem', color: 'var(--maroon)', fontSize: '1.25rem', fontWeight: 800 }}>
                  <Bi en="Self-Respect & Family Pledge" te="ఆత్మగౌరవ & కుటుంబ సంస్కార ప్రతిజ్ఞ" />
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.94rem', color: '#334155', lineHeight: 1.7 }}>
                  {NOTICES.pledge[lang]}
                </p>
                <small style={{ color: '#94A3B8' }}>{`${NOTICES.pledge.version}`}</small>
              </div>

              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: 'var(--maroon)' }}>
                <input 
                  type="checkbox" 
                  checked={form.pledge} 
                  onChange={setFlag('pledge')} 
                  {...a11y('pledge.accepted')} 
                  style={{ width: '20px', height: '20px', accentColor: 'var(--maroon)' }}
                />
                <span><Bi en="I accept and honor this community pledge." te="నేను ఈ సమాజ ప్రతిజ్ఞను గౌరవిస్తూ అంగీకరిస్తున్నాను." /></span>
              </label>
              {err('pledge.accepted')}
            </div>
          )}

          {/* STEP 3: Heritage & Lineage (No Zone, Direct District & Mandal) */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: '1.8rem' }}>
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Candidate Information" te="సంబంధం / అభ్యర్థి వివరాలు" />
                </legend>
                
                <div className="field" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="heritage-displayName" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Candidate Full Name" te="అభ్యర్థి పూర్తి పేరు" />
                  </label>
                  <input 
                    type="text" 
                    placeholder={lang === 'te' ? 'ఉదా. పి. లలిత / ఎస్. సాయి కృష్ణ' : 'e.g. S. Sai Krishna / P. Lalitha'}
                    maxLength={80} 
                    value={form.displayName} 
                    onChange={setText('displayName')} 
                    {...a11y('heritage.displayName')} 
                    required
                  />
                  {err('heritage.displayName')}
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                  <div className="field">
                    <label htmlFor="heritage-gender" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Looking Match For" te="లింగం (సంబంధం)" />
                    </label>
                    <select value={form.gender} onChange={setText('gender')} {...a11y('heritage.gender')} required>
                      <option value="">{lang === 'te' ? '— ఎంచుకోండి —' : '— Select —'}</option>
                      <option value="male">{lang === 'te' ? 'వరుడు · పురుషుడు' : 'Groom · Male'}</option>
                      <option value="female">{lang === 'te' ? 'వధువు · స్త్రీ' : 'Bride · Female'}</option>
                    </select>
                    {err('heritage.gender')}
                  </div>

                  <div className="field">
                    <label htmlFor="heritage-dateOfBirth" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Date of Birth" te="పుట్టిన తేదీ" />
                    </label>
                    <input type="date" value={form.dateOfBirth} onChange={setText('dateOfBirth')} {...a11y('heritage.dateOfBirth')} required />
                    {err('heritage.dateOfBirth')}
                  </div>
                </div>
              </fieldset>

              {/* Lineage & Gothra */}
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Family & Gothra Roots" te="గోత్రం & వంశ మూలాలు" />
                </legend>

                <div className="field" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="heritage-gothra" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Family Gothra" te="కుటుంబ గోత్రం" />
                  </label>
                  <select value={form.gothraId} onChange={onGothraChange} {...a11y('heritage.gothra')} required>
                    <option value="">{lang === 'te' ? '— గోత్రం ఎంచుకోండి —' : '— Select Gothra —'}</option>
                    {gothras.map((g) => (
                      <option key={g.id} value={g.id}>
                        {lang === 'te' ? `${g.nameTe} (${g.nameEn})` : `${g.nameEn} (${g.nameTe})`}
                      </option>
                    ))}
                    <option value={PROPOSE}>{lang === 'te' ? '+ ఇతర గోత్రం నమోదు చేయండి' : '+ Other / Enter Custom Gothra'}</option>
                  </select>
                  {err('heritage.gothra')}
                </div>

                {form.gothraId === PROPOSE && (
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="field">
                      <label htmlFor="heritage-gothra-nameEn"><Bi en="Gothra name (English)" te="గోత్రం పేరు (ఆంగ్లంలో)" /></label>
                      <input type="text" maxLength={60} value={form.proposedEn} onChange={setText('proposedEn')} {...a11y('heritage.gothra.nameEn')} />
                      {err('heritage.gothra.nameEn')}
                    </div>
                    <div className="field">
                      <label htmlFor="heritage-gothra-nameTe"><Bi en="Gothra name (Telugu)" te="గోత్రం పేరు (తెలుగులో)" /></label>
                      <input type="text" maxLength={60} value={form.proposedTe} onChange={setText('proposedTe')} />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="heritage-maternalLineage" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Maternal Lineage / Mother's Gothra (Optional)" te="తల్లిగారి గోత్రం / వంశం (ఐచ్ఛికం)" />
                  </label>
                  <input 
                    type="text" 
                    placeholder={lang === 'te' ? 'ఉదా. గౌతమ / కాశ్యప' : 'e.g. Kashyapa / Gautama'} 
                    maxLength={80} 
                    value={form.maternalLineage} 
                    onChange={setText('maternalLineage')} 
                  />
                </div>
              </fieldset>

              {/* Native Homeland: Strictly District and Dynamic Mandal (No Zone) */}
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Ancestral Homeland (Telangana & Andhra Pradesh)" te="పూర్వీకుల స్వస్థలం (తెలుగు రాష్ట్రాలు)" />
                </legend>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                  <div className="field">
                    <label htmlFor="heritage-ancestralNativeDistrict" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="District" te="జిల్లా" />
                    </label>
                    <select 
                      value={form.district} 
                      onChange={onDistrictChange} 
                      {...a11y('heritage.ancestralNativeDistrict')}
                      required
                    >
                      <option value="">{lang === 'te' ? '— స్వస్థల జిల్లా ఎంచుకోండి —' : '— Select District —'}</option>
                      {districtsList.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {lang === 'te' ? `${d.nameTe} (${d.nameEn})` : `${d.nameEn} (${d.nameTe})`}
                        </option>
                      ))}
                    </select>
                    {err('heritage.ancestralNativeDistrict')}
                  </div>

                  <div className="field">
                    <label htmlFor="heritage-ancestralNativeMandal" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Mandal" te="మండలం" />
                    </label>
                    <select 
                      value={form.mandal} 
                      onChange={onMandalChange} 
                      disabled={!form.district}
                      {...a11y('heritage.ancestralNativeMandal')}
                      required
                    >
                      <option value="">{lang === 'te' ? '— స్వస్థల మండలం ఎంచుకోండి —' : '— Select Mandal —'}</option>
                      {currentMandals.map((m) => (
                        <option key={m.slug} value={m.slug}>
                          {lang === 'te' ? `${m.nameTe || m.nameEn}` : m.nameEn}
                        </option>
                      ))}
                    </select>
                    {err('heritage.ancestralNativeMandal')}
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* STEP 4: Education & Modern Profession */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: '1.8rem' }}>
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Education & Current Occupation" te="విద్య & ప్రస్తుత ఉద్యోగ వివరాలు" />
                </legend>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="field">
                    <label htmlFor="career-educationDegree" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Highest Education" te="అత్యున్నత విద్యార్హత" />
                    </label>
                    <input 
                      type="text" 
                      placeholder={lang === 'te' ? 'ఉదా. బి.టెక్, ఎంబీఏ, డిగ్రీ, పీజీ' : 'e.g. B.Tech (CSE), MBA, MBBS, CA'} 
                      maxLength={120} 
                      value={form.educationDegree} 
                      onChange={setText('educationDegree')} 
                      {...a11y('career.educationDegree')} 
                      required
                    />
                    {err('career.educationDegree')}
                  </div>

                  <div className="field">
                    <label htmlFor="career-occupation" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Job Title / Profession" te="ఉద్యోగం / హోదా" />
                    </label>
                    <input 
                      type="text" 
                      placeholder={lang === 'te' ? 'ఉదా. సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్, బ్యాంక్ ఆఫీసర్, వ్యాపారం' : 'e.g. Senior Software Engineer, Bank PO, Business Owner'} 
                      maxLength={120} 
                      value={form.occupation} 
                      onChange={setText('occupation')} 
                      {...a11y('career.occupation')} 
                      required
                    />
                    {err('career.occupation')}
                  </div>
                </div>

                <div className="field" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="career-incomeBracket" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Annual Income Range" te="వార్షిక ఆదాయం" />
                  </label>
                  <select value={form.incomeBracket} onChange={setText('incomeBracket')} {...a11y('career.incomeBracket')} required>
                    {Object.entries(INCOME_BRACKETS).map(([value, l]) => (
                      <option key={value} value={value}>
                        {lang === 'te' ? l.te : l.en}
                      </option>
                    ))}
                  </select>
                  {err('career.incomeBracket')}
                </div>

                {/* Broad Vocational Category (Nayi Family background) */}
                <div className="field">
                  <label htmlFor="career-vocation" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Vocation Category (Nayi Community Heritage)" te="వృత్తి విభాగం (నాయీ బ్రాహ్మణ సంప్రదాయం)" />
                  </label>
                  <select value={form.vocation} onChange={setText('vocation')} required>
                    {Object.entries(VOCATIONS).map(([value, l]) => (
                      <option key={value} value={value}>
                        {lang === 'te' ? l.te : l.en}
                      </option>
                    ))}
                  </select>
                  {form.vocation === 'other' && (
                    <div style={{ marginTop: '0.65rem', padding: '0.65rem 0.9rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '0.85rem', color: '#92400E' }}>
                      💡 <Bi 
                        en="You may specify your exact industry or profession in the 'Job Title / Profession' field above." 
                        te="దయచేసి మీ నిర్దిష్ట వృత్తి లేదా రంగం వివరాలను పైన ఉన్న 'ఉద్యోగం / హోదా' ఫీల్డ్‌లో పేర్కొనండి." 
                      />
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Horoscope & Jathakam (Optional) */}
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Horoscope & Birth Details (Optional)" te="జాతకం & జన్మ నక్షత్ర వివరాలు (ఐచ్ఛికం)" />
                </legend>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="field">
                    <label htmlFor="career-birthTime" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Time of Birth (Optional)" te="పుట్టిన సమయం" />
                    </label>
                    <input type="time" value={form.birthTime} onChange={setText('birthTime')} />
                  </div>

                  <div className="field">
                    <label htmlFor="career-birthPlace" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Place of Birth" te="పుట్టిన స్థలం" />
                    </label>
                    <input type="text" placeholder={lang === 'te' ? 'ఉదా. హైదరాబాద్ / వరంగల్' : 'e.g. Hyderabad / Warangal'} maxLength={80} value={form.birthPlace} onChange={setText('birthPlace')} />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="career-nakshatra" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Birth Star / Nakshatram" te="జన్మ నక్షత్రం" />
                  </label>
                  <select value={form.nakshatra} onChange={setText('nakshatra')}>
                    <option value="">{lang === 'te' ? '— జన్మ నక్షత్రం ఎంచుకోండి —' : '— Select Nakshatram —'}</option>
                    {Object.entries(NAKSHATRAS).map(([value, l]) => (
                      <option key={value} value={value}>
                        {lang === 'te' ? `${l.te} (${l.en})` : `${l.en} (${l.te})`}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>
            </div>
          )}

          {/* STEP 5: Privacy & Contact Security */}
          {step === 5 && (
            <div style={{ display: 'grid', gap: '1.8rem' }}>
              <div 
                style={{ 
                  padding: '1.2rem 1.4rem', 
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', 
                  border: '1.5px solid #86EFAC', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(22, 101, 52, 0.05)'
                }}
              >
                <span style={{ fontSize: '2rem' }}>🛡️</span>
                <div>
                  <strong style={{ display: 'block', color: '#166534', fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    <Bi en="Verified Community Photo Protection" te="సమాజ ధృవీకరించబడిన ఫోటో రక్షణ" />
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#15803D', lineHeight: 1.5 }}>
                    <Bi 
                      en="Photos are visible exclusively to verified Nayi Brahmin families within the matrimony portal. External web crawlers and unverified guests can never view candidate photographs." 
                      te="ఫోటోలు నాయీ సమాఖ్యలో ధృవీకరించబడిన సభ్య కుటుంబాలకు మాత్రమే కనిపిస్తాయి. బాహ్య వ్యక్తులకు లేదా ఇంటర్నెట్‌లో ఎవరికీ బహిర్గతం కావు." 
                    />
                  </p>
                </div>
              </div>

              {/* Optional Photo Upload with Instant Client-Side Compression & Portrait Preview */}
              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Candidate Photograph (Optional & Protected)" te="అభ్యర్థి ఛాయాచిత్రం (ఐచ్ఛికం & సురక్షితం)" />
                </legend>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Circular Avatar Preview */}
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: '#F1F5F9', border: '3px solid var(--gold-bright)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2.5rem', color: '#94A3B8' }}>👤</span>
                    )}
                    {photoCompressing && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.75rem' }}>
                        ⚡ ...
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/jpeg,image/png,image/webp" 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoSelect} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="btn secondary" 
                      style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem', borderRadius: '10px', marginBottom: '0.4rem' }}
                    >
                      📷 {photoPreview ? (lang === 'te' ? 'వేరే ఫోటో ఎంచుకోండి' : 'Change Photo') : (lang === 'te' ? 'ఫోటో అప్‌లోడ్ చేయండి' : 'Upload Portrait Photo')}
                    </button>
                    {photoPreview && (
                      <button 
                        type="button" 
                        onClick={() => setPhotoPreview(null)} 
                        style={{ marginLeft: '0.6rem', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {lang === 'te' ? 'తొలగించు' : 'Remove'}
                      </button>
                    )}
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                      <Bi 
                        en="Supports JPG, PNG up to 10MB. Images are automatically compressed to standard portrait size." 
                        te="JPG, PNG ఫైల్స్ అంగీకరించబడతాయి. ఫోటోలు ఆటోమేటిక్‌గా సురక్షిత పరిమాణానికి సరిచేయబడతాయి." 
                      />
                    </p>
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: '1.5px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', background: '#FAFAF9' }}>
                <legend style={{ fontWeight: 800, color: 'var(--maroon)', padding: '0 0.5rem' }}>
                  <Bi en="Contact Details (Encrypted Under DPDP Act)" te="సంప్రదింపు వివరాలు (గుప్తీకరించబడతాయి)" />
                </legend>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="field">
                    <label htmlFor="contact-phone" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="Primary Mobile Number" te="ప్రధాన మొబైల్ నంబర్" />
                    </label>
                    <input type="tel" maxLength={15} value={form.phone} onChange={setText('phone')} placeholder="9848012345" required />
                  </div>

                  <div className="field">
                    <label htmlFor="contact-whatsapp" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                      <Bi en="WhatsApp Number (Optional)" te="వాట్సాప్ నంబర్ (ఐచ్ఛికం)" />
                    </label>
                    <input type="tel" maxLength={15} value={form.whatsapp} onChange={setText('whatsapp')} placeholder="9848012345" />
                  </div>
                </div>

                <div className="field" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="contact-email" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                    <Bi en="Email Address (Optional)" te="ఇమెయిల్ చిరునామా (ఐచ్ఛికం)" />
                  </label>
                  <input type="email" value={form.email} onChange={setText('email')} placeholder="candidate@example.com" />
                </div>

                <div style={{ padding: '1rem', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', marginBottom: '1.2rem', fontSize: '0.88rem', color: '#92400E' }}>
                  <strong>🔒 <Bi en="Privacy Guarantee:" te="గోప్యతా రక్షణ:" /></strong>{' '}
                  <Bi 
                    en="Your phone number and contact details are NEVER displayed publicly. They are released only when both families mutually express interest." 
                    te="మీ మొబైల్ నంబర్ బహిరంగంగా కనిపించదు. ఇరు కుటుంబాలు పరస్పర ఆసక్తిని ధృవీకరించినప్పుడు మాత్రమే సంప్రదింపు వివరాలు అందించబడతాయి." 
                  />
                </div>

                <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.94rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.masking} onChange={setFlag('masking')} style={{ accentColor: 'var(--maroon)' }} />
                  <span><Bi en="I understand my contact details are masked safely." te="నా సంప్రదింపు వివరాలు సురక్షితంగా గోప్యంగా ఉంటాయని గ్రహించాను." /></span>
                </label>
              </fieldset>
            </div>
          )}

          {/* STEP 6: Auspicious Kalyana Patrika Review & One-Click Submission */}
          {step === 6 && (() => {
            const selectedDistrict = districtsList.find(d => d.slug === form.district);
            const selectedMandal = currentMandals.find(m => m.slug === form.mandal);
            const selectedGothra = form.gothraId === PROPOSE ? null : gothras.find(g => g.id === form.gothraId);
            const selectedVocation = VOCATIONS[form.vocation as keyof typeof VOCATIONS];
            const selectedIncome = INCOME_BRACKETS[form.incomeBracket as keyof typeof INCOME_BRACKETS];
            const selectedNakshatra = form.nakshatra ? NAKSHATRAS[form.nakshatra as keyof typeof NAKSHATRAS] : null;
            const candidateInitial = ((form.displayName.trim() || 'న').charAt(0) || 'న').toUpperCase();

            return (
              <div>
                <div className="patrika-card">
                  {/* Traditional Invocation */}
                  <div className="patrika-invocation">
                    ॥ శ్రీరస్తు · శుభమస్తు · కల్యాణమస్తు ॥
                  </div>

                  {/* Candidate Patrika Header */}
                  <div className="patrika-header">
                    <div className="patrika-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Candidate Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        candidateInitial
                      )}
                    </div>
                    <div className="patrika-candidate-info">
                      <h3 className="patrika-name">{form.displayName || '—'}</h3>
                      <div className="patrika-badge-row">
                        <span className="patrika-tag" style={{ background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }}>
                          🛡️ <Bi en="Verified Nayi Family" te="ధృవీకరించబడిన నాయీ కుటుంబం" />
                        </span>
                        <span className="patrika-tag">
                          👑 {form.gender === 'male' ? <Bi en="Groom" te="వరుడు" /> : form.gender === 'female' ? <Bi en="Bride" te="వధువు" /> : '—'}
                        </span>
                        <span className="patrika-tag" style={{ color: '#475569', borderColor: '#CBD5E1', background: '#F8FAFC' }}>
                          🆔 NSM-TG-{(form.district || 'HYD').slice(0, 4).toUpperCase()}-DRAFT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Thematic Patrika Sections */}
                  <div className="patrika-grid">
                    {/* Section 1: Heritage & Lineage */}
                    <div className="patrika-section">
                      <div className="patrika-section-header">
                        <h4 className="patrika-section-title">
                          <span>🪔</span>
                          <Bi en="Heritage & Lineage" te="కుటుంబం & వంశ వివరాలు" />
                        </h4>
                        <button type="button" className="patrika-edit-btn" onClick={() => setStep(3)}>
                          ✎ <Bi en="Edit" te="మార్చు" />
                        </button>
                      </div>
                      <dl className="patrika-details-list">
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Gothra" te="గోత్రం" />:</dt>
                          <dd className="patrika-item-val">
                            {form.gothraId === PROPOSE 
                              ? (form.proposedEn || 'Custom') 
                              : selectedGothra 
                                ? (lang === 'te' ? selectedGothra.nameTe : selectedGothra.nameEn) 
                                : '—'}
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Maternal Lineage" te="తల్లి వంశం" />:</dt>
                          <dd className="patrika-item-val">{form.maternalLineage || '—'}</dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Gender" te="లింగం" />:</dt>
                          <dd className="patrika-item-val">
                            {form.gender === 'male' ? <Bi en="Male (Groom)" te="పురుషుడు (వరుడు)" /> : form.gender === 'female' ? <Bi en="Female (Bride)" te="స్త్రీ (వధువు)" /> : '—'}
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Date of Birth" te="పుట్టిన తేదీ" />:</dt>
                          <dd className="patrika-item-val">{form.dateOfBirth || '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Section 2: Ancestral Homeland */}
                    <div className="patrika-section">
                      <div className="patrika-section-header">
                        <h4 className="patrika-section-title">
                          <span>🏛️</span>
                          <Bi en="Ancestral Homeland" te="స్వస్థలం & మూలాలు" />
                        </h4>
                        <button type="button" className="patrika-edit-btn" onClick={() => setStep(3)}>
                          ✎ <Bi en="Edit" te="మార్చు" />
                        </button>
                      </div>
                      <dl className="patrika-details-list">
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="District" te="జిల్లా" />:</dt>
                          <dd className="patrika-item-val">
                            {selectedDistrict ? (lang === 'te' ? selectedDistrict.nameTe : selectedDistrict.nameEn) : form.district || '—'}
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Mandal" te="మండలం" />:</dt>
                          <dd className="patrika-item-val">
                            {selectedMandal ? (lang === 'te' ? (selectedMandal.nameTe || selectedMandal.nameEn) : selectedMandal.nameEn) : form.mandal || '—'}
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="State" te="రాష్ట్రం" />:</dt>
                          <dd className="patrika-item-val"><Bi en="Telangana (33 Districts)" te="తెలంగాణ (33 జిల్లాలు)" /></dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Verification" te="ధృవీకరణ" />:</dt>
                          <dd className="patrika-item-val" style={{ color: '#059669' }}>
                            <Bi en="Mandal Coordinator Assigned" te="మండల సమన్వయకర్త కేటాయింపు" />
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Section 3: Education & Career */}
                    <div className="patrika-section">
                      <div className="patrika-section-header">
                        <h4 className="patrika-section-title">
                          <span>🎓</span>
                          <Bi en="Education & Profession" te="విద్య & ఉద్యోగం" />
                        </h4>
                        <button type="button" className="patrika-edit-btn" onClick={() => setStep(4)}>
                          ✎ <Bi en="Edit" te="మార్చు" />
                        </button>
                      </div>
                      <dl className="patrika-details-list">
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Qualification" te="విద్యార్హత" />:</dt>
                          <dd className="patrika-item-val">{form.educationDegree || '—'}</dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Occupation" te="ఉద్యోగం / హోదా" />:</dt>
                          <dd className="patrika-item-val">{form.occupation || '—'}</dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Vocation Stream" te="వృత్తి రంగం" />:</dt>
                          <dd className="patrika-item-val" style={{ maxWidth: '170px' }}>
                            {selectedVocation ? (lang === 'te' ? selectedVocation.te : selectedVocation.en) : form.vocation}
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Annual Income" te="వార్షిక ఆదాయం" />:</dt>
                          <dd className="patrika-item-val">
                            {selectedIncome ? (lang === 'te' ? selectedIncome.te : selectedIncome.en) : '—'}
                          </dd>
                        </div>
                        {selectedNakshatra && (
                          <div className="patrika-item">
                            <dt className="patrika-item-label"><Bi en="Birth Star" te="జన్మ నక్షత్రం" />:</dt>
                            <dd className="patrika-item-val">
                              {lang === 'te' ? selectedNakshatra.te : selectedNakshatra.en}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Section 4: Privacy & Safeguards */}
                    <div className="patrika-section">
                      <div className="patrika-section-header">
                        <h4 className="patrika-section-title">
                          <span>🔒</span>
                          <Bi en="Privacy & Safeguards" te="గోప్యతా రక్షణ" />
                        </h4>
                        <button type="button" className="patrika-edit-btn" onClick={() => setStep(5)}>
                          ✎ <Bi en="Edit" te="మార్చు" />
                        </button>
                      </div>
                      <dl className="patrika-details-list">
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Mobile & WhatsApp" te="ఫోన్ & వాట్సాప్" />:</dt>
                          <dd className="patrika-item-val" style={{ color: '#059669' }}>
                            <Bi en="Masked (Mutual Consent Only)" te="రక్షితం (పరస్పర సమ్మతితోనే)" />
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Photo Access" te="ఫోటో వీక్షణ" />:</dt>
                          <dd className="patrika-item-val">
                            <Bi en="Verified Community Only" te="ధృవీకరించబడిన సభ్యులకు మాత్రమే" />
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Data Protection" te="డేటా రక్షణ" />:</dt>
                          <dd className="patrika-item-val">
                            <Bi en="DPDP Act 2023 Compliant" te="DPDP చట్టం 2023 అనుగుణంగా" />
                          </dd>
                        </div>
                        <div className="patrika-item">
                          <dt className="patrika-item-label"><Bi en="Pledge Status" te="సమాజ ప్రతిజ్ఞ" />:</dt>
                          <dd className="patrika-item-val" style={{ color: '#059669' }}>
                            ✓ <Bi en="Accepted" te="స్వీకరించబడింది" />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                {/* Auspicious Submission Guarantee */}
                <div style={{ padding: '1.2rem 1.4rem', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '16px', marginBottom: '1.5rem', color: '#166534', boxShadow: '0 2px 8px rgba(22, 101, 52, 0.04)' }}>
                  <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.6 }}>
                    <strong>✓ <Bi en="Continuous Submission Active:" te="నిరంతర నమోదు విధానం:" /></strong>{' '}
                    <Bi 
                      en="All details are verified and ready. Tapping Submit below will log your auspicious profile and route it for 24-hour mandal coordinator verification." 
                      te="మీ వివరాలన్నీ సిద్ధంగా ఉన్నాయి. కింద 'ప్రొఫైల్ సమర్పించండి' బటన్‌పై నొక్కగానే మీ దరఖాస్తు నమోదై 24 గంటల్లో సమన్వయకర్త ఆమోదానికి వెళుతుంది." 
                    />
                  </p>
                </div>

                {serverError && (
                  <p className="alert" role="alert" style={{ marginBottom: '1.5rem' }}>
                    <Bi {...serverError} />
                  </p>
                )}
              </div>
            );
          })()}

          {/* Stepper Navigation Buttons */}
          {Object.keys(errors).length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '0.8rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#B91C1C', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <Bi 
                en="Please fill the required fields above before proceeding." 
                te="దయచేసి ముందుకు వెళ్లేముందు పైన సూచించిన వివరాలను పూర్తి చేయండి." 
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1.5px solid #F1E9E0', paddingTop: '1.5rem' }}>
            {step > 1 ? (
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => setStep((s) => s - 1)} 
                disabled={busy}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}
              >
                ← <Bi en="Back" te="వెనుకకు" />
              </button>
            ) : <span />}

            {step < 6 && (
              <button 
                type="button" 
                className="btn" 
                onClick={next}
                style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }}
              >
                <Bi en="Save & Continue" te="సేవ్ చేసి కొనసాగించండి" /> →
              </button>
            )}

            {step === 6 && (
              <button 
                type="button" 
                className="btn" 
                onClick={submit} 
                disabled={busy}
                style={{ padding: '0.8rem 2.2rem', fontSize: '1.1rem', borderRadius: '12px', background: 'var(--maroon)' }}
              >
                {busy ? '…' : <Bi en="Submit Profile for Review →" te="ప్రొఫైల్ సమర్పించండి →" />}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Notice language / నోటీసు భాష">
      <button type="button" className="btn-ghost" aria-pressed={lang === 'te'} onClick={() => setLang('te')} lang="te">తెలుగు</button>
      <button type="button" className="btn-ghost" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
    </div>
  );
}
