SET search_path = matrimony_shared, pg_temp;
-- 001: roles, schema, pgcrypto, shared helpers and the parent-isolation guard.
-- Bootstrap migration: runs as a superuser because it creates cluster roles and sets their
-- logging parameters. Later migrations run as nsm_migrator. psql variables required:
-- app_password, migrator_password, grievance_ro_password.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nsm_owner') THEN CREATE ROLE nsm_owner; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nsm_migrator') THEN CREATE ROLE nsm_migrator; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nsm_app_user') THEN CREATE ROLE nsm_app_user; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nsm_grievance_ro') THEN CREATE ROLE nsm_grievance_ro; END IF;
END $$;

-- nsm_owner owns every object and is reachable only through SET ROLE (migrator) or SECURITY DEFINER
-- functions. BYPASSRLS makes those functions the single, reviewed path around RLS; each one does
-- its own authorisation and auditing.
ALTER ROLE nsm_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS;
ALTER ROLE nsm_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  PASSWORD :'migrator_password';
ALTER ROLE nsm_app_user LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  CONNECTION LIMIT 50 PASSWORD :'app_password';
ALTER ROLE nsm_grievance_ro LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  CONNECTION LIMIT 5 PASSWORD :'grievance_ro_password';
GRANT nsm_owner TO nsm_migrator;

-- The contact key reaches Postgres as a bind parameter: keep statements and parameters out of logs.
ALTER ROLE nsm_app_user SET log_statement = 'none';
ALTER ROLE nsm_app_user SET log_min_duration_statement = -1;
ALTER ROLE nsm_app_user SET log_parameter_max_length = 0;
ALTER ROLE nsm_app_user SET log_parameter_max_length_on_error = 0;
ALTER ROLE nsm_app_user SET search_path = matrimony_shared, pg_temp;
ALTER ROLE nsm_app_user SET statement_timeout = '5s';
ALTER ROLE nsm_app_user SET idle_in_transaction_session_timeout = '15s';
ALTER ROLE nsm_grievance_ro SET search_path = matrimony_shared, pg_temp;
ALTER ROLE nsm_grievance_ro SET default_transaction_read_only = on;

CREATE SCHEMA IF NOT EXISTS matrimony_shared AUTHORIZATION nsm_owner;
REVOKE ALL ON SCHEMA matrimony_shared FROM PUBLIC;
GRANT USAGE ON SCHEMA matrimony_shared TO nsm_app_user, nsm_grievance_ro;

-- SECURITY DEFINER functions pin search_path to matrimony_shared, so pgcrypto must live here.
DO $$
DECLARE v_schema text;
BEGIN
  SELECT n.nspname INTO v_schema
    FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
   WHERE e.extname = 'pgcrypto';
  IF v_schema IS NOT NULL AND v_schema <> 'matrimony_shared' THEN
    RAISE EXCEPTION 'pgcrypto already installed in schema "%"; NSM needs it in matrimony_shared '
                    '(relocate it, or give NSM its own database)', v_schema;
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA matrimony_shared;

ALTER DEFAULT PRIVILEGES FOR ROLE nsm_owner REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

SET ROLE nsm_owner;

-- Deny-all by design: no grants and no policies; only nsm_owner (migration runner) touches it.
CREATE TABLE schema_migrations (
  filename   text CONSTRAINT pk_schema_migrations PRIMARY KEY,
  sha256     text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- Request identity: set per transaction by withTx() via set_config(..., true).
CREATE FUNCTION fn_current_user_id() RETURNS uuid
LANGUAGE sql STABLE SET search_path = matrimony_shared, pg_temp
AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

CREATE FUNCTION fn_current_roles() RETURNS text[]
LANGUAGE sql STABLE SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT array(SELECT jsonb_array_elements_text(nullif(current_setting('request.jwt.claim.roles', true), '')::jsonb))
$$;

CREATE FUNCTION fn_has_token_role(p_role text) RETURNS boolean
LANGUAGE sql STABLE SET search_path = matrimony_shared, pg_temp
AS $$ SELECT p_role = ANY (fn_current_roles()) $$;

CREATE FUNCTION fn_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = matrimony_shared, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE FUNCTION fn_reject_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = matrimony_shared, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (% rejected)', TG_TABLE_NAME, TG_OP USING ERRCODE = 'insufficient_privilege';
END $$;

-- Fails if any NSM role can reach a schema or table outside matrimony_shared.
-- Called at the end of every migration run and by the exit-gate suite.
CREATE FUNCTION fn_assert_isolation() RETURNS void
LANGUAGE plpgsql STABLE SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_role text;
  v_hit  text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['nsm_owner', 'nsm_migrator', 'nsm_app_user', 'nsm_grievance_ro'] LOOP
    SELECT n.nspname INTO v_hit
      FROM pg_namespace n
     WHERE n.nspname NOT IN ('matrimony_shared', 'public', 'information_schema')
       AND n.nspname NOT LIKE 'pg\_%'
       AND has_schema_privilege(v_role, n.oid, 'USAGE, CREATE')
     LIMIT 1;
    IF v_hit IS NOT NULL THEN
      RAISE EXCEPTION 'isolation violated: % has access to schema %', v_role, v_hit USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT format('%I.%I', n.nspname, c.relname) INTO v_hit
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
       AND n.nspname NOT IN ('matrimony_shared', 'information_schema')
       AND n.nspname NOT LIKE 'pg\_%'
       AND has_table_privilege(v_role, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
     LIMIT 1;
    IF v_hit IS NOT NULL THEN
      RAISE EXCEPTION 'isolation violated: % has privileges on %', v_role, v_hit USING ERRCODE = 'insufficient_privilege';
    END IF;
  END LOOP;
END $$;

SELECT fn_assert_isolation();
