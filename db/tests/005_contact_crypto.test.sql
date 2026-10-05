\set ON_ERROR_STOP 1
BEGIN;
\ir fixtures.sql

SET LOCAL ROLE nsm_owner;
DO $$
BEGIN
  ASSERT (SELECT position(convert_to('9876500002', 'UTF8') IN phone_enc) = 0
            AND position(convert_to('bhavani', 'UTF8') IN email_enc) = 0
            AND position(convert_to('Temple', 'UTF8') IN door_address_enc) = 0
            FROM profiles WHERE id = pg_temp.p('B')), 'plaintext visible in ciphertext';
  ASSERT (SELECT pgp_sym_decrypt(phone_enc, current_setting('nsm.contact_key')) FROM profiles WHERE id = pg_temp.p('B'))
         = '+919876500002', 'ciphertext does not round-trip with the right key';
  RAISE NOTICE 'PASS 005.1 phone/email/whatsapp/door_address are stored only as AES-256 PGP ciphertext';
END $$;
RESET ROLE;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE
  v_i  uuid;
  v_t  uuid;
  v_ok boolean;
  r    record;
  c_notice    constant text := 'v1.en';
  c_grant     constant text := 'I agree to share my phone, email and WhatsApp with this match.';
  c_withdraw  constant text := 'I withdraw my consent to share contact details with this match.';
BEGIN
  PERFORM pg_temp.act_as('A');
  BEGIN PERFORM phone_enc FROM profiles WHERE id = pg_temp.p('A');        ASSERT false, 'app read phone_enc';  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE profiles SET phone_enc = '\x00' WHERE id = pg_temp.p('A'); ASSERT false, 'app wrote phone_enc'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 005.2 nsm_app_user has no column privilege on *_enc (neither read nor write)';

  SELECT * INTO r FROM unmask_contact_details(pg_temp.p('A'));
  ASSERT r.phone = '+919876500001' AND r.email = 'arjun@example.invalid', 'owner cannot read own contact';
  ASSERT NOT EXISTS (SELECT 1 FROM audit_access_logs WHERE target_profile_id = pg_temp.p('A')), 'self read audited as disclosure';
  RAISE NOTICE 'PASS 005.3 owner reads their own contact details (DPDP right of access)';

  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked with no interest'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('A'), pg_temp.p('B')) RETURNING id INTO v_i;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked at sent';        EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('B');
  UPDATE interests SET status = 'accepted' WHERE id = v_i;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A')); ASSERT false, 'unmasked at accepted';    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  ASSERT fn_grant_contact_share(v_i, c_notice, c_grant, '203.0.113.9', 'gate-agent') = 'accepted', 'one consent must not unlock';
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A')); ASSERT false, 'unmasked on one-sided consent (B)'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('A');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked on one-sided consent (A)'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  ASSERT fn_grant_contact_share(v_i, c_notice, c_grant, '203.0.113.10', 'gate-agent') = 'contact_unlocked', 'both consents must unlock';
  SELECT * INTO r FROM unmask_contact_details(pg_temp.p('B'));
  ASSERT r.phone = '+919876500002' AND r.email = 'bhavani@example.invalid' AND r.whatsapp = '+919876500012', 'A got wrong B contact';
  PERFORM pg_temp.act_as('B');
  SELECT * INTO r FROM unmask_contact_details(pg_temp.p('A'));
  ASSERT r.phone = '+919876500001', 'B got wrong A contact';
  RAISE NOTICE 'PASS 005.4 contact decrypts only after accept + BOTH contact-share consents; refused at none/sent/accepted/one-sided';

  ASSERT (SELECT count(*) FROM audit_access_logs WHERE target_profile_id = pg_temp.p('B')) = 1, 'B cannot see who unmasked them';
  BEGIN
    INSERT INTO audit_access_logs (viewer_user_id, target_profile_id, basis, interest_id) VALUES (pg_temp.u('B'), pg_temp.p('A'), 'mutual_interest', v_i);
    ASSERT false, 'app wrote audit directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS 005.5 every disclosure is audited by the database; targets can see their own audit; app cannot write audit rows';

  PERFORM pg_temp.act_as('D');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unrelated member unmasked B'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('X');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'member without profile unmasked B'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as(NULL);
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'anonymous unmask'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 005.6 third parties, profile-less members and anonymous callers are refused';

  PERFORM pg_temp.act_as('A');
  PERFORM set_config('nsm.contact_key', '', true);
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked without key'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  PERFORM set_config('nsm.contact_key', 'wrong-key-wrong-key-wrong-key-wrong-key', true);
  v_ok := false;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); EXCEPTION WHEN external_routine_invocation_exception THEN v_ok := true; END;
  ASSERT v_ok, 'wrong key decrypted contact data';
  PERFORM set_config('nsm.contact_key', 'fixture-contact-key-0123456789abcdef', true);
  RAISE NOTICE 'PASS 005.7 without the runtime key nothing decrypts (key is not stored in the database)';

  PERFORM pg_temp.act_as('B');
  ASSERT fn_withdraw_contact_share(v_i, c_notice, c_withdraw, '203.0.113.9', 'gate-agent') = 'withdrawn', 'withdrawal did not close interest';
  ASSERT (SELECT granted FROM dpdp_consent_logs WHERE interest_id = v_i AND root_user_id = pg_temp.u('B') ORDER BY seq DESC LIMIT 1) = false,
         'withdrawal not ledgered';
  PERFORM pg_temp.act_as('A');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked after withdrawal'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 005.8 withdrawal is one call, appended to the ledger, and blocks unmasking immediately';

  PERFORM pg_temp.act_as('B');
  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('B'), pg_temp.p('A'), 'misconduct', 'Abusive messages after contact exchange.') RETURNING id INTO v_t;
  PERFORM pg_temp.act_as('G', '["member","grievance_officer"]');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A'), v_t); ASSERT false, 'unassigned ticket unmasked'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  UPDATE grievance_tickets SET assigned_officer_user_id = pg_temp.u('G'), status = 'in_progress' WHERE id = v_t;
  SELECT * INTO r FROM unmask_contact_details(pg_temp.p('A'), v_t);
  ASSERT r.phone = '+919876500001', 'assigned officer could not unmask ticket subject';
  BEGIN PERFORM unmask_contact_details(pg_temp.p('D'), v_t); ASSERT false, 'ticket used for another profile'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('G');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A'), v_t); ASSERT false, 'officer without token role'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('M', '["member","grievance_officer"]');
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A'), v_t); ASSERT false, 'token role without assignment'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('G', '["member","grievance_officer"]');
  UPDATE grievance_tickets SET status = 'closed' WHERE id = v_t;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A'), v_t); ASSERT false, 'closed ticket unmasked'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('G'), pg_temp.p('D'), 'other', 'Officer-filed ticket') RETURNING id INTO v_t;
  UPDATE grievance_tickets SET assigned_officer_user_id = pg_temp.u('G') WHERE id = v_t;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('D'), v_t); ASSERT false, 'self-filed ticket unmasked'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 005.9 grievance path: assigned officer (token + assignment), open ticket, that profile only, never self-filed';
END $$;

RESET ROLE;
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM audit_access_logs
           WHERE viewer_user_id IN (pg_temp.u('A'), pg_temp.u('B')) AND basis = 'mutual_interest') = 2, 'mutual unmasks not audited';
  ASSERT (SELECT count(*) FROM audit_access_logs
           WHERE viewer_user_id = pg_temp.u('G') AND basis = 'grievance' AND grievance_ticket_id IS NOT NULL) = 1, 'grievance unmask not audited';
  ASSERT fn_verify_consent_chain() IS NULL, 'consent chain broken';
  RAISE NOTICE 'PASS 005.10 audit holds exactly the 3 permitted disclosures (2 mutual, 1 grievance with ticket); consent chain intact';
END $$;

ROLLBACK;
