\set ON_ERROR_STOP 1
BEGIN;
SET LOCAL search_path = matrimony_shared, pg_temp;

DO $$
BEGIN
  ASSERT (SELECT rolcanlogin AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcreaterole AND NOT rolcreatedb
            FROM pg_roles WHERE rolname = 'nsm_app_user'), 'nsm_app_user must be LOGIN NOSUPERUSER NOBYPASSRLS';
  ASSERT NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE member = 'nsm_app_user'::regrole), 'nsm_app_user must not inherit any role';
  ASSERT NOT EXISTS (SELECT 1 FROM pg_class WHERE relowner = 'nsm_app_user'::regrole), 'nsm_app_user must own nothing';
  ASSERT NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'matrimony_shared' AND c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)),
    'every matrimony_shared table must ENABLE + FORCE row level security';
  RAISE NOTICE 'PASS 001.1 nsm_app_user is LOGIN/NOSUPERUSER/NOBYPASSRLS, owns nothing; every table has RLS enabled+forced';
END $$;

SET LOCAL ROLE nsm_app_user;
DO $$
BEGIN
  BEGIN PERFORM 1 FROM portal.members;          ASSERT false, 'read portal.members';          EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM portal.loans;            ASSERT false, 'read portal.loans';            EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM portal.telemetry_events; ASSERT false, 'read portal.telemetry_events'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.portal_sessions;  ASSERT false, 'read public.portal_sessions';  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN CREATE TABLE public.nsm_leak (id int);  ASSERT false, 'created a table in public';    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS 001.2 nsm_app_user cannot read parent members/loans/telemetry/sessions or create objects outside its schema';
END $$;

RESET ROLE;
DO $$
BEGIN
  PERFORM matrimony_shared.fn_assert_isolation();
  RAISE NOTICE 'PASS 001.3 fn_assert_isolation: no NSM role holds any privilege outside matrimony_shared';
END $$;

GRANT SELECT ON portal.loans TO PUBLIC;
DO $$
BEGIN
  BEGIN
    PERFORM matrimony_shared.fn_assert_isolation();
    ASSERT false, 'isolation guard missed a parent table granted to PUBLIC';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS 001.4 isolation guard trips as soon as a parent table becomes reachable (e.g. GRANT ... TO PUBLIC)';
END $$;

ROLLBACK;
