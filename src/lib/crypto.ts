import 'server-only';
import type { PoolClient } from 'pg';
import { z } from 'zod';

const KeyEnvSchema = z.object({ NSM_CONTACT_KEY: z.string().min(32) });

const phone = z.string().regex(/^\+?[0-9]{10,15}$/);
const ContactInputSchema = z.object({
  phone: phone.nullable(),
  email: z.email().max(254).nullable(),
  whatsapp: phone.nullable(),
  doorAddress: z.string().trim().min(1).max(500).nullable(),
});
export type ContactInput = z.infer<typeof ContactInputSchema>;

const ContactDetailsSchema = z.object({
  phone: z.string().nullable(),
  email: z.string().nullable(),
  whatsapp: z.string().nullable(),
});
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;

/** Key lives only for the duration of `fn`, inside the caller's transaction. */
async function withContactKey<T>(tx: PoolClient, fn: () => Promise<T>): Promise<T> {
  await tx.query("SELECT set_config('nsm.contact_key', $1, true)", [KeyEnvSchema.parse(process.env).NSM_CONTACT_KEY]);
  try {
    return await fn();
  } finally {
    // On an aborted transaction this fails, but the rollback discards the setting anyway.
    await tx.query("SELECT set_config('nsm.contact_key', '', true)").catch(() => undefined);
  }
}

export async function setContactDetails(tx: PoolClient, input: ContactInput): Promise<void> {
  const c = ContactInputSchema.parse(input);
  await withContactKey(tx, () =>
    tx.query('SELECT matrimony_shared.fn_set_contact_details($1, $2, $3, $4)', [c.phone, c.email, c.whatsapp, c.doorAddress]),
  );
}

/** Raises Postgres 42501 unless the database authorises this disclosure (and audits it). */
export async function unmaskContact(tx: PoolClient, targetProfileId: string, grievanceTicketId?: string): Promise<ContactDetails> {
  const target = z.uuid().parse(targetProfileId);
  const ticket = grievanceTicketId === undefined ? null : z.uuid().parse(grievanceTicketId);
  const { rows } = await withContactKey(tx, () =>
    tx.query('SELECT phone, email, whatsapp FROM matrimony_shared.unmask_contact_details($1, $2)', [target, ticket]),
  );
  return ContactDetailsSchema.parse(rows[0]);
}

/** Field verification only: raises 42501 unless the caller is the reviewing coordinator; audited in the DB. */
export async function unmaskDoorAddress(tx: PoolClient, targetProfileId: string): Promise<string> {
  const target = z.uuid().parse(targetProfileId);
  const { rows } = await withContactKey(tx, () => tx.query('SELECT matrimony_shared.unmask_door_address($1) AS address', [target]));
  return z.object({ address: z.string() }).parse(rows[0]).address;
}
