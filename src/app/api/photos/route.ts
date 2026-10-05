import { randomUUID } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { consentEvidence, dbError, json } from '../../../lib/http.ts';
import { MAX_PHOTO_BYTES, PhotoFieldsSchema } from '../../../lib/matrimony.ts';
import { attachPhoto } from '../../../lib/match-store.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';
import { requireSession } from '../../../lib/session.ts';
import { PhotoError, deletePhoto, processPhoto, putPhoto } from '../../../lib/storage.ts';

const warn = (event: string) => () => console.warn(JSON.stringify({ event }));

/** Multipart: photo + lang + consent=yes + noticeVersion. Withdrawal goes through /api/consents. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const claims = await requireSession();
  const evidence = consentEvidence(req);
  if (!evidence) return json(400, { error: 'consent_evidence_unavailable' });
  if (Number(req.headers.get('content-length') ?? 0) > MAX_PHOTO_BYTES + 64 * 1024) return json(413, { error: 'too_large' });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: 'invalid_form' });
  }
  const fields = PhotoFieldsSchema.safeParse({ lang: form.get('lang'), consent: form.get('consent'), noticeVersion: form.get('noticeVersion') });
  if (!fields.success) return json(422, { error: 'invalid', fields: [...new Set(fields.error.issues.map((i) => i.path.join('.')))] });
  const file = form.get('photo');
  if (!(file instanceof File) || file.size === 0) return json(422, { error: 'invalid', fields: ['photo'] });
  if (file.size > MAX_PHOTO_BYTES) return json(413, { error: 'too_large' });

  let photo;
  try {
    photo = await processPhoto(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof PhotoError) return json(422, { error: err.message });
    throw err;
  }
  const objectId = randomUUID();
  try {
    await putPhoto(objectId, photo);
  } catch {
    warn('photo_store_failed')();
    return json(503, { error: 'storage_unavailable' });
  }
  let previous: string | null;
  try {
    previous = await attachPhoto(dbContext(claims), objectId, fields.data.lang, evidence);
  } catch (err) {
    await deletePhoto(objectId).catch(warn('photo_delete_failed'));
    return dbError(err, req, 'photo_attach_failed');
  }
  // ponytail: a failed delete leaves an orphan object (unreferenced, unreadable); needs a bucket sweeper.
  if (previous) await deletePhoto(previous).catch(warn('photo_delete_failed'));
  return json(201, { status: 'uploaded' });
}
