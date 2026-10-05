\set ON_ERROR_STOP 1
BEGIN;
\ir fixtures.sql

-- Fresh onboarding members n(1..). M (fixtures) coordinates suryapet/kodad, L is the Suryapet officer.
CREATE FUNCTION pg_temp.n(i int) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('30000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid
$$;
CREATE FUNCTION pg_temp.as_user(who uuid, roles text DEFAULT '["member"]') RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', who::text, true);
  PERFORM set_config('request.jwt.claim.roles', roles, true);
END $$;
CREATE FUNCTION pg_temp.consent(who uuid, purpose text, granted boolean DEFAULT true) RETURNS void LANGUAGE sql AS $$
  INSERT INTO dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent)
  VALUES (who, purpose::consent_purpose, 'test-v1.en', 'Exact notice text shown to the member.', granted, '203.0.113.7', 'sql-test')
$$;
-- Draft + encrypted contact + consents, written as the member through RLS.
CREATE FUNCTION pg_temp.draft(who uuid, p_district text, p_mandal text, p_gothra uuid DEFAULT NULL,
                              p_consents text[] DEFAULT '{community_pledge,profile_processing,coordinator_verification}')
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_id uuid; v_c text;
BEGIN
  PERFORM pg_temp.as_user(who);
  INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
                        ancestral_native_district, ancestral_native_mandal, vocation, education_degree, occupation, income_bracket)
  VALUES (who, 'NS-TG-SRPT-20001', 'Onboarding Member', 'female', current_date - interval '25 years',
          coalesce(p_gothra, (SELECT id FROM gothra_master WHERE slug = 'gautama')),
          p_district, p_mandal, 'scholarly_academic', 'M.A. Telugu', 'Lecturer', '6l_12l')
  RETURNING id INTO v_id;
  PERFORM fn_set_contact_details('+919800000001', NULL, NULL, '1 Test Street');
  FOREACH v_c IN ARRAY p_consents LOOP
    PERFORM pg_temp.consent(who, v_c);
  END LOOP;
  RETURN v_id;
END $$;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE
  v_year text := extract(year FROM now() AT TIME ZONE 'Asia/Kolkata')::int::text;
  v_p    uuid;
  r      record;
BEGIN
  ASSERT (SELECT count(*) = 33 AND count(DISTINCT code) = 33 FROM districts), '33 Telangana districts with unique codes';
  ASSERT enum_range(NULL::vocation)::text
         = '{nadopasana,wellness_artisan,corporate_tech_civil,healthcare_traditional_medicine,scholarly_academic}', 'vocation list';
  ASSERT 'community_pledge' = ANY (enum_range(NULL::consent_purpose)::text[]), 'pledge purpose missing';
  RAISE NOTICE 'PASS 006.1 33 districts with matrimonial-ID codes; Phase 3 vocations; pledge is a ledger purpose';

  PERFORM pg_temp.as_user(pg_temp.n(1));
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'submitted without a profile'; EXCEPTION WHEN no_data_found THEN NULL; END;
  v_p := pg_temp.draft(pg_temp.n(1), 'suryapet', 'kodad', NULL, '{community_pledge,profile_processing}');
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'submitted without coordinator consent'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.consent(pg_temp.n(1), 'coordinator_verification');
  PERFORM pg_temp.consent(pg_temp.n(1), 'profile_processing', false);
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'submitted after consent withdrawal'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.consent(pg_temp.n(1), 'profile_processing');
  UPDATE profiles SET occupation = NULL WHERE id = v_p;
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'submitted an incomplete profile'; EXCEPTION WHEN check_violation THEN NULL; END;
  UPDATE profiles SET occupation = 'Lecturer' WHERE id = v_p;
  BEGIN UPDATE profiles SET status = 'pending_mandal_review' WHERE id = v_p; ASSERT false, 'self-submitted via UPDATE'; EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN UPDATE profiles SET matrimonial_id = 'NSM-TG-SRPT-2026-9999' WHERE id = v_p; ASSERT false, 'app wrote matrimonial_id'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE profiles SET assigned_coordinator_user_id = pg_temp.n(1) WHERE id = v_p; ASSERT false, 'app chose its coordinator'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 006.2 submission needs a profile, complete career fields, and pledge + DPDP + coordinator consents currently granted; status, ID and coordinator are not app-writable';

  SELECT * INTO r FROM fn_submit_profile();
  ASSERT r.matrimonial_id = format('NSM-TG-SRPT-%s-0001', v_year), 'unexpected matrimonial id ' || r.matrimonial_id;
  ASSERT r.coordinator_assigned, 'Kodad coordinator not assigned';
  ASSERT (SELECT status = 'pending_mandal_review' AND assigned_coordinator_user_id = pg_temp.u('M') AND submitted_at IS NOT NULL
            FROM profiles WHERE id = v_p), 'not routed to the Kodad coordinator';
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'double submission'; EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL; END;
  RAISE NOTICE 'PASS 006.3 submit -> pending_mandal_review, routed to the ancestral mandal coordinator, ID NSM-TG-SRPT-YYYY-0001; no double submission';

  BEGIN UPDATE profiles SET display_name = 'Changed' WHERE id = v_p; ASSERT false, 'edited while under review'; EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN PERFORM fn_set_contact_details('+919800000009', NULL, NULL, 'Elsewhere'); ASSERT false, 'contact changed under review'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  ASSERT EXISTS (SELECT 1 FROM profiles WHERE id = v_p), 'not in the Kodad coordinator queue';
  RAISE NOTICE 'PASS 006.4 profile and contact are locked while under review; profile is in the Kodad coordinator queue';
END $$;

RESET ROLE;
SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
INSERT INTO sub_admins (root_user_id, role, district, mandal, assigned_by)
VALUES (pg_temp.n(90), 'mandal_coordinator', 'suryapet', 'kodad', pg_temp.u('ADMIN'));
RESET ROLE;
SET LOCAL ROLE nsm_app_user;

DO $$
DECLARE
  v_year text := extract(year FROM now() AT TIME ZONE 'Asia/Kolkata')::int::text;
  v_p    uuid;
  r      record;
BEGIN
  v_p := pg_temp.draft(pg_temp.n(2), 'suryapet', 'kodad');
  SELECT * INTO r FROM fn_submit_profile();
  ASSERT (SELECT assigned_coordinator_user_id FROM profiles WHERE id = v_p) = pg_temp.n(90), 'second Kodad coordinator (empty queue) not chosen';
  ASSERT r.matrimonial_id = format('NSM-TG-SRPT-%s-0002', v_year), 'district sequence did not advance';
  PERFORM pg_temp.draft(pg_temp.n(4), 'hyderabad', 'ameerpet');
  SELECT * INTO r FROM fn_submit_profile();
  ASSERT r.matrimonial_id = format('NSM-TG-HYDB-%s-0001', v_year), 'sequence is not per district';
  RAISE NOTICE 'PASS 006.5 least-loaded coordinator of the mandal is assigned; IDs are sequential per district and year';

  v_p := pg_temp.draft(pg_temp.n(3), 'suryapet', 'neredcherla');
  SELECT * INTO r FROM fn_submit_profile();
  ASSERT NOT r.coordinator_assigned AND (SELECT assigned_coordinator_user_id IS NULL FROM profiles WHERE id = v_p), 'phantom coordinator';
  PERFORM pg_temp.act_as('L', '["member","district_lineage_officer"]');
  ASSERT EXISTS (SELECT 1 FROM profiles WHERE id = v_p), 'district officer does not see the unassigned profile';
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_p), 'Kodad coordinator sees another mandal';
  RAISE NOTICE 'PASS 006.6 mandal without a coordinator -> district lineage officer queue (unassigned, still pending)';

  PERFORM pg_temp.as_user(pg_temp.n(5));
  ASSERT fn_propose_gothra('Kashyapa', NULL) = (SELECT id FROM gothra_master WHERE slug = 'kashyapa'), 'existing gothra re-proposed';
  v_p := fn_propose_gothra('  Kasyapa ', 'కశ్యప');
  ASSERT fn_propose_gothra('kasyapa', NULL) = v_p, 'duplicate proposal created';
  ASSERT NOT EXISTS (SELECT 1 FROM gothra_master WHERE id = v_p), 'unratified proposal visible before any profile uses it';
  BEGIN PERFORM fn_propose_gothra('Another Lineage', NULL); ASSERT false, 'second open proposal'; EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN PERFORM fn_propose_gothra('<script>', NULL); ASSERT false, 'junk gothra name'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.n(6));
  ASSERT fn_propose_gothra('Kasyapa', NULL) = v_p, 'other member duplicated the proposal';
  PERFORM pg_temp.draft(pg_temp.n(5), 'suryapet', 'kodad', v_p);
  PERFORM fn_submit_profile();
  ASSERT (SELECT is_verified = false FROM gothra_master WHERE id = v_p), 'proposal not visible to its own member';
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM gothra_master WHERE id = v_p), 'other members see an unratified proposal';
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  BEGIN
    UPDATE profiles SET status = 'verified' WHERE root_user_id = pg_temp.n(5);
    ASSERT false, 'verified a profile with an unratified gothra';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS 006.7 "Other / Propose Gothra": deduplicated, one open proposal per member, hidden from others, blocks verification until ratified';
END $$;

RESET ROLE;
SET LOCAL ROLE nsm_owner;
UPDATE gothra_master SET is_verified = true, lineage_group = 'kashyapa' WHERE slug = 'kasyapa';
RESET ROLE;
SET LOCAL ROLE nsm_app_user;

DO $$
BEGIN
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  UPDATE profiles SET status = 'verified' WHERE root_user_id IN (pg_temp.n(5), pg_temp.n(2));
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE root_user_id = pg_temp.n(5)), 'merged lineage not excluded for Kashyapa member';
  PERFORM pg_temp.act_as('D');
  ASSERT EXISTS (SELECT 1 FROM profiles WHERE root_user_id = pg_temp.n(5)), 'verified profile not discoverable';
  RAISE NOTICE 'PASS 006.8 once ratified and merged into the Kashyapa lineage, the profile verifies and Sagothra exclusion applies';

  PERFORM pg_temp.as_user(pg_temp.n(2));
  UPDATE profiles SET ancestral_native_mandal = 'huzurnagar' WHERE root_user_id = pg_temp.n(2);
  ASSERT (SELECT status = 'pending_mandal_review' AND assigned_coordinator_user_id IS NULL
            FROM profiles WHERE root_user_id = pg_temp.n(2)), 'identity edit not re-routed';
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE root_user_id = pg_temp.n(2)), 'old mandal coordinator still sees the moved profile';
  RAISE NOTICE 'PASS 006.9 changing ancestral mandal after verification returns the profile to review in the new mandal queue';
END $$;

RESET ROLE;
DO $$
BEGIN
  ASSERT fn_verify_consent_chain() IS NULL, 'consent chain broken';
  RAISE NOTICE 'PASS 006.10 consent ledger chain intact after onboarding writes';
END $$;

ROLLBACK;
