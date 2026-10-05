\set ON_ERROR_STOP 1
BEGIN;
SET LOCAL search_path = matrimony_shared, pg_temp;
SET LOCAL ROLE nsm_app_user;

DO $$
BEGIN
  ASSERT (SELECT count(*) FROM gothra_master WHERE active) = 22, 'expected 22 seeded gothras';
  ASSERT NOT EXISTS (SELECT 1 FROM gothra_master WHERE NOT is_verified), 'seeded baseline must be verified (decision 2026-10-04)';
  ASSERT NOT EXISTS (SELECT 1 FROM gothra_master WHERE btrim(name_te) = '' OR btrim(name_en) = ''), 'bilingual names required';
  RAISE NOTICE 'PASS 002.1 22 verified baseline gothras seeded with English + Telugu names and a lineage_group';

  BEGIN
    INSERT INTO gothra_master (slug, name_en, name_te, lineage_group) VALUES ('fake', 'Fake', 'ఫేక్', 'fake');
    ASSERT false, 'nsm_app_user wrote to gothra_master';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS 002.2 nsm_app_user can read but not modify gothra_master';
END $$;

ROLLBACK;
