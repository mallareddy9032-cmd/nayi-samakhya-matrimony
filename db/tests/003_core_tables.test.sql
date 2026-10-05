\set ON_ERROR_STOP 1
BEGIN;
SET LOCAL search_path = matrimony_shared, pg_temp;
SET LOCAL ROLE nsm_owner;

DO $$
DECLARE
  v_g uuid := (SELECT id FROM gothra_master WHERE slug = 'kashyapa');
BEGIN
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES (gen_random_uuid(), 'NS-TG-SRPT-1', 'Young Male', 'male', current_date - interval '21 years' + interval '1 day', v_g, 'suryapet', 'kodad', 'scholarly_academic');
    ASSERT false, 'male one day short of 21 accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES (gen_random_uuid(), 'NS-TG-SRPT-2', 'Young Female', 'female', current_date - interval '18 years' + interval '1 day', v_g, 'suryapet', 'kodad', 'scholarly_academic');
    ASSERT false, 'female one day short of 18 accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
  VALUES (gen_random_uuid(), 'NS-TG-SRPT-3', 'Exactly 21', 'male',   current_date - interval '21 years', v_g, 'suryapet', 'kodad', 'scholarly_academic'),
         (gen_random_uuid(), 'NS-TG-SRPT-4', 'Exactly 18', 'female', current_date - interval '18 years', v_g, 'suryapet', 'kodad', 'scholarly_academic');
  RAISE NOTICE 'PASS 003.1 legal marriage age enforced by CHECK: 21 male / 18 female, exact on the boundary day';

  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES (gen_random_uuid(), 'bogus', 'Bad Id', 'female', date '1995-01-01', v_g, 'suryapet', 'kodad', 'scholarly_academic');
    ASSERT false, 'malformed ns_membership_id accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS 003.2 ns_membership_id format enforced';
END $$;

SET LOCAL ROLE nsm_app_user;
SELECT set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  INSERT INTO dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent) VALUES
    (fn_current_user_id(), 'profile_processing', 'v1.en', 'I agree to NSM processing my profile for matchmaking.', true,  '203.0.113.7', 'gate-agent'),
    (fn_current_user_id(), 'photo_display',      'v1.te', 'నా ఫోటో ప్రదర్శనకు అంగీకరిస్తున్నాను.',                       true,  '203.0.113.7', 'gate-agent'),
    (fn_current_user_id(), 'photo_display',      'v1.te', 'withdrawn',                                              false, '203.0.113.7', 'gate-agent');

  BEGIN UPDATE dpdp_consent_logs SET granted = true; ASSERT false, 'app UPDATE on consent log'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM dpdp_consent_logs;               ASSERT false, 'app DELETE on consent log'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent)
    VALUES (gen_random_uuid(), 'profile_processing', 'v1.en', 'forged for someone else', true, '203.0.113.7', 'gate-agent');
    ASSERT false, 'app logged consent for another user';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO dpdp_consent_logs (root_user_id, purpose, interest_id, notice_version, statement, granted, ip, user_agent)
    VALUES (fn_current_user_id(), 'contact_share', gen_random_uuid(), 'v1.en', 'direct contact share', true, '203.0.113.7', 'gate-agent');
    ASSERT false, 'contact_share written outside fn_grant_contact_share';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS 003.3 app may only INSERT its own consent rows (no UPDATE/DELETE grant; no forging for others; contact_share only via function)';
END $$;

RESET ROLE;
SET LOCAL ROLE nsm_owner;
DO $$
BEGIN
  BEGIN UPDATE dpdp_consent_logs SET granted = NOT granted; ASSERT false, 'owner UPDATE accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM dpdp_consent_logs;                      ASSERT false, 'owner DELETE accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN TRUNCATE dpdp_consent_logs;                         ASSERT false, 'owner TRUNCATE accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 003.4 append-only trigger rejects UPDATE, DELETE and TRUNCATE even for the table owner';

  INSERT INTO dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent, created_at)
  VALUES ('30000000-0000-4000-8000-000000000002', 'profile_processing', 'v1.en', 'backdate attempt', true, '203.0.113.8', 'gate-agent', '2000-01-01');
  ASSERT (SELECT created_at > now() - interval '1 minute' FROM dpdp_consent_logs WHERE statement = 'backdate attempt'), 'client timestamp was trusted';
  ASSERT fn_verify_consent_chain() IS NULL, 'hash chain does not verify';
  RAISE NOTICE 'PASS 003.5 server-assigned timestamps; sha256 hash chain verifies end to end';
END $$;

RESET ROLE;
ALTER TABLE matrimony_shared.dpdp_consent_logs DISABLE TRIGGER trg_dpdp_consent_logs_append_only;
UPDATE matrimony_shared.dpdp_consent_logs SET granted = true WHERE statement = 'withdrawn';
ALTER TABLE matrimony_shared.dpdp_consent_logs ENABLE TRIGGER trg_dpdp_consent_logs_append_only;
DO $$
BEGIN
  ASSERT matrimony_shared.fn_verify_consent_chain() IS NOT NULL, 'tampering not detected';
  RAISE NOTICE 'PASS 003.6 superuser tampering (triggers disabled, withdrawal flipped to grant) is detected by the hash chain';
END $$;

ROLLBACK;
