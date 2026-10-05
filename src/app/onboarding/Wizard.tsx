'use client';

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { z } from 'zod';
import {
  CONTACT_MASKING,
  INCOME_BRACKETS,
  NAKSHATRAS,
  NOTICES,
  OnboardingSchema,
  PHOTO_VISIBILITY,
  VOCATIONS,
  type Bilingual,
  type Lang,
} from '../../lib/onboarding.ts';

type Gothra = { id: string; nameEn: string; nameTe: string };
type District = { slug: string; nameEn: string; nameTe: string };
type Mandal = { district: string; slug: string; nameEn: string };
type Result = { matrimonialId: string; coordinatorAssigned: boolean };

const ResultSchema = z.object({ matrimonialId: z.string(), coordinatorAssigned: z.boolean() });
const SUBMIT_URL = '/matrimony/api/onboarding/submit';
const PROPOSE = '__propose__';

const STEPS: Bilingual[] = [
  { en: 'Membership', te: 'సభ్యత్వం' },
  { en: 'Pledge', te: 'ప్రతిజ్ఞ' },
  { en: 'Heritage', te: 'వారసత్వం' },
  { en: 'Career', te: 'వృత్తి' },
  { en: 'Privacy', te: 'గోప్యత' },
  { en: 'Coordinator', te: 'సమన్వయకర్త' },
  { en: 'Confirmation', te: 'నిర్ధారణ' },
];
// Which payload sections each step validates before moving on.
const STEP_SECTIONS: Record<number, string[]> = { 2: ['pledge'], 3: ['heritage'], 4: ['career'], 5: ['privacy', 'contact'] };

const MESSAGES: Record<string, Bilingual> = {
  consent_required: { en: 'Please tick this box to continue.', te: 'కొనసాగడానికి దయచేసి ఈ పెట్టెను టిక్ చేయండి.' },
  below_legal_marriage_age: { en: 'Minimum age is 21 for men and 18 for women.', te: 'కనీస వయస్సు పురుషులకు 21, స్త్రీలకు 18.' },
  enterprise_badge_needs_wellness_artisan: { en: 'The enterprise badge is for salon founders.', te: 'ఎంటర్‌ప్రైజ్ బ్యాడ్జ్ సెలూన్ వ్యవస్థాపకులకు మాత్రమే.' },
};
const GENERIC: Bilingual = { en: 'Please check this field.', te: 'దయచేసి ఈ వివరాన్ని సరిచూడండి.' };

const EMPTY = {
  displayName: '', gender: '', dateOfBirth: '', gothraId: '', proposedEn: '', proposedTe: '', maternalLineage: '',
  vocation: '', district: '', mandal: '', educationDegree: '', occupation: '', incomeBracket: '', enterprise: false,
  salonHubSlug: '', birthTime: '', birthPlace: '', nakshatra: '', photoVisibility: 'on_request', phone: '', email: '',
  whatsapp: '', doorAddress: '', pledge: false, masking: false, dpdp: false, coordinator: false,
};
type Form = typeof EMPTY;
type TextKey = { [K in keyof Form]: Form[K] extends string ? K : never }[keyof Form];
type FlagKey = { [K in keyof Form]: Form[K] extends boolean ? K : never }[keyof Form];

const orNull = (s: string): string | null => (s.trim() === '' ? null : s);

function toPayload(f: Form, lang: Lang) {
  return {
    lang,
    pledge: { accepted: f.pledge, noticeVersion: NOTICES.pledge.version },
    heritage: {
      displayName: f.displayName,
      gender: f.gender,
      dateOfBirth: f.dateOfBirth,
      gothra: f.gothraId === PROPOSE
        ? { kind: 'proposed', nameEn: f.proposedEn, nameTe: orNull(f.proposedTe) }
        : { kind: 'listed', id: f.gothraId },
      maternalLineage: orNull(f.maternalLineage),
      vocation: f.vocation,
      ancestralNativeDistrict: f.district,
      ancestralNativeMandal: f.mandal,
    },
    career: {
      educationDegree: f.educationDegree,
      occupation: f.occupation,
      incomeBracket: f.incomeBracket,
      salonHubSlug: f.enterprise && f.vocation === 'wellness_artisan' ? f.salonHubSlug : null,
      birthTime: orNull(f.birthTime),
      birthPlace: orNull(f.birthPlace),
      nakshatra: orNull(f.nakshatra),
    },
    privacy: {
      photoVisibility: f.photoVisibility,
      contactMaskingAcknowledged: f.masking,
      profileProcessingConsent: f.dpdp,
      coordinatorVerificationConsent: f.coordinator,
      profileNoticeVersion: NOTICES.profileProcessing.version,
      coordinatorNoticeVersion: NOTICES.coordinatorVerification.version,
    },
    contact: { phone: f.phone, email: orNull(f.email), whatsapp: orNull(f.whatsapp), doorAddress: f.doorAddress },
  };
}

function stepErrors(step: number, payload: unknown): Record<string, string> {
  const sections = STEP_SECTIONS[step];
  const parsed = OnboardingSchema.safeParse(payload);
  if (!sections || parsed.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.');
    const code = issue.code === 'invalid_value' && issue.values[0] === true ? 'consent_required' : issue.message;
    if (sections.includes(String(issue.path[0])) && !(key in errors)) errors[key] = code;
  }
  return errors;
}

export function Bi({ en, te }: Bilingual) {
  return (
    <>
      <span>{en}</span> <span lang="te" className="te">{te}</span>
    </>
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

export function Confirmation({ matrimonialId, coordinatorAssigned, status }: Result & { status: string }) {
  return (
    <section className="card" aria-labelledby="confirm-title">
      <h2 id="confirm-title">
        Your profile is with the community <span className="te" lang="te">మీ ప్రొఫైల్ సమాజ సమీక్షలో ఉంది</span>
      </h2>
      <p className="label"><Bi en="Matrimonial ID" te="వివాహ గుర్తింపు సంఖ్య" /></p>
      <p className="matrimonial-id">{matrimonialId}</p>
      <dl className="summary">
        <dt><Bi en="Status" te="స్థితి" /></dt>
        <dd><span className="badge">{status === 'pending_mandal_review' ? 'Pending_Mandal_Review' : status}</span></dd>
        <dt><Bi en="Reviewer" te="సమీక్షకులు" /></dt>
        <dd>
          {coordinatorAssigned
            ? <Bi en="Your ancestral Mandal Coordinator" te="మీ పూర్వీకుల మండల సమన్వయకర్త" />
            : <Bi en="District Lineage Officer (no mandal coordinator yet)" te="జిల్లా వంశ అధికారి (మండల సమన్వయకర్త ఇంకా లేరు)" />}
        </dd>
      </dl>
      <p className="lead">
        <Bi
          en="Your contact details stay encrypted. You will be notified on the Nayi Samakhya portal once verification is complete."
          te="మీ సంప్రదింపు వివరాలు గుప్తీకరించబడి ఉంటాయి. ధృవీకరణ పూర్తయిన తర్వాత నాయీ సమాఖ్య పోర్టల్‌లో మీకు తెలియజేస్తాము."
        />
      </p>
    </section>
  );
}

type Props = {
  membershipId: string;
  gothras: Gothra[];
  districts: District[];
  mandals: Mandal[];
  startStep: number;
  reviewNote: string | null;
};

export function Wizard({ membershipId, gothras, districts, mandals, startStep, reviewNote }: Props) {
  const [step, setStep] = useState(startStep);
  const [lang, setLang] = useState<Lang>('te');
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<Bilingual | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  const setText = (key: TextKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const setFlag = (key: FlagKey) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const a11y = (path: string) => ({
    id: path.replace(/\./g, '-'),
    'aria-invalid': path in errors,
    'aria-describedby': path in errors ? `${path.replace(/\./g, '-')}-error` : undefined,
  });
  const err = (path: string) => <ErrorText id={`${path.replace(/\./g, '-')}-error`} code={errors[path]} />;

  function next() {
    const found = stepErrors(step, toPayload(form, lang));
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => s + 1);
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
      } else if (res.status === 409) {
        setServerError({ en: 'This profile was already submitted for review.', te: 'ఈ ప్రొఫైల్ ఇప్పటికే సమీక్షకు పంపబడింది.' });
      } else if (res.status === 422) {
        setServerError({ en: 'Some details could not be accepted. Please go back and check them.', te: 'కొన్ని వివరాలు అంగీకరించబడలేదు. దయచేసి వెనక్కి వెళ్లి సరిచూడండి.' });
      } else {
        setServerError({ en: 'Something went wrong. Please try again shortly.', te: 'ఏదో పొరపాటు జరిగింది. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.' });
      }
    } catch {
      setServerError({ en: 'Network problem. Please try again.', te: 'నెట్‌వర్క్ సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి.' });
    } finally {
      setBusy(false);
    }
  }

  const district = districts.find((d) => d.slug === form.district);
  const title = STEPS[step - 1] ?? STEPS[0]!;

  return (
    <>
      <nav aria-label="Onboarding progress">
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.en} aria-current={i + 1 === step ? 'step' : undefined} className={i + 1 < step ? 'done' : undefined}>
              {i + 1}. {s.en}
            </li>
          ))}
        </ol>
      </nav>

      {step === 7 && result ? (
        <Confirmation {...result} status="pending_mandal_review" />
      ) : (
        <section className="card" aria-labelledby="step-title">
          <h2 id="step-title" ref={heading} tabIndex={-1}>
            {`Step ${step}: ${title.en}`} <span className="te" lang="te">{`దశ ${step}: ${title.te}`}</span>
          </h2>

          {step === 1 && (
            <>
              {reviewNote !== null && (
                <p className="alert" role="status">
                  <Bi en="Your previous submission was returned by the coordinator:" te="మీ గత దరఖాస్తును సమన్వయకర్త తిరిగి పంపారు:" />{' '}
                  {reviewNote}
                </p>
              )}
              <dl className="summary">
                <dt><Bi en="NS Membership ID" te="ఎన్ఎస్ సభ్యత్వ సంఖ్య" /></dt>
                <dd>{membershipId}</dd>
                <dt><Bi en="Community verification" te="సమాజ ధృవీకరణ" /></dt>
                <dd><span className="badge">✓ <Bi en="Verified" te="ధృవీకరించబడింది" /></span></dd>
              </dl>
              <p className="lead">
                <Bi
                  en="Your Nayi Samakhya session is active and community-verified. The next steps take about ten minutes; nothing is saved until you submit in step 6."
                  te="మీ నాయీ సమాఖ్య సెషన్ సక్రియంగా, సమాజ-ధృవీకరణతో ఉంది. తదుపరి దశలకు సుమారు పది నిమిషాలు పడుతుంది; 6వ దశలో సమర్పించే వరకు ఏదీ భద్రపరచబడదు."
                />
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <LangToggle lang={lang} setLang={setLang} />
              <h3 lang="te">ఆత్మగౌరవ ప్రతిజ్ఞ <span lang="en">· Self-Respect Pledge</span></h3>
              <div className="notice" lang={lang}>
                {NOTICES.pledge[lang]}
                <small>{`${NOTICES.pledge.version}.${lang}`}</small>
              </div>
              <label className="check">
                <input type="checkbox" checked={form.pledge} onChange={setFlag('pledge')} {...a11y('pledge.accepted')} />
                <span><Bi en="I accept and sign this pledge." te="ఈ ప్రతిజ్ఞను అంగీకరించి సంతకం చేస్తున్నాను." /></span>
              </label>
              {err('pledge.accepted')}
            </>
          )}

          {step === 3 && (
            <>
              <fieldset>
                <legend><Bi en="About you" te="మీ గురించి" /></legend>
                <div className="field">
                  <label htmlFor="heritage-displayName"><Bi en="Full name" te="పూర్తి పేరు" /></label>
                  <input type="text" autoComplete="name" maxLength={80} value={form.displayName} onChange={setText('displayName')} {...a11y('heritage.displayName')} />
                  {err('heritage.displayName')}
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="heritage-gender"><Bi en="Gender" te="లింగం" /></label>
                    <select value={form.gender} onChange={setText('gender')} {...a11y('heritage.gender')}>
                      <option value="">—</option>
                      <option value="male">Male · పురుషుడు</option>
                      <option value="female">Female · స్త్రీ</option>
                    </select>
                    {err('heritage.gender')}
                  </div>
                  <div className="field">
                    <label htmlFor="heritage-dateOfBirth"><Bi en="Date of birth" te="పుట్టిన తేదీ" /></label>
                    <input type="date" value={form.dateOfBirth} onChange={setText('dateOfBirth')} {...a11y('heritage.dateOfBirth')} />
                    {err('heritage.dateOfBirth')}
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend><Bi en="Lineage" te="వంశం" /></legend>
                <div className="field">
                  <label htmlFor="heritage-gothra"><Bi en="Gothra" te="గోత్రం" /></label>
                  <select value={form.gothraId} onChange={setText('gothraId')} {...a11y('heritage.gothra')}>
                    <option value="">—</option>
                    {gothras.map((g) => (
                      <option key={g.id} value={g.id}>{`${g.nameEn} · ${g.nameTe}`}</option>
                    ))}
                    <option value={PROPOSE}>Other / Propose Gothra · ఇతర / గోత్రం ప్రతిపాదించండి</option>
                  </select>
                  {err('heritage.gothra')}
                  {err('heritage.gothra.id')}
                </div>
                {form.gothraId === PROPOSE && (
                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor="heritage-gothra-nameEn"><Bi en="Gothra name (English)" te="గోత్రం పేరు (ఆంగ్లంలో)" /></label>
                      <input type="text" maxLength={60} value={form.proposedEn} onChange={setText('proposedEn')} {...a11y('heritage.gothra.nameEn')} />
                      {err('heritage.gothra.nameEn')}
                    </div>
                    <div className="field">
                      <label htmlFor="heritage-gothra-nameTe"><Bi en="Gothra name (Telugu, optional)" te="గోత్రం పేరు (తెలుగులో, ఐచ్ఛికం)" /></label>
                      <input type="text" lang="te" maxLength={60} value={form.proposedTe} onChange={setText('proposedTe')} {...a11y('heritage.gothra.nameTe')} />
                    </div>
                    <p className="hint">
                      <Bi
                        en="A District Lineage Officer confirms proposed gothras before your profile can be verified."
                        te="ప్రతిపాదిత గోత్రాన్ని జిల్లా వంశ అధికారి నిర్ధారించిన తర్వాతే మీ ప్రొఫైల్ ధృవీకరించబడుతుంది."
                      />
                    </p>
                  </div>
                )}
                <div className="field">
                  <label htmlFor="heritage-maternalLineage"><Bi en="Maternal lineage (optional)" te="తల్లి వంశం / గోత్రం (ఐచ్ఛికం)" /></label>
                  <input type="text" maxLength={80} value={form.maternalLineage} onChange={setText('maternalLineage')} {...a11y('heritage.maternalLineage')} />
                  {err('heritage.maternalLineage')}
                </div>
              </fieldset>

              <fieldset>
                <legend><Bi en="Vocational heritage" te="వృత్తి వారసత్వం" /></legend>
                <div className="choices" role="radiogroup" aria-describedby={errors['heritage.vocation'] ? 'heritage-vocation-error' : undefined}>
                  {Object.entries(VOCATIONS).map(([value, label]) => (
                    <label key={value} className="choice">
                      <input type="radio" name="vocation" value={value} checked={form.vocation === value} onChange={setText('vocation')} />
                      <span><Bi {...label} /></span>
                    </label>
                  ))}
                </div>
                {err('heritage.vocation')}
              </fieldset>

              <fieldset>
                <legend><Bi en="Ancestral native place" te="పూర్వీకుల స్వస్థలం" /></legend>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="heritage-ancestralNativeDistrict"><Bi en="District" te="జిల్లా" /></label>
                    <select value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value, mandal: '' }))} {...a11y('heritage.ancestralNativeDistrict')}>
                      <option value="">—</option>
                      {districts.map((d) => (
                        <option key={d.slug} value={d.slug}>{`${d.nameEn} · ${d.nameTe}`}</option>
                      ))}
                    </select>
                    {err('heritage.ancestralNativeDistrict')}
                  </div>
                  <div className="field">
                    <label htmlFor="heritage-ancestralNativeMandal"><Bi en="Mandal" te="మండలం" /></label>
                    <select value={form.mandal} onChange={setText('mandal')} disabled={form.district === ''} {...a11y('heritage.ancestralNativeMandal')}>
                      <option value="">—</option>
                      {mandals.filter((m) => m.district === form.district).map((m) => (
                        <option key={m.slug} value={m.slug}>{m.nameEn}</option>
                      ))}
                    </select>
                    <p className="hint"><Bi en="Choose the district first." te="ముందుగా జిల్లాను ఎంచుకోండి." /></p>
                    {err('heritage.ancestralNativeMandal')}
                  </div>
                </div>
                <p className="hint">
                  <Bi
                    en="Your profile is verified by the coordinator of this mandal."
                    te="ఈ మండల సమన్వయకర్త మీ ప్రొఫైల్‌ను ధృవీకరిస్తారు."
                  />
                </p>
              </fieldset>
            </>
          )}

          {step === 4 && (
            <>
              <fieldset>
                <legend><Bi en="Education & career" te="విద్య & వృత్తి" /></legend>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="career-educationDegree"><Bi en="Highest degree" te="అత్యున్నత విద్యార్హత" /></label>
                    <input type="text" maxLength={120} value={form.educationDegree} onChange={setText('educationDegree')} {...a11y('career.educationDegree')} />
                    {err('career.educationDegree')}
                  </div>
                  <div className="field">
                    <label htmlFor="career-occupation"><Bi en="Occupation" te="వృత్తి / ఉద్యోగం" /></label>
                    <input type="text" maxLength={120} value={form.occupation} onChange={setText('occupation')} {...a11y('career.occupation')} />
                    {err('career.occupation')}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="career-incomeBracket"><Bi en="Annual income" te="వార్షిక ఆదాయం" /></label>
                  <select value={form.incomeBracket} onChange={setText('incomeBracket')} {...a11y('career.incomeBracket')}>
                    <option value="">—</option>
                    {Object.entries(INCOME_BRACKETS).map(([value, l]) => (
                      <option key={value} value={value}>{`${l.en} · ${l.te}`}</option>
                    ))}
                  </select>
                  {err('career.incomeBracket')}
                </div>
              </fieldset>

              {form.vocation === 'wellness_artisan' && (
                <fieldset>
                  <legend><Bi en="Enterprise badge" te="ఎంటర్‌ప్రైజ్ బ్యాడ్జ్" /></legend>
                  <label className="check">
                    <input type="checkbox" checked={form.enterprise} onChange={setFlag('enterprise')} />
                    <span><Bi en="I own a salon listed on Salon Hub" te="సెలూన్ హబ్‌లో నమోదైన సెలూన్ నాకు ఉంది" /></span>
                  </label>
                  {form.enterprise && (
                    <div className="field">
                      <label htmlFor="career-salonHubSlug"><Bi en="Salon Hub listing name" te="సెలూన్ హబ్ జాబితా పేరు" /></label>
                      <input type="text" maxLength={63} value={form.salonHubSlug} onChange={setText('salonHubSlug')} {...a11y('career.salonHubSlug')} />
                      <p className="hint">
                        {form.salonHubSlug.trim() !== '' && /^[a-z0-9][a-z0-9-]{2,62}$/.test(form.salonHubSlug.trim().toLowerCase())
                          ? <a href={`/salon-hub/${form.salonHubSlug.trim().toLowerCase()}`} target="_blank" rel="noopener">{`/salon-hub/${form.salonHubSlug.trim().toLowerCase()}`}</a>
                          : <Bi en="The last part of your /salon-hub/ address, e.g. kodad-glow-studio. Your coordinator confirms it." te="మీ /salon-hub/ చిరునామా చివరి భాగం, ఉదా. kodad-glow-studio. సమన్వయకర్త నిర్ధారిస్తారు." />}
                      </p>
                      {err('career.salonHubSlug')}
                    </div>
                  )}
                </fieldset>
              )}

              <details>
                <summary><Bi en="Jathakam details (optional)" te="జాతక వివరాలు (ఐచ్ఛికం)" /></summary>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="career-birthTime"><Bi en="Time of birth" te="పుట్టిన సమయం" /></label>
                    <input type="time" value={form.birthTime} onChange={setText('birthTime')} {...a11y('career.birthTime')} />
                    {err('career.birthTime')}
                  </div>
                  <div className="field">
                    <label htmlFor="career-birthPlace"><Bi en="Place of birth" te="పుట్టిన స్థలం" /></label>
                    <input type="text" maxLength={80} value={form.birthPlace} onChange={setText('birthPlace')} {...a11y('career.birthPlace')} />
                    {err('career.birthPlace')}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="career-nakshatra"><Bi en="Nakshatra" te="నక్షత్రం" /></label>
                  <select value={form.nakshatra} onChange={setText('nakshatra')} {...a11y('career.nakshatra')}>
                    <option value="">—</option>
                    {Object.entries(NAKSHATRAS).map(([value, l]) => (
                      <option key={value} value={value}>{`${l.en} · ${l.te}`}</option>
                    ))}
                  </select>
                </div>
              </details>
            </>
          )}

          {step === 5 && (
            <>
              <LangToggle lang={lang} setLang={setLang} />
              <fieldset>
                <legend><Bi en="Photo visibility" te="ఫోటో గోప్యత" /></legend>
                <div className="choices">
                  {Object.entries(PHOTO_VISIBILITY).map(([value, label]) => (
                    <label key={value} className="choice">
                      <input type="radio" name="photoVisibility" value={value} checked={form.photoVisibility === value} onChange={setText('photoVisibility')} />
                      <span><Bi {...label} /></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend><Bi en="Contact details (encrypted)" te="సంప్రదింపు వివరాలు (గుప్తీకరించబడతాయి)" /></legend>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="contact-phone"><Bi en="Mobile number" te="మొబైల్ నంబర్" /></label>
                    <input type="tel" autoComplete="tel" maxLength={20} value={form.phone} onChange={setText('phone')} {...a11y('contact.phone')} />
                    {err('contact.phone')}
                  </div>
                  <div className="field">
                    <label htmlFor="contact-whatsapp"><Bi en="WhatsApp (optional)" te="వాట్సాప్ (ఐచ్ఛికం)" /></label>
                    <input type="tel" maxLength={20} value={form.whatsapp} onChange={setText('whatsapp')} {...a11y('contact.whatsapp')} />
                    {err('contact.whatsapp')}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-email"><Bi en="Email (optional)" te="ఇమెయిల్ (ఐచ్ఛికం)" /></label>
                  <input type="email" autoComplete="email" maxLength={254} value={form.email} onChange={setText('email')} {...a11y('contact.email')} />
                  {err('contact.email')}
                </div>
                <div className="field">
                  <label htmlFor="contact-doorAddress"><Bi en="Door address (for field verification only)" te="ఇంటి చిరునామా (క్షేత్ర ధృవీకరణకు మాత్రమే)" /></label>
                  <textarea maxLength={500} value={form.doorAddress} onChange={setText('doorAddress')} {...a11y('contact.doorAddress')} />
                  {err('contact.doorAddress')}
                </div>
                <div className="notice" lang={lang}>{CONTACT_MASKING[lang]}</div>
                <label className="check">
                  <input type="checkbox" checked={form.masking} onChange={setFlag('masking')} {...a11y('privacy.contactMaskingAcknowledged')} />
                  <span><Bi en="I understand my contact details stay hidden until mutual interest and consent." te="పరస్పర ఆసక్తి, సమ్మతి వరకు నా వివరాలు దాగి ఉంటాయని అర్థం చేసుకున్నాను." /></span>
                </label>
                {err('privacy.contactMaskingAcknowledged')}
              </fieldset>

              <fieldset>
                <legend><Bi en="Consent — DPDP Act, 2023" te="సమ్మతి — డీపీడీపీ చట్టం, 2023" /></legend>
                <div className="notice" lang={lang}>
                  {NOTICES.profileProcessing[lang]}
                  <small>{`${NOTICES.profileProcessing.version}.${lang}`}</small>
                </div>
                <label className="check">
                  <input type="checkbox" checked={form.dpdp} onChange={setFlag('dpdp')} {...a11y('privacy.profileProcessingConsent')} />
                  <span><Bi en="I give this consent (Section 6)." te="ఈ సమ్మతిని ఇస్తున్నాను (సెక్షన్ 6)." /></span>
                </label>
                {err('privacy.profileProcessingConsent')}
                <div className="notice" lang={lang}>
                  {NOTICES.coordinatorVerification[lang]}
                  <small>{`${NOTICES.coordinatorVerification.version}.${lang}`}</small>
                </div>
                <label className="check">
                  <input type="checkbox" checked={form.coordinator} onChange={setFlag('coordinator')} {...a11y('privacy.coordinatorVerificationConsent')} />
                  <span><Bi en="I consent to coordinator verification." te="సమన్వయకర్త ధృవీకరణకు సమ్మతిస్తున్నాను." /></span>
                </label>
                {err('privacy.coordinatorVerificationConsent')}
                <p className="hint">
                  <Bi
                    en="With each consent we record the notice version, its exact text, the time, your IP address and browser, as evidence required by law."
                    te="ప్రతి సమ్మతితో నోటీసు వెర్షన్, దాని ఖచ్చితమైన పాఠం, సమయం, మీ IP చిరునామా, బ్రౌజర్ వివరాలను చట్టప్రకారం సాక్ష్యంగా నమోదు చేస్తాము."
                  />
                </p>
              </fieldset>
            </>
          )}

          {step === 6 && (
            <>
              <p className="lead">
                <Bi
                  en="Your profile will be routed for verification based on your ancestral native place."
                  te="మీ పూర్వీకుల స్వస్థలం ఆధారంగా మీ ప్రొఫైల్ ధృవీకరణకు పంపబడుతుంది."
                />
              </p>
              <dl className="summary">
                <dt><Bi en="District" te="జిల్లా" /></dt>
                <dd>{district ? <Bi en={district.nameEn} te={district.nameTe} /> : '—'}</dd>
                <dt><Bi en="Mandal" te="మండలం" /></dt>
                <dd>{mandals.find((m) => m.district === form.district && m.slug === form.mandal)?.nameEn ?? '—'}</dd>
                <dt><Bi en="Reviewer" te="సమీక్షకులు" /></dt>
                <dd>
                  <Bi
                    en="Mandal Coordinator of this mandal, or the District Lineage Officer if none is assigned"
                    te="ఈ మండల సమన్వయకర్త, లేకపోతే జిల్లా వంశ అధికారి"
                  />
                </dd>
                <dt><Bi en="Status after submission" te="సమర్పణ తర్వాత స్థితి" /></dt>
                <dd><span className="badge">Pending_Mandal_Review</span></dd>
              </dl>
              <p className="hint">
                <Bi
                  en="While under review your profile is locked so the coordinator verifies exactly what you submitted."
                  te="సమీక్ష సమయంలో మీరు సమర్పించిన వివరాలనే సమన్వయకర్త ధృవీకరించేలా ప్రొఫైల్ లాక్ చేయబడుతుంది."
                />
              </p>
              {serverError && (
                <p className="alert" role="alert">
                  <Bi {...serverError} />
                </p>
              )}
            </>
          )}

          <div className="actions">
            {step > 1 ? (
              <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>
                ← <Bi en="Back" te="వెనుకకు" />
              </button>
            ) : (
              <span />
            )}
            {step < 6 && (
              <button type="button" className="btn" onClick={next}>
                <Bi en="Continue" te="కొనసాగించండి" /> →
              </button>
            )}
            {step === 6 && (
              <button type="button" className="btn" onClick={submit} disabled={busy}>
                {busy ? '…' : <Bi en="Submit for review" te="సమీక్షకు సమర్పించండి" />}
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }): ReactNode {
  return (
    <div className="lang-toggle" role="group" aria-label="Notice language / నోటీసు భాష">
      <button type="button" className="btn-ghost" aria-pressed={lang === 'te'} onClick={() => setLang('te')} lang="te">తెలుగు</button>
      <button type="button" className="btn-ghost" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
    </div>
  );
}
