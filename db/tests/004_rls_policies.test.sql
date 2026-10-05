\set ON_ERROR_STOP 1
BEGIN;
\ir fixtures.sql

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE n int;
BEGIN
  PERFORM pg_temp.act_as('A');
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('A')) = 'verified', 'fixture: A should be verified by M';

  UPDATE profiles SET display_name = 'Arjun K' WHERE id = pg_temp.p('A');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 1, 'owner could not update own profile';
  UPDATE profiles SET display_name = 'hijacked' WHERE id = pg_temp.p('B');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'A updated B';
  DELETE FROM profiles WHERE id = pg_temp.p('B');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'A deleted B';
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES (pg_temp.u('X'), 'NS-TG-SRPT-10009', 'Not Mine', 'female', date '1996-01-01',
            (SELECT id FROM gothra_master WHERE slug = 'gautama'), 'suryapet', 'kodad', 'scholarly_academic');
    ASSERT false, 'A created a profile for X';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN UPDATE profiles SET status = 'suspended' WHERE id = pg_temp.p('A');      ASSERT false, 'owner changed own review status'; EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN UPDATE profiles SET review_note = 'self-approved' WHERE id = pg_temp.p('A'); ASSERT false, 'owner wrote review_note';      EXCEPTION WHEN check_violation THEN NULL; END;
  RAISE NOTICE 'PASS 004.1 Policy 1 (self): owner reads/updates own row only; cannot write others, self-review or create rows for others';

  ASSERT (SELECT array_agg(root_user_id ORDER BY root_user_id) FROM profiles WHERE root_user_id <> pg_temp.u('A'))
         = ARRAY[pg_temp.u('B'), pg_temp.u('D')], 'A must discover exactly B and D';
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('C')), 'A fetched Sagothra C by id';
  ASSERT NOT EXISTS (SELECT 1 FROM profiles p JOIN gothra_master g ON g.id = p.gothra_id
                      WHERE g.slug = 'kashyapa' AND p.root_user_id <> pg_temp.u('A')), 'A sees another Kashyapa profile';
  PERFORM pg_temp.act_as('C');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('A')), 'C sees Sagothra A';
  PERFORM pg_temp.act_as('X');
  ASSERT (SELECT count(*) FROM profiles) = 0, 'a member without a verified profile discovered something';
  RAISE NOTICE 'PASS 004.2 Policy 2 (Sagothra): same-lineage profiles are invisible, even by direct id lookup; no profile = no discovery';
END $$;

RESET ROLE;
SET LOCAL ROLE nsm_owner;
UPDATE gothra_master SET lineage_group = 'kashyapa' WHERE slug = 'bharadwaja';
RESET ROLE;
SET LOCAL ROLE nsm_app_user;
DO $$
BEGIN
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('B')), 'merged lineage group did not exclude B';
  RAISE NOTICE 'PASS 004.3 exclusion follows lineage_group: merging two gothras into one lineage hides them from each other';
END $$;
RESET ROLE;
SET LOCAL ROLE nsm_owner;
UPDATE gothra_master SET lineage_group = 'bharadwaja' WHERE slug = 'bharadwaja';
RESET ROLE;

SET LOCAL ROLE nsm_app_user;
DO $$
DECLARE n int;
BEGIN
  PERFORM pg_temp.act_as('B');
  UPDATE profiles SET gothra_id = (SELECT id FROM gothra_master WHERE slug = 'kashyapa') WHERE id = pg_temp.p('B');
  ASSERT (SELECT status FROM profiles WHERE id = pg_temp.p('B')) = 'pending_mandal_review', 'gothra change kept verified status';
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE id = pg_temp.p('B')), 'unreviewed B still discoverable';
  RAISE NOTICE 'PASS 004.4 changing gothra after verification forces re-review and drops the profile from discovery';

  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  ASSERT (SELECT array_agg(root_user_id ORDER BY root_user_id) FROM profiles)
         = ARRAY[pg_temp.u('A'), pg_temp.u('B')], 'Kodad coordinator must see exactly A and B';
  UPDATE profiles SET status = 'suspended' WHERE id = pg_temp.p('D');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'M updated a Hyderabad profile';
  UPDATE profiles SET status = 'suspended' WHERE id = pg_temp.p('C');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'M updated a Huzurnagar profile';
  UPDATE profiles SET display_name = 'edited by coordinator' WHERE id = pg_temp.p('A');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'coordinator updated a profile that is not under review';
  BEGIN
    UPDATE profiles SET display_name = 'edited by coordinator' WHERE id = pg_temp.p('B');
    ASSERT false, 'coordinator edited member data';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS 004.5 Policy 3 (mandal scope): Kodad coordinator sees only Kodad, cannot touch Huzurnagar/Hyderabad, cannot edit member data';
END $$;

-- B is locked while pending review (006); the operator restores the original gothra.
RESET ROLE;
SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
UPDATE profiles SET gothra_id = (SELECT id FROM gothra_master WHERE slug = 'bharadwaja') WHERE id = pg_temp.p('B');
RESET ROLE;
SET LOCAL ROLE nsm_app_user;

DO $$
DECLARE n int;
BEGIN
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  UPDATE profiles SET status = 'verified', review_note = 'gothra re-checked with family' WHERE id = pg_temp.p('B');
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 1, 'coordinator could not verify an in-scope profile';
  ASSERT (SELECT reviewed_by FROM profiles WHERE id = pg_temp.p('B')) = pg_temp.u('M'), 'reviewed_by not stamped';
  RAISE NOTICE 'PASS 004.6 coordinator verifies in-scope profiles; reviewer identity is stamped by the database';

  PERFORM pg_temp.act_as('L', '["member","district_lineage_officer"]');
  ASSERT (SELECT array_agg(root_user_id ORDER BY root_user_id) FROM profiles)
         = ARRAY[pg_temp.u('A'), pg_temp.u('B'), pg_temp.u('C')], 'Suryapet officer must see A, B, C';
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE ancestral_native_district = 'hyderabad'), 'Suryapet officer sees Hyderabad';
  RAISE NOTICE 'PASS 004.7 district lineage officer sees all Suryapet mandals and nothing from another district';

  PERFORM pg_temp.act_as('M');
  ASSERT (SELECT count(*) FROM profiles) = 0, 'assignment without token role granted scope';
  PERFORM pg_temp.act_as('X', '["member","mandal_coordinator"]');
  ASSERT (SELECT count(*) FROM profiles) = 0, 'token role without assignment granted scope';
  RAISE NOTICE 'PASS 004.8 coordinator scope needs BOTH the sub_admins assignment and the token role';
END $$;

DO $$
BEGIN
  PERFORM pg_temp.act_as('X');
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation, status)
    VALUES (pg_temp.u('X'), 'NS-TG-SRPT-10005', 'Self Verified', 'female', date '1999-01-01',
            (SELECT id FROM gothra_master WHERE slug = 'gautama'), 'suryapet', 'kodad', 'scholarly_academic', 'verified');
    ASSERT false, 'member inserted a pre-verified profile';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, ancestral_native_district, ancestral_native_mandal, vocation)
  VALUES (pg_temp.u('X'), 'NS-TG-SRPT-10005', 'Draft Member', 'female', date '1999-01-01',
          (SELECT id FROM gothra_master WHERE slug = 'gautama'), 'suryapet', 'kodad', 'scholarly_academic');
  ASSERT (SELECT status FROM profiles WHERE root_user_id = pg_temp.u('X')) = 'draft', 'new profile not in draft';
  PERFORM pg_temp.act_as('M', '["member","mandal_coordinator"]');
  ASSERT NOT EXISTS (SELECT 1 FROM profiles WHERE root_user_id = pg_temp.u('X')), 'coordinator sees an unsubmitted draft';
  RAISE NOTICE 'PASS 004.9 members create only their own draft (status cannot be supplied); coordinators never see drafts';
END $$;

DO $$
DECLARE v_i uuid; v_t uuid;
BEGIN
  PERFORM pg_temp.act_as('A');
  BEGIN INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('A'), pg_temp.p('C')); ASSERT false, 'interest to Sagothra C';  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('B'), pg_temp.p('D')); ASSERT false, 'A sent as B';               EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('A'), pg_temp.p('A')); ASSERT false, 'interest to self';           EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO interests (from_profile_id, to_profile_id) VALUES (pg_temp.p('A'), pg_temp.p('B')) RETURNING id INTO v_i;
  BEGIN UPDATE interests SET status = 'accepted' WHERE id = v_i;               ASSERT false, 'sender accepted own interest'; EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN UPDATE interests SET sender_contact_consent_at = now() WHERE id = v_i; ASSERT false, 'app wrote consent flag';      EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM pg_temp.act_as('D');
  ASSERT NOT EXISTS (SELECT 1 FROM interests WHERE id = v_i), 'third party sees the interest';
  PERFORM pg_temp.act_as('B');
  UPDATE interests SET status = 'accepted' WHERE id = v_i;
  BEGIN UPDATE interests SET status = 'contact_unlocked' WHERE id = v_i; ASSERT false, 'unlocked without consents'; EXCEPTION WHEN check_violation THEN NULL; END;
  RAISE NOTICE 'PASS 004.10 interests: no Sagothra/self targets, no impersonation, only recipient accepts, flags not app-writable, private to the pair';

  INSERT INTO grievance_tickets (complainant_user_id, subject_profile_id, category, description)
  VALUES (pg_temp.u('B'), pg_temp.p('A'), 'misconduct', 'Test ticket') RETURNING id INTO v_t;
  PERFORM pg_temp.act_as('A');
  ASSERT NOT EXISTS (SELECT 1 FROM grievance_tickets WHERE id = v_t), 'A sees B''s ticket';
  PERFORM pg_temp.act_as('G', '["member","grievance_officer"]');
  ASSERT EXISTS (SELECT 1 FROM grievance_tickets WHERE id = v_t), 'grievance officer cannot see ticket';
  PERFORM pg_temp.act_as('G');
  ASSERT NOT EXISTS (SELECT 1 FROM grievance_tickets WHERE id = v_t), 'officer access without token role';
  RAISE NOTICE 'PASS 004.11 grievance tickets: complainant + verified grievance officer only';
END $$;

ROLLBACK;
