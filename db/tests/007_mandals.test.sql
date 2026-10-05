\set ON_ERROR_STOP 1
BEGIN;
SET LOCAL search_path = matrimony_shared, pg_temp;
SET LOCAL ROLE nsm_app_user;
DO $$
BEGIN
  ASSERT (SELECT count(DISTINCT district) FROM mandals) = 33, 'every district has mandals';
  ASSERT (SELECT count(*) FROM mandals) >= 600, 'standard mandal list seeded';
  ASSERT EXISTS (SELECT 1 FROM mandals WHERE district = 'suryapet' AND slug = 'kodad'), 'Kodad missing';
  ASSERT (SELECT array_agg(code ORDER BY code) FROM districts WHERE slug IN ('suryapet', 'hyderabad', 'nalgonda', 'warangal', 'khammam'))
         = '{HYDB,KMMM,NLGD,SRPT,WRGL}', 'ratified district codes';
  PERFORM set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000700', true);
  PERFORM set_config('request.jwt.claim.roles', '["member"]', true);
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
                          ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES ('30000000-0000-4000-8000-000000000700', 'NS-TG-SRPT-70001', 'Typo Member', 'female', current_date - interval '25 years',
            (SELECT id FROM gothra_master WHERE slug = 'gautama'), 'suryapet', 'kodadd', 'nadopasana');
    ASSERT false, 'free-text mandal accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO profiles (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
                          ancestral_native_district, ancestral_native_mandal, vocation)
    VALUES ('30000000-0000-4000-8000-000000000700', 'NS-TG-SRPT-70001', 'Wrong District', 'female', current_date - interval '25 years',
            (SELECT id FROM gothra_master WHERE slug = 'gautama'), 'hyderabad', 'kodad', 'nadopasana');
    ASSERT false, 'mandal accepted under the wrong district';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
  RAISE NOTICE 'PASS 007.1 33 districts with ratified codes and a standard mandal list; profiles accept only a listed mandal of their district';
END $$;
ROLLBACK;
