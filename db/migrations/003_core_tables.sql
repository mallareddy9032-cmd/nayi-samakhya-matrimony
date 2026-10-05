SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 003: core tables, invariants and guard triggers.
-- RLS is enabled here (deny-all); grants and policies arrive in 004.

CREATE TYPE gender           AS ENUM ('male', 'female');
CREATE TYPE profile_status   AS ENUM ('draft', 'pending_mandal_review', 'verified', 'rejected', 'suspended');
CREATE TYPE vocation         AS ENUM ('nadopasana', 'wellness_artisan', 'salon_entrepreneur', 'corporate', 'government', 'other');
CREATE TYPE interest_status  AS ENUM ('sent', 'accepted', 'declined', 'withdrawn', 'expired', 'contact_unlocked');
CREATE TYPE consent_purpose  AS ENUM ('profile_processing', 'photo_display', 'coordinator_verification', 'contact_share');
CREATE TYPE sub_admin_role   AS ENUM ('mandal_coordinator', 'district_lineage_officer', 'grievance_officer');
CREATE TYPE grievance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE access_basis     AS ENUM ('mutual_interest', 'grievance');

-- ---------------------------------------------------------------------------------------- profiles
CREATE TABLE profiles (
  id               uuid CONSTRAINT pk_profiles PRIMARY KEY DEFAULT gen_random_uuid(),
  root_user_id     uuid NOT NULL CONSTRAINT uq_profiles_root_user_id UNIQUE,
  ns_membership_id text NOT NULL
                     CONSTRAINT ck_profiles_ns_membership_id CHECK (ns_membership_id ~ '^NS-[A-Z]{2}-[A-Z]{2,8}-[0-9]{1,12}$'),
  display_name     text NOT NULL CONSTRAINT ck_profiles_display_name CHECK (length(btrim(display_name)) BETWEEN 1 AND 80),
  gender           gender NOT NULL,
  date_of_birth    date NOT NULL CONSTRAINT ck_profiles_date_of_birth CHECK (date_of_birth > date '1940-01-01'),
  gothra_id        uuid NOT NULL CONSTRAINT fk_profiles_gothra_id REFERENCES gothra_master (id),
  district         text NOT NULL CONSTRAINT ck_profiles_district CHECK (district ~ '^[a-z][a-z-]{1,40}$'),
  mandal           text NOT NULL CONSTRAINT ck_profiles_mandal CHECK (mandal ~ '^[a-z][a-z-]{1,40}$'),
  vocation         vocation NOT NULL,
  status           profile_status NOT NULL DEFAULT 'draft',
  phone_enc        bytea,
  email_enc        bytea,
  whatsapp_enc     bytea,
  door_address_enc bytea,
  reviewed_by      uuid,
  reviewed_at      timestamptz,
  review_note      text CONSTRAINT ck_profiles_review_note CHECK (length(review_note) <= 500),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  -- Prohibition of Child Marriage Act, 2006: 21 (male) / 18 (female). Re-checked on every write;
  -- a row valid at insert stays valid because age only grows.
  CONSTRAINT ck_profiles_legal_marriage_age CHECK (
    date_of_birth <= current_date - CASE gender WHEN 'male' THEN interval '21 years' ELSE interval '18 years' END)
);
COMMENT ON COLUMN profiles.root_user_id     IS 'Parent SSO sub (uuid). Immutable key for the person across matrimony_shared.';
COMMENT ON COLUMN profiles.ns_membership_id IS 'Purpose: display/reference and coordinator cross-check against parent records.';
COMMENT ON COLUMN profiles.display_name     IS 'Purpose: shown to matches and coordinators.';
COMMENT ON COLUMN profiles.gender           IS 'Purpose: legal-age gate and match filtering.';
COMMENT ON COLUMN profiles.date_of_birth    IS 'Purpose: legal-age gate; discovery shows age only, never the date.';
COMMENT ON COLUMN profiles.gothra_id        IS 'Paternal gothra. Purpose: RLS Sagothra exclusion.';
COMMENT ON COLUMN profiles.district         IS 'Slug. Purpose: coordinator scoping and proximity ranking.';
COMMENT ON COLUMN profiles.mandal           IS 'Slug. Purpose: coordinator scoping and proximity ranking.';
COMMENT ON COLUMN profiles.vocation         IS 'Purpose: heritage/vocation matching preference.';
COMMENT ON COLUMN profiles.phone_enc        IS 'pgp_sym_encrypt (AES-256). Purpose: shared only after mutual interest + bilateral consent.';
COMMENT ON COLUMN profiles.email_enc        IS 'pgp_sym_encrypt (AES-256). Purpose: shared only after mutual interest + bilateral consent.';
COMMENT ON COLUMN profiles.whatsapp_enc     IS 'pgp_sym_encrypt (AES-256). Purpose: shared only after mutual interest + bilateral consent.';
COMMENT ON COLUMN profiles.door_address_enc IS 'pgp_sym_encrypt (AES-256). Purpose: Mandal field verification (Phase 3). No read path until that phase adds one with its own consent purpose.';

CREATE INDEX ix_profiles_ns_membership_id ON profiles (ns_membership_id);
CREATE INDEX ix_profiles_status_gothra_id ON profiles (status, gothra_id);
CREATE INDEX ix_profiles_district_mandal ON profiles (district, mandal);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- Owner vs coordinator write rules. Column grants (004) decide WHICH columns nsm_app_user may write;
-- this trigger decides WHO may change them and which status moves are legal.
CREATE FUNCTION fn_guard_profile_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me          uuid   := fn_current_user_id();
  v_review_keys text[] := ARRAY['status', 'reviewed_by', 'reviewed_at', 'review_note', 'updated_at'];
BEGIN
  IF v_me IS NULL THEN
    IF current_user = 'nsm_app_user' THEN
      RAISE EXCEPTION 'no request identity' USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;  -- maintenance context (operators, migrations): no request identity
  END IF;
  IF NEW.root_user_id <> OLD.root_user_id THEN
    RAISE EXCEPTION 'root_user_id is immutable' USING ERRCODE = 'check_violation';
  END IF;

  IF OLD.root_user_id = v_me THEN
    IF (NEW.reviewed_by, NEW.reviewed_at, NEW.review_note) IS DISTINCT FROM (OLD.reviewed_by, OLD.reviewed_at, OLD.review_note) THEN
      RAISE EXCEPTION 'owners cannot edit review fields' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NOT (OLD.status IN ('draft', 'rejected') AND NEW.status = 'pending_mandal_review') THEN
      RAISE EXCEPTION 'owners may only submit a profile for review (% -> %)', OLD.status, NEW.status USING ERRCODE = 'check_violation';
    END IF;
    -- Identity-bearing fields changed after submission: back to the coordinator queue, so a
    -- verified member cannot switch gothra to dodge Sagothra exclusion.
    IF OLD.status IN ('pending_mandal_review', 'verified')
       AND (NEW.gender, NEW.date_of_birth, NEW.gothra_id, NEW.district, NEW.mandal)
           IS DISTINCT FROM (OLD.gender, OLD.date_of_birth, OLD.gothra_id, OLD.district, OLD.mandal) THEN
      NEW.status := 'pending_mandal_review';
    END IF;
    RETURN NEW;
  END IF;

  -- Not the owner: the row was reachable only through a coordinator policy.
  IF to_jsonb(NEW) - v_review_keys IS DISTINCT FROM to_jsonb(OLD) - v_review_keys THEN
    RAISE EXCEPTION 'coordinators may change only review fields' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
       (OLD.status = 'pending_mandal_review' AND NEW.status IN ('verified', 'rejected'))
    OR (OLD.status = 'verified' AND NEW.status = 'suspended')
    OR (OLD.status = 'suspended' AND NEW.status = 'verified')) THEN
    RAISE EXCEPTION 'review transition % -> % not allowed', OLD.status, NEW.status USING ERRCODE = 'check_violation';
  END IF;
  NEW.reviewed_by := v_me;
  NEW.reviewed_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_profiles_guard BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_guard_profile_update();
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

-- Viewer's own profile id; SECURITY DEFINER so policies on other tables avoid RLS recursion.
CREATE FUNCTION fn_current_profile_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$ SELECT id FROM profiles WHERE root_user_id = fn_current_user_id() $$;

-- --------------------------------------------------------------------------------------- interests
CREATE TABLE interests (
  id                           uuid CONSTRAINT pk_interests PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id              uuid NOT NULL CONSTRAINT fk_interests_from_profile_id REFERENCES profiles (id) ON DELETE CASCADE,
  to_profile_id                uuid NOT NULL CONSTRAINT fk_interests_to_profile_id REFERENCES profiles (id) ON DELETE CASCADE,
  status                       interest_status NOT NULL DEFAULT 'sent',
  sender_contact_consent_at    timestamptz,
  recipient_contact_consent_at timestamptz,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_interests_not_self CHECK (from_profile_id <> to_profile_id),
  CONSTRAINT ck_interests_unlock_needs_both_consents CHECK (
    status <> 'contact_unlocked' OR (sender_contact_consent_at IS NOT NULL AND recipient_contact_consent_at IS NOT NULL))
);
-- One interest per pair, ever: a declined/withdrawn member cannot be re-pinged.
CREATE UNIQUE INDEX uq_interests_pair ON interests (least(from_profile_id, to_profile_id), greatest(from_profile_id, to_profile_id));
CREATE INDEX ix_interests_to_profile_id ON interests (to_profile_id);
ALTER TABLE interests ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

CREATE FUNCTION fn_guard_interest_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me uuid := fn_current_profile_id();
BEGIN
  IF fn_current_user_id() IS NULL AND current_user <> 'nsm_app_user' THEN
    RETURN NEW;  -- maintenance context (e.g. expiry job)
  END IF;
  IF (NEW.from_profile_id, NEW.to_profile_id, NEW.created_at) IS DISTINCT FROM (OLD.from_profile_id, OLD.to_profile_id, OLD.created_at) THEN
    RAISE EXCEPTION 'interest parties are immutable' USING ERRCODE = 'check_violation';
  END IF;
  IF (OLD.sender_contact_consent_at IS NOT NULL AND NEW.sender_contact_consent_at IS DISTINCT FROM OLD.sender_contact_consent_at)
     OR (OLD.recipient_contact_consent_at IS NOT NULL AND NEW.recipient_contact_consent_at IS DISTINCT FROM OLD.recipient_contact_consent_at) THEN
    RAISE EXCEPTION 'contact consent timestamps are write-once' USING ERRCODE = 'check_violation';
  END IF;
  IF (NEW.sender_contact_consent_at IS DISTINCT FROM OLD.sender_contact_consent_at
        AND (OLD.status <> 'accepted' OR v_me IS DISTINCT FROM OLD.from_profile_id))
     OR (NEW.recipient_contact_consent_at IS DISTINCT FROM OLD.recipient_contact_consent_at
        AND (OLD.status <> 'accepted' OR v_me IS DISTINCT FROM OLD.to_profile_id)) THEN
    RAISE EXCEPTION 'each party consents only for itself, only on an accepted interest' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;
  IF NOT coalesce(
       (OLD.status = 'sent' AND NEW.status IN ('accepted', 'declined') AND v_me = OLD.to_profile_id)
    OR (OLD.status = 'sent' AND NEW.status = 'withdrawn' AND v_me = OLD.from_profile_id)
    OR (OLD.status IN ('accepted', 'contact_unlocked') AND NEW.status = 'withdrawn' AND v_me IN (OLD.from_profile_id, OLD.to_profile_id))
    OR (OLD.status = 'accepted' AND NEW.status = 'contact_unlocked' AND v_me IN (OLD.from_profile_id, OLD.to_profile_id)),
    false) THEN
    RAISE EXCEPTION 'interest transition % -> % not allowed for this party', OLD.status, NEW.status USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_interests_guard BEFORE UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION fn_guard_interest_update();
CREATE TRIGGER trg_interests_touch BEFORE UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

-- ------------------------------------------------------------------------------- dpdp_consent_logs
CREATE TABLE dpdp_consent_logs (
  id             uuid CONSTRAINT pk_dpdp_consent_logs PRIMARY KEY DEFAULT gen_random_uuid(),
  seq            bigint NOT NULL CONSTRAINT uq_dpdp_consent_logs_seq UNIQUE,
  root_user_id   uuid NOT NULL,
  purpose        consent_purpose NOT NULL,
  interest_id    uuid,  -- no FK: the ledger outlives erased interests
  notice_version text NOT NULL CONSTRAINT ck_dpdp_consent_logs_notice_version CHECK (notice_version ~ '^[a-z0-9._-]{1,32}$'),
  statement      text NOT NULL CONSTRAINT ck_dpdp_consent_logs_statement CHECK (length(statement) BETWEEN 1 AND 2000),
  granted        boolean NOT NULL,
  ip             inet NOT NULL,
  user_agent     text NOT NULL CONSTRAINT ck_dpdp_consent_logs_user_agent CHECK (length(user_agent) <= 512),
  created_at     timestamptz NOT NULL DEFAULT now(),
  prev_hash      bytea NOT NULL,
  row_hash       bytea NOT NULL CONSTRAINT uq_dpdp_consent_logs_row_hash UNIQUE,
  CONSTRAINT ck_dpdp_consent_logs_interest CHECK ((purpose = 'contact_share') = (interest_id IS NOT NULL))
);
COMMENT ON TABLE dpdp_consent_logs IS 'DPDP s.6 consent ledger. Append-only, sha256 hash-chained; withdrawal is a new row with granted=false.';
COMMENT ON COLUMN dpdp_consent_logs.ip         IS 'Purpose: evidence of consent (DPDP s.6(10)).';
COMMENT ON COLUMN dpdp_consent_logs.user_agent IS 'Purpose: evidence of consent (DPDP s.6(10)).';
CREATE INDEX ix_dpdp_consent_logs_root_user_id_purpose ON dpdp_consent_logs (root_user_id, purpose);
CREATE INDEX ix_dpdp_consent_logs_interest_id ON dpdp_consent_logs (interest_id) WHERE interest_id IS NOT NULL;
ALTER TABLE dpdp_consent_logs ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- Canonical form avoids session-dependent text output (timezone, datestyle): epoch for time.
CREATE FUNCTION fn_consent_row_hash(r dpdp_consent_logs) RETURNS bytea
LANGUAGE sql IMMUTABLE SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT sha256(r.prev_hash || convert_to(jsonb_build_array(
    r.seq, r.id, r.root_user_id, r.purpose, r.interest_id, r.notice_version, r.statement,
    r.granted, r.ip::text, r.user_agent, extract(epoch FROM r.created_at))::text, 'UTF8'))
$$;

-- ponytail: one global advisory lock serialises consent writes so the chain stays linear. Fine for
-- consent-rate traffic; if it ever bottlenecks, switch to per-user chains anchored to a global one.
-- Deleting the newest rows is not detectable from the chain alone: anchor the head hash externally
-- (Phase 5 backup job) to close that gap.
CREATE FUNCTION fn_chain_consent_log() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_prev dpdp_consent_logs;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('matrimony_shared.dpdp_consent_logs'));
  SELECT * INTO v_prev FROM dpdp_consent_logs ORDER BY seq DESC LIMIT 1;
  NEW.seq        := coalesce(v_prev.seq, 0) + 1;
  NEW.prev_hash  := coalesce(v_prev.row_hash, decode(repeat('00', 32), 'hex'));
  NEW.created_at := clock_timestamp();
  NEW.row_hash   := fn_consent_row_hash(NEW);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_dpdp_consent_logs_chain BEFORE INSERT ON dpdp_consent_logs
  FOR EACH ROW EXECUTE FUNCTION fn_chain_consent_log();
CREATE TRIGGER trg_dpdp_consent_logs_append_only BEFORE UPDATE OR DELETE ON dpdp_consent_logs
  FOR EACH ROW EXECUTE FUNCTION fn_reject_mutation();
CREATE TRIGGER trg_dpdp_consent_logs_no_truncate BEFORE TRUNCATE ON dpdp_consent_logs
  FOR EACH STATEMENT EXECUTE FUNCTION fn_reject_mutation();

-- Returns the first broken seq, or NULL when the whole chain verifies.
CREATE FUNCTION fn_verify_consent_chain() RETURNS bigint
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  r      dpdp_consent_logs;
  v_prev bytea  := decode(repeat('00', 32), 'hex');
  v_seq  bigint := 0;
BEGIN
  FOR r IN SELECT * FROM dpdp_consent_logs ORDER BY seq LOOP
    v_seq := v_seq + 1;
    IF r.seq <> v_seq OR r.prev_hash <> v_prev OR r.row_hash <> fn_consent_row_hash(r) THEN
      RETURN r.seq;
    END IF;
    v_prev := r.row_hash;
  END LOOP;
  RETURN NULL;
END $$;

-- -------------------------------------------------------------------------------------- sub_admins
CREATE TABLE sub_admins (
  id           uuid CONSTRAINT pk_sub_admins PRIMARY KEY DEFAULT gen_random_uuid(),
  root_user_id uuid NOT NULL,
  role         sub_admin_role NOT NULL,
  district     text CONSTRAINT ck_sub_admins_district CHECK (district ~ '^[a-z][a-z-]{1,40}$'),
  mandal       text CONSTRAINT ck_sub_admins_mandal CHECK (mandal ~ '^[a-z][a-z-]{1,40}$'),
  active       boolean NOT NULL DEFAULT true,
  assigned_by  uuid NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_sub_admins_scope CHECK (
       (role = 'mandal_coordinator'       AND district IS NOT NULL AND mandal IS NOT NULL)
    OR (role = 'district_lineage_officer' AND district IS NOT NULL AND mandal IS NULL)
    OR (role = 'grievance_officer'        AND district IS NULL     AND mandal IS NULL)),
  CONSTRAINT uq_sub_admins_assignment UNIQUE NULLS NOT DISTINCT (root_user_id, role, district, mandal)
);
CREATE INDEX ix_sub_admins_root_user_id ON sub_admins (root_user_id) WHERE active;
CREATE TRIGGER trg_sub_admins_touch BEFORE UPDATE ON sub_admins
  FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();
ALTER TABLE sub_admins ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------- grievance_tickets
CREATE TABLE grievance_tickets (
  id                       uuid CONSTRAINT pk_grievance_tickets PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_user_id      uuid NOT NULL,
  subject_profile_id       uuid,  -- no FK: tickets outlive erased profiles
  category                 text NOT NULL CONSTRAINT ck_grievance_tickets_category CHECK (category IN
                             ('data_access', 'data_correction', 'data_erasure', 'consent_withdrawal', 'misconduct', 'other')),
  description              text NOT NULL CONSTRAINT ck_grievance_tickets_description CHECK (length(description) BETWEEN 1 AND 2000),
  status                   grievance_status NOT NULL DEFAULT 'open',
  assigned_officer_user_id uuid,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN grievance_tickets.description IS 'Purpose: grievance redressal (DPDP s.13).';
CREATE INDEX ix_grievance_tickets_status ON grievance_tickets (status);
CREATE TRIGGER trg_grievance_tickets_touch BEFORE UPDATE ON grievance_tickets
  FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();
ALTER TABLE grievance_tickets ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------- contact_access_audit
CREATE TABLE contact_access_audit (
  id                  uuid CONSTRAINT pk_contact_access_audit PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id      uuid NOT NULL,
  target_profile_id   uuid NOT NULL,  -- no FK: audit outlives erased profiles
  basis               access_basis NOT NULL,
  interest_id         uuid,
  grievance_ticket_id uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_contact_access_audit_basis CHECK (
       (basis = 'mutual_interest' AND interest_id IS NOT NULL AND grievance_ticket_id IS NULL)
    OR (basis = 'grievance' AND grievance_ticket_id IS NOT NULL AND interest_id IS NULL))
);
CREATE INDEX ix_contact_access_audit_target_profile_id ON contact_access_audit (target_profile_id);
CREATE TRIGGER trg_contact_access_audit_append_only BEFORE UPDATE OR DELETE ON contact_access_audit
  FOR EACH ROW EXECUTE FUNCTION fn_reject_mutation();
CREATE TRIGGER trg_contact_access_audit_no_truncate BEFORE TRUNCATE ON contact_access_audit
  FOR EACH STATEMENT EXECUTE FUNCTION fn_reject_mutation();
ALTER TABLE contact_access_audit ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
