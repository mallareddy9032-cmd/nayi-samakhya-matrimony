import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { z } from 'zod';

const live = Boolean(process.env.DATABASE_URL && process.env.NSM_CONTACT_KEY);
const skip = live ? false : 'needs DATABASE_URL and NSM_CONTACT_KEY (scripts/exit-gate-2.sh sets them)';

test('withTx + contact crypto against live Postgres as nsm_app_user', { skip }, async () => {
  const { withTx, closePool } = await import('../src/lib/db.ts');
  const { setContactDetails, unmaskContact } = await import('../src/lib/crypto.ts');
  const ctx = { sub: randomUUID(), roles: ['member'] };
  const row = z.object({ value: z.string().nullable() });

  try {
    const profileId = await withTx(ctx, async (tx) => {
      const { rows } = await tx.query(
        `INSERT INTO matrimony_shared.profiles
           (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
         SELECT $1, 'NS-TG-SRPT-90001', 'Integration Check', 'female', current_date - interval '25 years', id,
                'suryapet', 'kodad', 'corporate_tech_civil'
           FROM matrimony_shared.gothra_master WHERE slug = 'gautama'
         RETURNING id`,
        [ctx.sub],
      );
      const seen = await tx.query("SELECT current_setting('request.jwt.claim.sub', true) AS value");
      assert.equal(row.parse(seen.rows[0]).value, ctx.sub, 'identity not set inside the transaction');
      return z.object({ id: z.uuid() }).parse(rows[0]).id;
    });

    await withTx(ctx, async (tx) => {
      await setContactDetails(tx, { phone: '+919876500099', email: 'check@example.invalid', whatsapp: null, doorAddress: '7 Test Lane, Kodad' });
      const own = await unmaskContact(tx, profileId);
      assert.deepEqual(own, { phone: '+919876500099', email: 'check@example.invalid', whatsapp: null });
      const key = await tx.query("SELECT current_setting('nsm.contact_key', true) AS value");
      assert.equal(row.parse(key.rows[0]).value, '', 'contact key outlived the call');
    });

    const other = { sub: randomUUID(), roles: ['member'] };
    await withTx(other, async (tx) => {
      const seen = await tx.query(
        "SELECT current_setting('request.jwt.claim.sub', true) AS value, current_setting('nsm.contact_key', true) AS key",
      );
      const parsed = z.object({ value: z.string(), key: z.string().nullable() }).parse(seen.rows[0]);
      assert.equal(parsed.value, other.sub, 'previous identity leaked across transactions');
      assert.ok(!parsed.key, 'contact key leaked across transactions');
      await assert.rejects(unmaskContact(tx, profileId), { code: '42501' });
    });

    await assert.rejects(withTx(ctx, (tx) => tx.query('SELECT phone_enc FROM matrimony_shared.profiles')), { code: '42501' });
    await assert.rejects(
      withTx(ctx, (tx) => setContactDetails(tx, { phone: 'not-a-phone', email: null, whatsapp: null, doorAddress: null })),
      z.ZodError,
    );
    await assert.rejects(withTx({ sub: 'not-a-uuid', roles: [] }, async () => undefined), z.ZodError);

    await withTx(ctx, (tx) => tx.query('DELETE FROM matrimony_shared.profiles WHERE id = $1', [profileId]));
  } finally {
    await closePool();
  }
});
