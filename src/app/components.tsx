'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { NOTICES, type Bilingual, type Lang } from '../lib/onboarding.ts';
import { Bi, LangToggle } from './onboarding/Wizard.tsx';

const ERRORS: Record<string, Bilingual> = {
  forbidden: { en: 'This action is not permitted.', te: 'ఈ చర్యకు అనుమతి లేదు.' },
  not_found: { en: 'Not available (it may have changed). Please reload.', te: 'అందుబాటులో లేదు (మారి ఉండవచ్చు). దయచేసి రీలోడ్ చేయండి.' },
  no_pending_interest: { en: 'This interest is no longer waiting for a response.', te: 'ఈ ఆసక్తి ఇక స్పందన కోసం వేచి లేదు.' },
  conflict: { en: 'Already done, or not possible in the current state.', te: 'ఇప్పటికే జరిగింది, లేదా ప్రస్తుత స్థితిలో సాధ్యం కాదు.' },
  limit_reached: { en: 'Daily limit reached. Please try again tomorrow.', te: 'రోజువారీ పరిమితి చేరుకుంది. దయచేసి రేపు ప్రయత్నించండి.' },
  invalid: { en: 'Please check the details.', te: 'దయచేసి వివరాలు సరిచూడండి.' },
  too_large: { en: 'The photo must be at most 5 MB.', te: 'ఫోటో గరిష్టంగా 5 MB ఉండాలి.' },
  unsupported_format: { en: 'Please use a JPEG, PNG or WebP photo.', te: 'దయచేసి JPEG, PNG లేదా WebP ఫోటో ఉపయోగించండి.' },
  unreadable_image: { en: 'This photo could not be read.', te: 'ఈ ఫోటోను చదవలేకపోయాము.' },
};
const GENERIC: Bilingual = { en: 'Something went wrong. Please try again.', te: 'ఏదో పొరపాటు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.' };

async function post(url: string, init: RequestInit): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: Bilingual }> {
  try {
    const res = await fetch(url, { method: 'POST', ...init });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return res.ok ? { ok: true, data } : { ok: false, error: ERRORS[String(data.error)] ?? GENERIC };
  } catch {
    return { ok: false, error: GENERIC };
  }
}

function Alert({ error }: { error: Bilingual | null }) {
  return error ? <p className="error" role="alert"><Bi {...error} /></p> : null;
}

export type Field = {
  name: string;
  label: Bilingual;
  kind: 'text' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  maxLength?: number;
  required?: boolean;
};

type ActionProps = {
  url: string;
  body: Record<string, unknown>;
  label: Bilingual;
  fields?: Field[];
  /** Show these response keys instead of refreshing (decrypted contact / address). */
  reveal?: Record<string, Bilingual>;
  ghost?: boolean;
};

/** One POST, then refresh the server-rendered page; or, with `reveal`, show the response in place. */
export function ActionButton({ url, body, label, fields = [], reveal, ghost }: ActionProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Bilingual | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const id = (name: string) => `${label.en.replace(/\W+/g, '-').toLowerCase()}-${String(Object.values(body)[0] ?? '').slice(0, 8)}-${name}`;

  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await post(url, { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, ...values }) });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    if (reveal) setResult(r.data);
    else router.refresh();
  }

  return (
    <form className="action" onSubmit={run}>
      {fields.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={id(f.name)}><Bi {...f.label} /></label>
          {f.kind === 'select' ? (
            <select id={id(f.name)} required={f.required} value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
              <option value="">—</option>
              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.kind === 'textarea' ? (
            <textarea id={id(f.name)} required={f.required} maxLength={f.maxLength} value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          ) : (
            <input id={id(f.name)} type="text" required={f.required} maxLength={f.maxLength} value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          )}
        </div>
      ))}
      <button type="submit" className={ghost ? 'btn-ghost' : 'btn'} disabled={busy}>{busy ? '…' : <Bi {...label} />}</button>
      <Alert error={error} />
      {result && reveal && (
        <dl className="summary revealed" aria-live="polite">
          {Object.entries(reveal).map(([key, l]) => (
            <div key={key} className="contents">
              <dt><Bi {...l} /></dt>
              <dd>{result[key] == null ? '—' : String(result[key])}</dd>
            </div>
          ))}
        </dl>
      )}
    </form>
  );
}

type Notice = { version: string; en: string; te: string };

/** Grant and withdraw are the same one-click control on the same screen (DPDP s.6(4)). */
export function ConsentControl({ url, body, notice, granted, allowGrant = true }: {
  url: string;
  body: Record<string, unknown>;
  notice: Notice;
  granted: boolean;
  allowGrant?: boolean;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('te');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Bilingual | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const r = await post(url, { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, grant: !granted, lang, noticeVersion: notice.version }) });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    router.refresh();
  }

  return (
    <div className="consent">
      <details open={!granted}>
        <summary><Bi en="Notice" te="నోటీసు" /> <small>{`${notice.version}.${lang}`}</small></summary>
        <LangToggle lang={lang} setLang={setLang} />
        <div className="notice" lang={lang}>{notice[lang]}</div>
      </details>
      {granted ? (
        <button type="button" className="btn-ghost" onClick={toggle} disabled={busy}><Bi en="Withdraw consent" te="సమ్మతిని ఉపసంహరించుకోండి" /></button>
      ) : allowGrant ? (
        <button type="button" className="btn" onClick={toggle} disabled={busy}><Bi en="I give this consent" te="ఈ సమ్మతిని ఇస్తున్నాను" /></button>
      ) : null}
      <Alert error={error} />
    </div>
  );
}

export function PhotoUpload() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('te');
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Bilingual | null>(null);

  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!file || !consent) return setError(ERRORS.invalid ?? GENERIC);
    const form = new FormData();
    form.set('photo', file);
    form.set('lang', lang);
    form.set('consent', 'yes');
    form.set('noticeVersion', NOTICES.photoDisplay.version);
    setBusy(true);
    setError(null);
    const r = await post('/matrimony/api/photos', { body: form });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={upload}>
      <div className="field">
        <label htmlFor="photo-file"><Bi en="Photo (JPEG, PNG or WebP, up to 5 MB)" te="ఫోటో (JPEG, PNG లేదా WebP, 5 MB వరకు)" /></label>
        <input id="photo-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <LangToggle lang={lang} setLang={setLang} />
      <div className="notice" lang={lang}>
        {NOTICES.photoDisplay[lang]}
        <small>{`${NOTICES.photoDisplay.version}.${lang}`}</small>
      </div>
      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span><Bi en="I give this consent and upload my photo." te="ఈ సమ్మతిని ఇచ్చి నా ఫోటోను అప్‌లోడ్ చేస్తున్నాను." /></span>
      </label>
      <button type="submit" className="btn" disabled={busy || !file || !consent}>{busy ? '…' : <Bi en="Upload photo" te="ఫోటో అప్‌లోడ్ చేయండి" />}</button>
      <Alert error={error} />
    </form>
  );
}