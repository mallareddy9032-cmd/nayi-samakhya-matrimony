import Link from 'next/link';
import { discover } from '../../lib/match-store.ts';
import { DiscoverQuerySchema, badgesFor, type DiscoverQuery } from '../../lib/matrimony.ts';
import { VOCATIONS } from '../../lib/onboarding.ts';
import { dbContext, listDistricts } from '../../lib/onboarding-store.ts';
import { requireSession } from '../../lib/session.ts';
import { Nav } from '../Nav.tsx';
import { Bi } from '../onboarding/Wizard.tsx';
import { PhotoFrame } from '../profiles/PhotoFrame.tsx';

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoverPage({ searchParams }: { searchParams: Search }) {
  const claims = await requireSession();
  const ctx = dbContext(claims);
  const raw = Object.fromEntries(Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const parsed = DiscoverQuerySchema.safeParse(raw);
  const q: DiscoverQuery = parsed.success ? parsed.data : {};
  const [result, districts] = await Promise.all([discover(ctx, q), listDistricts(ctx)]);
  const nextHref = result.next && `/discover?${new URLSearchParams(Object.entries({ ...q, gender: result.gender ?? undefined, after: result.next })
    .filter((e): e is [string, string | number] => e[1] !== undefined).map(([k, v]) => [k, String(v)]))}`;

  return (
    <main className="shell wide">
      <Nav claims={claims} />
      <h1><Bi en="Discover" te="అన్వేషణ" /></h1>
      {result.viewerStatus !== 'verified' ? (
        <p className="alert" role="status">
          <Bi en="Discovery opens once your own profile is verified by your Mandal Coordinator." te="మీ ప్రొఫైల్ మండల సమన్వయకర్త ధృవీకరించిన తర్వాతే అన్వేషణ అందుబాటులోకి వస్తుంది." />{' '}
          <Link href="/onboarding"><Bi en="Profile status" te="ప్రొఫైల్ స్థితి" /></Link>
        </p>
      ) : (
        <>
          <form className="filters card" action="/matrimony/discover" method="get">
            <div className="field">
              <label htmlFor="f-gender"><Bi en="Looking for" te="వెతుకుతున్నది" /></label>
              <select id="f-gender" name="gender" defaultValue={result.gender ?? ''}>
                <option value="female">Bride · వధువు</option>
                <option value="male">Groom · వరుడు</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-district"><Bi en="District" te="జిల్లా" /></label>
              <select id="f-district" name="district" defaultValue={q.district ?? ''}>
                <option value="">All · అన్నీ</option>
                {districts.map((d) => <option key={d.slug} value={d.slug}>{`${d.nameEn} · ${d.nameTe}`}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-vocation"><Bi en="Vocational tier" te="వృత్తి శ్రేణి" /></label>
              <select id="f-vocation" name="vocation" defaultValue={q.vocation ?? ''}>
                <option value="">All · అన్నీ</option>
                {Object.entries(VOCATIONS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-ageMin"><Bi en="Age from" te="వయస్సు నుండి" /></label>
              <input id="f-ageMin" name="ageMin" type="number" min={18} max={80} defaultValue={q.ageMin} />
            </div>
            <div className="field">
              <label htmlFor="f-ageMax"><Bi en="to" te="వరకు" /></label>
              <input id="f-ageMax" name="ageMax" type="number" min={18} max={80} defaultValue={q.ageMax} />
            </div>
            <button type="submit" className="btn"><Bi en="Search" te="వెతకండి" /></button>
          </form>
          {!parsed.success && <p className="error" role="alert"><Bi en="Some filters were invalid and were ignored." te="కొన్ని ఫిల్టర్లు చెల్లనివి, వాటిని విస్మరించాము." /></p>}
          <p className="hint">
            <Bi en="Same mandal first, then your district, then all of Telangana. Members of your own lineage (Sagothra) are never shown." te="ముందుగా మీ మండలం, తర్వాత మీ జిల్లా, ఆపై తెలంగాణ అంతటా. మీ వంశానికి (సగోత్ర) చెందిన సభ్యులు ఎప్పుడూ చూపించబడరు." />
          </p>
          {result.cards.length === 0 ? (
            <p className="lead"><Bi en="No profiles match these filters yet." te="ఈ ఫిల్టర్లకు సరిపడే ప్రొఫైల్‌లు ఇంకా లేవు." /></p>
          ) : (
            <ul className="cards">
              {result.cards.map((c) => (
                <li key={c.id} className="profile-card">
                  <PhotoFrame photo={c.photo} name={c.firstName} />
                  <h2><Link href={`/profiles/${c.id}`}>{c.firstName}</Link>, {c.age}</h2>
                  <p className="hint"><Bi {...c.district} /> · {VOCATIONS[c.vocation as keyof typeof VOCATIONS]?.en ?? ''}</p>
                  <ul className="badges">
                    {badgesFor(c).map((b) => <li key={b.en} className="badge">{b.href ? <a href={b.href}>{b.en}</a> : b.en}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {nextHref && <p><Link className="btn-ghost link-btn" href={nextHref}><Bi en="More profiles" te="మరిన్ని ప్రొఫైల్‌లు" /> →</Link></p>}
        </>
      )}
    </main>
  );
}
