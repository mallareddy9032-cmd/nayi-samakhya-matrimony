import { grievanceAction } from '../../../../lib/admin-store.ts';
import { json, postJson } from '../../../../lib/http.ts';
import { GrievanceActionSchema } from '../../../../lib/matrimony.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';
import { deletePhoto } from '../../../../lib/storage.ts';

// Erasure and photo takedown need a second, uninvolved officer (fn_approve_grievance_action).
export const POST = postJson(GrievanceActionSchema, 'admin_grievance_failed', async (b, claims) => {
  const { body, photoToDelete } = await grievanceAction(dbContext(claims), b);
  // ponytail: a failed delete leaves an orphan object (unreferenced, unreadable); needs a bucket sweeper.
  if (photoToDelete) await deletePhoto(photoToDelete).catch(() => console.warn(JSON.stringify({ event: 'photo_delete_failed' })));
  return json(200, body);
});
