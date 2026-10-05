import { notFound } from 'next/navigation';
import { gothraQueue, grievanceQueue, reviewQueue } from '../../lib/admin-store.ts';
import { VOCATIONS } from '../../lib/onboarding.ts';
import { dbContext } from '../../lib/onboarding-store.ts';
import { requireSession } from '../../lib/session.ts';
import { ActionButton } from '../components.tsx';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';

const API = '/matrimony/api/admin';

export default async function AdminPage() {
  const claims = await requireSession();
  const reviewer = claims.roles.includes('mandal_coordinator') || claims.roles.includes('district_lineage_officer');
  const lineage = claims.roles.includes('district_lineage_officer');
  const grievance = claims.roles.includes('grievance_officer');
  if (!reviewer && !grievance) notFound();
  const ctx = dbContext(claims);
  const [queue, gothras, tickets] = await Promise.all([
    reviewer ? reviewQueue(ctx) : [],
    lineage ? gothraQueue(ctx) : null,
    grievance ? grievanceQueue(ctx) : [],
  ]);

  return (
    <main className="shell wide">
      <Nav claims={claims} />
      <h1><Bi en="NSM administration" te="ఎన్ఎస్ఎం నిర్వహణ" /></h1>
      <p className="hint"><Bi en="You see only profiles and tickets in your assigned scope. Every door-address and contact reveal is recorded." te="మీకు కేటాయించిన పరిధిలోని ప్రొఫైల్‌లు, ఫిర్యాదులు మాత్రమే కనిపిస్తాయి. ప్రతి చిరునామా, సంప్రదింపు వీక్షణ నమోదు చేయబడుతుంది." /></p>

      {reviewer && (
        <section className="card" aria-labelledby="q1">
          <h2 id="q1"><Bi en="Queue 1 · Profile verification" te="వరుస 1 · ప్రొఫైల్ ధృవీకరణ" /></h2>
          {queue.length === 0 && <p className="lead"><Bi en="No profiles waiting." te="వేచి ఉన్న ప్రొఫైల్‌లు లేవు." /></p>}
          {queue.map((p) => (
            <article key={p.id} className="review">
              {p.photoUrl && <figure className="photo"><img src={p.photoUrl} alt={`Photo submitted by ${p.display_name}`} referrerPolicy="no-referrer" /></figure>}
              <h3>{p.display_name} <small className="mono">{p.matrimonial_id}</small></h3>
              <dl className="summary">
                <dt><Bi en="Gender / age" te="లింగం / వయస్సు" /></dt><dd>{`${p.gender}, ${p.age}`}</dd>
                <dt><Bi en="Gothra" te="గోత్రం" /></dt>
                <dd>{p.gothra_en ?? '—'}{p.gothra_te ? ` · ${p.gothra_te}` : ''} {!p.gothra_ratified && <span className="badge"><Bi en="Proposed — needs lineage officer" te="ప్రతిపాదిత — వంశ అధికారి నిర్ధారణ అవసరం" /></span>}</dd>
                {p.maternal_lineage && <><dt><Bi en="Maternal lineage" te="తల్లి వంశం" /></dt><dd>{p.maternal_lineage}</dd></>}
                <dt><Bi en="Ancestral place" te="పూర్వీకుల స్వస్థలం" /></dt><dd>{`${p.mandal_en}, ${p.district_en}`}</dd>
                <dt><Bi en="Vocation" te="వృత్తి" /></dt><dd>{VOCATIONS[p.vocation as keyof typeof VOCATIONS]?.en ?? p.vocation}{p.salon_hub_slug && ` · /salon-hub/${p.salon_hub_slug}`}</dd>
                <dt><Bi en="Education / occupation" te="విద్య / ఉద్యోగం" /></dt><dd>{`${p.education_degree ?? '—'} / ${p.occupation ?? '—'}`}</dd>
                <dt><Bi en="Reviewer" te="సమీక్షకులు" /></dt><dd>{p.assigned_to_me ? <Bi en="Assigned to you" te="మీకు కేటాయించబడింది" /> : <Bi en="District queue" te="జిల్లా వరుస" />}</dd>
              </dl>
              <div className="row">
                <ActionButton url={`${API}/profiles`} body={{ action: 'door_address', profileId: p.id }} label={{ en: 'Reveal door address (audited)', te: 'ఇంటి చిరునామా చూపించు (నమోదు అవుతుంది)' }} ghost reveal={{ address: { en: 'Door address', te: 'ఇంటి చిరునామా' } }} />
                <ActionButton url={`${API}/profiles`} body={{ action: 'verify', profileId: p.id }} label={{ en: 'Approve', te: 'ఆమోదించండి' }} />
                <ActionButton url={`${API}/profiles`} body={{ action: 'reject', profileId: p.id }} label={{ en: 'Reject', te: 'తిరస్కరించండి' }} ghost
                  fields={[{ name: 'reason', kind: 'textarea', required: true, maxLength: 500, label: { en: 'Reason (shown to the member)', te: 'కారణం (సభ్యునికి చూపబడుతుంది)' } }]} />
              </div>
            </article>
          ))}
        </section>
      )}

      {gothras && (
        <section className="card" aria-labelledby="q2">
          <h2 id="q2"><Bi en="Queue 2 · Gothra discrepancies" te="వరుస 2 · గోత్ర వ్యత్యాసాలు" /></h2>
          {gothras.proposals.length === 0 && <p className="lead"><Bi en="No proposed gothras." te="ప్రతిపాదిత గోత్రాలు లేవు." /></p>}
          {gothras.proposals.map((g) => (
            <article key={g.id} className="review">
              <h3>{g.name_en}{g.name_te ? ` · ${g.name_te}` : ''} <small>{`(${g.profiles} profile${g.profiles === 1 ? '' : 's'})`}</small></h3>
              <div className="row">
                <ActionButton url={`${API}/gothras`} body={{ gothraId: g.id }} label={{ en: 'Ratify as a new gothra', te: 'కొత్త గోత్రంగా నిర్ధారించండి' }} />
                <ActionButton url={`${API}/gothras`} body={{ gothraId: g.id }} label={{ en: 'Merge as spelling variant', te: 'అక్షర భేదంగా విలీనం చేయండి' }} ghost
                  fields={[{ name: 'mergeInto', kind: 'select', required: true, label: { en: 'Same lineage as', te: 'ఇదే వంశం' }, options: gothras.verified.map((v) => ({ value: v.id, label: `${v.name_en} · ${v.name_te}` })) }]} />
              </div>
            </article>
          ))}
        </section>
      )}

      {grievance && (
        <section className="card" aria-labelledby="q3">
          <h2 id="q3"><Bi en="Queue 3 · DPDP grievances" te="వరుస 3 · డీపీడీపీ ఫిర్యాదులు" /></h2>
          {tickets.length === 0 && <p className="lead"><Bi en="No open tickets." te="తెరిచి ఉన్న ఫిర్యాదులు లేవు." /></p>}
          {tickets.map((t) => (
            <article key={t.id} className="review">
              <h3>{t.category} <small>{`${t.status} · ${t.created_at.toISOString().slice(0, 10)}`}</small></h3>
              <p className="notice">{t.description}</p>
              {t.photoUrl && <figure className="photo"><img src={t.photoUrl} alt="Reported photo" referrerPolicy="no-referrer" /></figure>}
              {t.actions.length > 0 && (
                <ol className="audit">
                  {t.actions.map((a) => (
                    <li key={a.id}>
                      {`${a.action}: “${a.note}” — proposed ${a.proposed_by_me ? 'by you' : 'by another officer'} ${a.proposed_at.toISOString().slice(0, 16)}Z; `}
                      {a.approved ? `approved ${a.approved_by_me ? 'by you' : 'by another officer'} ${a.approved_at?.toISOString().slice(0, 16)}Z` : 'awaiting a second officer'}
                      {!a.approved && !a.proposed_by_me && !t.filed_by_me && (
                        <ActionButton url={`${API}/grievances`} body={{ action: 'approve', actionId: a.id }} label={{ en: 'Approve as second officer', te: 'రెండవ అధికారిగా ఆమోదించండి' }} />
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {t.filed_by_me ? (
                <p className="hint"><Bi en="You filed this ticket, so you cannot act on it." te="ఈ ఫిర్యాదు మీరు చేశారు, కాబట్టి దీనిపై చర్య తీసుకోలేరు." /></p>
              ) : t.mine ? (
                <div className="row">
                  {t.subject_profile_id && (
                    <ActionButton url={`${API}/grievances`} body={{ action: 'contact', ticketId: t.id }} label={{ en: 'Reveal member contact (audited)', te: 'సభ్యుని సంప్రదింపు చూపించు (నమోదు అవుతుంది)' }} ghost
                      reveal={{ phone: { en: 'Phone', te: 'ఫోన్' }, email: { en: 'Email', te: 'ఇమెయిల్' }, whatsapp: { en: 'WhatsApp', te: 'వాట్సాప్' } }} />
                  )}
                  <ActionButton url={`${API}/grievances`} body={{ action: 'propose', ticketId: t.id }} label={{ en: 'Record decision', te: 'నిర్ణయం నమోదు చేయండి' }}
                    fields={[
                      { name: 'kind', kind: 'select', required: true, label: { en: 'Decision', te: 'నిర్ణయం' }, options: [
                        { value: 'resolve', label: 'Resolve (no destructive action)' },
                        ...(t.category === 'data_erasure' ? [{ value: 'erase_profile', label: 'Erase profile (needs second officer)' }] : []),
                        ...(t.category === 'unauthorized_photo' ? [{ value: 'remove_photo', label: 'Remove photo (needs second officer)' }] : []),
                      ] },
                      { name: 'note', kind: 'textarea', required: true, maxLength: 1000, label: { en: 'Reasoning (no contact data)', te: 'కారణం (సంప్రదింపు వివరాలు వద్దు)' } },
                    ]} />
                </div>
              ) : (
                <ActionButton url={`${API}/grievances`} body={{ action: 'assign', ticketId: t.id }} label={{ en: t.unassigned ? 'Assign to me' : 'Take over', te: 'నాకు కేటాయించండి' }} ghost />
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
