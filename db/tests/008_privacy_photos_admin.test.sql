\set ON_ERROR_STOP 1
BEGIN;
\ir fixtures.sql

-- Fixtures: A Kashyapa / B Bharadwaja / C Kashyapa (Sagothra with A) in Suryapet, D Vasishtha in
-- Hyderabad, all verified. M = Kodad coordinator, L = Suryapet lineage officer, G = grievance officer.
-- Added here: G2 second grievance officer, H Hyderabad/Secunderabad coordinator, members n(i).
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
CREATE FUNCTION pg_temp.submitted(who uuid, p_district text, p_mandal text, p_gothra uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_id uuid;
BEGIN
  PERFORM pg_temp.as_user(who);
  INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
                        ancestral_native_district, ancestral_native_mandal, vocation, education_degree, occupation, income_bracket)
  VALUES (who, 'NS-TG-SRPT-20001', 'Phase Four Member', 'female', current_date - interval '25 years',
          coalesce(p_gothra, (SELECT id FROM gothra_master WHERE slug = 'gautama')),
          p_district, p_mandal, 'scholarly_academic', 'M.A. Telugu', 'Lecturer', '6l_12l')
  RETURNING id INTO v_id;
  PERFORM fn_set_contact_details('+919800000001', NULL, NULL, '1 Test Street');
  PERFORM pg_temp.consent(who, 'community_pledge');
  PERFORM pg_temp.consent(who, 'profile_processing');
  PERFORM pg_temp.consent(who, 'coordinator_verification');
  PERFORM fn_submit_profile();
  RETURN v_id;
END $$;
CREATE FUNCTION pg_temp.photo(viewer uuid, target uuid, roles text DEFAULT '["member"]') RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_temp.as_user(viewer, roles);
  RETURN coalesce((SELECT variant FROM fn_photo_access(target)), 'none');
END $$;

SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
INSERT INTO sub_admins (root_user_id, role, district, mandal, assigned_by) VALUES
  (pg_temp.n(91), 'grievance_officer',  NULL,        NULL,           pg_temp.u('ADMIN')),
  (pg_temp.n(92), 'mandal_coordinator', 'hyderabad', 'secunderabad', pg_temp.u('ADMIN'));
RESET ROLE;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE
  c_m  constant text := '["member","mandal_coordinator"]';
  v_i  uuid;
  v_ok boolean;
BEGIN
  -- B: blurred preview, photo needs its own consent; a new photo sends a verified profile back to review.
  PERFORM pg_temp.act_as('B');
  UPDATE profiles SET photo_visibility = 'blurred' WHERE id = pg_temp.p('B');
  BEGIN PERFORM fn_set_profile_photo(gen_random_uuid()); ASSERT false, 'photo without photo_display consent'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.consent(pg_temp.u('B'), 'photo_display');
  PERFORM fn_set_profile_photo('40000000-0000-4000-8000-00000000000b');
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('B')) = 'pending_mandal_review', 'new photo kept verified status';
  BEGIN PERFORM photo_object_id FROM profiles WHERE id = pg_temp.p('B'); ASSERT false, 'app read photo_object_id'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  ASSERT pg_temp.photo(pg_temp.u('M'), pg_temp.p('B'), c_m) = 'full', 'reviewing coordinator must see the photo';
  ASSERT pg_temp.photo(pg_temp.n(92), pg_temp.p('B'), c_m) = 'none', 'out-of-scope coordinator saw a photo';
  PERFORM pg_temp.act_as('M', c_m);
  UPDATE profiles SET status = 'verified' WHERE id = pg_temp.p('B');
  ASSERT pg_temp.photo(pg_temp.u('M'), pg_temp.p('B'), c_m) = 'none', 'coordinator kept full photo access after verification';
  -- A: public photo.
  PERFORM pg_temp.act_as('A');
  UPDATE profiles SET photo_visibility = 'public_verified' WHERE id = pg_temp.p('A');
  PERFORM pg_temp.consent(pg_temp.u('A'), 'photo_display');
  PERFORM fn_set_profile_photo('40000000-0000-4000-8000-00000000000a');
  PERFORM pg_temp.act_as('M', c_m);
  UPDATE profiles SET status = 'verified' WHERE id = pg_temp.p('A');

  ASSERT pg_temp.photo(pg_temp.u('B'), pg_temp.p('B')) = 'full', 'owner must see own photo';
  ASSERT pg_temp.photo(pg_temp.u('A'), pg_temp.p('B')) = 'blurred', 'blurred photo leaked in full';
  ASSERT pg_temp.photo(pg_temp.u('D'), pg_temp.p('B')) = 'blurred', 'other verified member must get the blurred preview';
  ASSERT pg_temp.photo(pg_temp.u('B'), pg_temp.p('A')) = 'full', 'public_verified photo hidden';
  ASSERT pg_temp.photo(pg_temp.u('C'), pg_temp.p('A')) = 'none', 'Sagothra member saw a photo';
  ASSERT pg_temp.photo(pg_temp.u('X'), pg_temp.p('A')) = 'none', 'member without profile saw a photo';
  PERFORM pg_temp.act_as('B');
  UPDATE profiles SET photo_visibility = 'on_request' WHERE id = pg_temp.p('B');
  ASSERT pg_temp.photo(pg_temp.u('A'), pg_temp.p('B')) = 'none', 'on_request photo shown without approval';
  PERFORM pg_temp.act_as('A');
  INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('A'), pg_temp.p('B')) RETURNING id INTO v_i;
  ASSERT pg_temp.photo(pg_temp.u('A'), pg_temp.p('B')) = 'none', 'photo shown on a mere expression of interest';
  PERFORM pg_temp.act_as('B');
  UPDATE interests SET status = 'accepted' WHERE id = v_i;
  ASSERT pg_temp.photo(pg_temp.u('A'), pg_temp.p('B')) = 'full', 'accepted interest must unlock the full photo';
  RAISE NOTICE 'PASS 008.1 photo access: owner full, reviewer full only while reviewing; blurred or nothing for others per visibility; full only after an accepted interest; never for Sagothra, profile-less or out-of-scope viewers';

  PERFORM pg_temp.act_as('A');
  PERFORM fn_grant_contact_share(v_i, 'v1.en', 'share', '203.0.113.9', 'sql-test');
  PERFORM pg_temp.act_as('B');
  PERFORM fn_grant_contact_share(v_i, 'v1.en', 'share', '203.0.113.9', 'sql-test');
  PERFORM pg_temp.act_as('D');
  INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('D'), pg_temp.p('B'));
  -- One-click withdrawal of profile processing consent.
  PERFORM pg_temp.act_as('B');
  PERFORM pg_temp.consent(pg_temp.u('B'), 'profile_processing', false);
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('B')) = 'suspended', 'withdrawal did not suspend';
  BEGIN
    UPDATE interests SET status = 'accepted' WHERE to_profile_id = pg_temp.p('B') AND from_profile_id = pg_temp.p('D');
    ASSERT false, 'suspended member accepted an interest';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN PERFORM unmask_contact_details(pg_temp.p('A')); ASSERT false, 'suspended member unmasked a match'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('B')), 'suspended profile still discoverable';
  BEGIN PERFORM unmask_contact_details(pg_temp.p('B')); ASSERT false, 'unmasked a suspended member'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('M', c_m);
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('B')), 'coordinator still processes a suspended profile';
  PERFORM pg_temp.act_as('B');
  BEGIN UPDATE profiles SET status = 'verified' WHERE id = pg_temp.p('B'); ASSERT false, 'member un-suspended directly'; EXCEPTION WHEN check_violation THEN NULL; END;
  UPDATE profiles SET education_degree = 'B.Sc.', occupation = 'Teacher', income_bracket = '6l_12l' WHERE id = pg_temp.p('B');
  PERFORM fn_set_contact_details('+919800000002', NULL, NULL, '2 Test Street');
  PERFORM pg_temp.consent(pg_temp.u('B'), 'community_pledge');
  PERFORM pg_temp.consent(pg_temp.u('B'), 'coordinator_verification');
  BEGIN PERFORM fn_submit_profile(); ASSERT false, 'resumed without consent'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.consent(pg_temp.u('B'), 'profile_processing');
  PERFORM fn_submit_profile();
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('B')) = 'pending_mandal_review', 'resume must go back to review';
  PERFORM pg_temp.consent(pg_temp.u('B'), 'photo_display', false);
  ASSERT pg_temp.photo(pg_temp.u('B'), pg_temp.p('B')) = 'none', 'photo kept after photo consent withdrawal';
  RAISE NOTICE 'PASS 008.2 consent withdrawal (one ledger row) suspends at once: hidden from members and coordinators, no accepting, no unmasking either way; resume only by re-consent + re-review; photo consent withdrawal drops the photo';
END $$;

DO $$
DECLARE
  c_m  constant text := '["member","mandal_coordinator"]';
  c_l  constant text := '["member","district_lineage_officer"]';
  v_p1 uuid;
  v_p2 uuid;
  v_n  int;
BEGIN
  v_p1 := pg_temp.submitted(pg_temp.n(1), 'suryapet', 'kodad');
  ASSERT (SELECT assigned_coordinator_user_id FROM profiles WHERE id = v_p1) = pg_temp.u('M'), 'n1 not routed to M';
  v_p2 := pg_temp.submitted(pg_temp.n(2), 'suryapet', 'munagala');   -- no coordinator: district queue

  PERFORM pg_temp.as_user(pg_temp.u('M'), c_m);
  ASSERT unmask_door_address(v_p1) = '1 Test Street', 'assigned coordinator cannot read the door address';
  ASSERT (SELECT count(*) FROM audit_access_logs WHERE target_profile_id = v_p1) = 0, 'coordinator can read the audit log';
  BEGIN PERFORM unmask_door_address(v_p2); ASSERT false, 'coordinator read an unassigned profile address'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.u('M'));
  BEGIN PERFORM unmask_door_address(v_p1); ASSERT false, 'read without the coordinator token role'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.u('L'), c_l);
  BEGIN PERFORM unmask_door_address(v_p1); ASSERT false, 'officer read a profile assigned to M'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  ASSERT unmask_door_address(v_p2) = '1 Test Street', 'officer cannot read an unassigned district-queue address';
  PERFORM pg_temp.as_user(pg_temp.n(92), c_m);
  BEGIN PERFORM unmask_door_address(v_p1); ASSERT false, 'Hyderabad coordinator read a Suryapet address'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('A');
  BEGIN PERFORM unmask_door_address(v_p1); ASSERT false, 'member read a door address'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.n(1));
  ASSERT (SELECT count(*) FROM audit_access_logs WHERE target_profile_id = v_p1 AND basis = 'field_verification'
            AND viewer_user_id = pg_temp.u('M')) = 1, 'door address read not audited / not visible to the member';
  PERFORM pg_temp.as_user(pg_temp.u('M'), c_m);
  BEGIN UPDATE profiles SET status = 'rejected' WHERE id = v_p1; ASSERT false, 'rejected without a reason'; EXCEPTION WHEN check_violation THEN NULL; END;
  UPDATE profiles SET status = 'verified' WHERE id = v_p1;
  BEGIN PERFORM unmask_door_address(v_p1); ASSERT false, 'address readable after verification'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  UPDATE profiles SET status = 'suspended' WHERE id = v_p1;
  GET DIAGNOSTICS v_n = ROW_COUNT; ASSERT v_n = 0, 'coordinator suspended a verified member';
  RAISE NOTICE 'PASS 008.3 door address: only the assigned coordinator (or the district officer for unassigned profiles), only under review, token role required, every read audited and visible to the member';
END $$;

DO $$
DECLARE
  c_g  constant text := '["member","grievance_officer"]';
  v_t  uuid;
  v_a  uuid;
  v_ph uuid;
BEGIN
  -- C asks for erasure of her own profile.
  PERFORM pg_temp.act_as('C');
  PERFORM pg_temp.consent(pg_temp.u('C'), 'community_pledge');
  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('C'), pg_temp.p('C'), 'data_erasure', 'Please erase my data.') RETURNING id INTO v_t;
  PERFORM pg_temp.act_as('G', c_g);
  UPDATE grievance_tickets SET assigned_officer_user_id = pg_temp.u('G'), status = 'in_progress' WHERE id = v_t;
  v_a := fn_propose_grievance_action(v_t, 'erase_profile', 'Verified request from the data principal.');
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('C')) IS NULL, 'grievance officer sees member profiles';
  BEGIN PERFORM fn_approve_grievance_action(v_a); ASSERT false, 'proposer approved own erasure'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('A');
  BEGIN PERFORM fn_approve_grievance_action(v_a); ASSERT false, 'member approved an erasure'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.n(91), c_g);
  BEGIN INSERT INTO grievance_actions (ticket_id, action, note, proposed_by) VALUES (v_t, 'resolve', 'x', pg_temp.n(91)); ASSERT false, 'app wrote grievance_actions'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM fn_approve_grievance_action(v_a);
  ASSERT (SELECT approved_by FROM grievance_actions WHERE id = v_a) = pg_temp.n(91), 'second officer not recorded';

  -- Erasure only for the complainant's own profile.
  PERFORM pg_temp.act_as('A');
  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('A'), pg_temp.p('D'), 'data_erasure', 'Erase D.') RETURNING id INTO v_t;
  PERFORM pg_temp.act_as('G', c_g);
  UPDATE grievance_tickets SET assigned_officer_user_id = pg_temp.u('G') WHERE id = v_t;
  BEGIN PERFORM fn_propose_grievance_action(v_t, 'erase_profile', 'no'); ASSERT false, 'erasure of somebody else'; EXCEPTION WHEN check_violation THEN NULL; END;

  -- Unauthorized photo report against A.
  PERFORM pg_temp.act_as('D');
  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('D'), pg_temp.p('A'), 'unauthorized_photo', 'This photo is of my cousin.') RETURNING id INTO v_t;
  PERFORM pg_temp.act_as('G', c_g);
  UPDATE grievance_tickets SET assigned_officer_user_id = pg_temp.u('G') WHERE id = v_t;
  ASSERT pg_temp.photo(pg_temp.u('G'), pg_temp.p('A'), c_g) = 'full', 'assigned officer cannot inspect the reported photo';
  PERFORM pg_temp.act_as('G', c_g);
  v_a := fn_propose_grievance_action(v_t, 'remove_photo', 'Photo does not show the member.');
  PERFORM pg_temp.as_user(pg_temp.n(91), c_g);
  v_ph := fn_approve_grievance_action(v_a);
  ASSERT v_ph = '40000000-0000-4000-8000-00000000000a', 'photo object id not returned for deletion';
  ASSERT pg_temp.photo(pg_temp.u('A'), pg_temp.p('A')) = 'none', 'photo still referenced after takedown';
END $$;
RESET ROLE;

SET LOCAL ROLE nsm_owner;
DO $$
BEGIN
  ASSERT (SELECT status = 'erased' AND display_name = 'Erased member' AND gender IS NULL AND date_of_birth IS NULL AND gothra_id IS NULL
                 AND phone_enc IS NULL AND email_enc IS NULL AND whatsapp_enc IS NULL AND door_address_enc IS NULL AND photo_object_id IS NULL
            FROM profiles WHERE id = pg_temp.p('C')), 'erasure left personal data';
  ASSERT EXISTS (SELECT 1 FROM dpdp_consent_logs WHERE root_user_id = pg_temp.u('C')), 'erasure removed the consent ledger';
  ASSERT (SELECT count(*) FROM grievance_actions WHERE approved_by IS NOT NULL) = 2, 'grievance trail incomplete';
  ASSERT fn_verify_consent_chain() IS NULL, 'consent chain broken';
  BEGIN DELETE FROM grievance_actions; ASSERT false, 'grievance trail deletable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 008.4 erasure and photo takedown need a second, uninvolved grievance officer; erasure only on the member''s own request; erased profile keeps no personal data; trail and ledger remain';
END $$;
RESET ROLE;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE
  c_m  constant text := '["member","mandal_coordinator"]';
  c_l  constant text := '["member","district_lineage_officer"]';
  v_g  uuid;
  v_p  uuid;
BEGIN
  PERFORM pg_temp.as_user(pg_temp.n(3));
  v_g := fn_propose_gothra('Kasyapa', NULL);
  v_p := pg_temp.submitted(pg_temp.n(3), 'suryapet', 'kodad', v_g);
  PERFORM pg_temp.as_user(pg_temp.n(92), c_m);
  BEGIN PERFORM fn_resolve_gothra_proposal(v_g, NULL); ASSERT false, 'coordinator resolved a gothra'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.u('M'), c_m);
  BEGIN UPDATE profiles SET status = 'verified' WHERE id = v_p; ASSERT false, 'verified on an unratified gothra'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM pg_temp.as_user(pg_temp.u('L'), c_l);
  BEGIN PERFORM fn_resolve_gothra_proposal(v_g, v_g); ASSERT false, 'merged into itself'; EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM fn_resolve_gothra_proposal(v_g, (SELECT id FROM gothra_master WHERE slug = 'kashyapa'));
  ASSERT (SELECT is_verified AND NOT active AND lineage_group = 'kashyapa' AND resolved_by = pg_temp.u('L')
            FROM gothra_master WHERE id = v_g), 'merge not applied';
  PERFORM pg_temp.as_user(pg_temp.u('M'), c_m);
  UPDATE profiles SET status = 'verified' WHERE id = v_p;
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_p), 'merged-lineage profile visible to a Kashyapa member';
  RAISE NOTICE 'PASS 008.5 only the district lineage officer resolves proposals; a merge joins the lineage (Sagothra exclusion applies) and unblocks verification';
END $$;
RESET ROLE;

SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
                      ancestral_native_district, ancestral_native_mandal, vocation, status)
SELECT pg_temp.n(100 + i), 'NS-TG-SRPT-3' || lpad(i::text, 4, '0'), 'Target', 'female', current_date - interval '24 years',
       (SELECT id FROM gothra_master WHERE slug = 'atreya'), 'suryapet', 'kodad', 'nadopasana', 'verified'
  FROM generate_series(1, 11) i;
RESET ROLE;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE
  v_sent int := 0;
  i      int;
BEGIN
  PERFORM pg_temp.act_as('A');
  FOR i IN 1..11 LOOP
    BEGIN
      INSERT INTO interests (from_profile_id, to_profile_id)
      SELECT pg_temp.p('A'), id FROM profiles WHERE root_user_id = pg_temp.n(100 + i);
      v_sent := v_sent + 1;
    EXCEPTION WHEN program_limit_exceeded THEN EXIT;
    END;
  END LOOP;
  ASSERT (SELECT count(*) FROM interests WHERE from_profile_id = pg_temp.p('A')) = 10, 'daily interest cap not enforced';
  RAISE NOTICE 'PASS 008.6 at most 10 expressions of interest per member per day';
END $$;
ROLLBACK;
