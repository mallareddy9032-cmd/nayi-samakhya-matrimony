SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 008 (decisions 2026-10-04, Phase 3 resolution + Phase 4): profile photos, one-click consent
-- withdrawal (-> suspended), audited door-address read for field verification, erasure with
-- dual-officer approval, gothra proposal resolution, interest rate limit.

-- ------------------------------------------------------------------------------- audit_access_logs
-- One disclosure log for every decrypt of contact data (mutual interest, grievance) and of the door
-- address (field verification). Written only by SECURITY DEFINER unmask functions.
ALTER TABLE contact_access_audit RENAME TO audit_access_logs;
ALTER TABLE audit_access_logs RENAME CONSTRAINT pk_contact_access_audit TO pk_audit_access_logs;
ALTER INDEX ix_contact_access_audit_target_profile_id RENAME TO ix_audit_access_logs_target_profile_id;
ALTER TRIGGER trg_contact_access_audit_append_only ON audit_access_logs RENAME TO trg_audit_access_logs_append_only;
ALTER TRIGGER trg_contact_access_audit_no_truncate ON audit_access_logs RENAME TO trg_audit_access_logs_no_truncate;
ALTER POLICY pol_contact_access_audit_target_select ON audit_access_logs RENAME TO pol_audit_access_logs_target_select;
ALTER POLICY pol_contact_access_audit_grievance_ro_select ON audit_access_logs RENAME TO pol_audit_access_logs_grievance_ro_select;
ALTER TABLE audit_access_logs DROP CONSTRAINT ck_contact_access_audit_basis,
  ADD CONSTRAINT ck_audit_access_logs_basis CHECK (
       (basis = 'mutual_interest' AND interest_id IS NOT NULL AND grievance_ticket_id IS NULL)
    OR (basis = 'grievance' AND grievance_ticket_id IS NOT NULL AND interest_id IS NULL)
    OR (basis = 'field_verification' AND interest_id IS NULL AND grievance_ticket_id IS NULL));
COMMENT ON TABLE audit_access_logs IS 'Append-only log of every decryption of contact data or door address (who, whose, on what basis).';

-- ---------------------------------------------------------------------------------------- profiles
ALTER TABLE profiles ADD COLUMN photo_object_id uuid;
COMMENT ON COLUMN profiles.photo_object_id IS 'Random id of the photo objects in the private bucket (photos/<id>/full.webp, blur.webp). Purpose: matchmaking photo per photo_visibility and photo_display consent. No app privilege; read only via fn_photo_access().';
-- Erasure (DPDP s.8(7)) nulls identity fields; every other status still requires them.
ALTER TABLE profiles ALTER COLUMN gender DROP NOT NULL, ALTER COLUMN date_of_birth DROP NOT NULL,
  ALTER COLUMN gothra_id DROP NOT NULL,
  ADD CONSTRAINT ck_profiles_identity_present CHECK (
    status = 'erased' OR (gender IS NOT NULL AND date_of_birth IS NOT NULL AND gothra_id IS NOT NULL));

CREATE FUNCTION fn_latest_consent(p_user_id uuid, p_purpose consent_purpose) RETURNS boolean
LANGUAGE sql STABLE SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT coalesce((SELECT granted FROM dpdp_consent_logs
                    WHERE root_user_id = p_user_id AND purpose = p_purpose AND interest_id IS NULL
                    ORDER BY seq DESC LIMIT 1), false)
$$;

-- Replaces 006's guard. Changes: definer routines own workflow transitions (submit/resume, photo,
-- withdrawal -> suspended, erasure); coordinators may only verify or reject (suspension now means
-- "consent withdrawn" and only the member's own re-consent ends it); erased rows are final.
CREATE OR REPLACE FUNCTION fn_guard_profile_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me            uuid    := fn_current_user_id();
  v_definer       boolean := current_user <> 'nsm_app_user';
  v_review_keys   text[]  := ARRAY['status', 'reviewed_by', 'reviewed_at', 'review_note', 'updated_at'];
  v_workflow_keys text[]  := ARRAY['status', 'assigned_coordinator_user_id', 'matrimonial_id', 'submitted_at', 'photo_object_id', 'updated_at'];
BEGIN
  IF v_me IS NULL THEN
    IF NOT v_definer THEN
      RAISE EXCEPTION 'no request identity' USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;  -- maintenance context (operators, migrations): no request identity
  END IF;
  IF NEW.root_user_id <> OLD.root_user_id THEN
    RAISE EXCEPTION 'root_user_id is immutable' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'erased' THEN
    RAISE EXCEPTION 'erased profiles are final' USING ERRCODE = 'check_violation';
  END IF;

  IF OLD.root_user_id = v_me THEN
    -- A coordinator must approve exactly what they reviewed.
    IF OLD.status = 'pending_mandal_review' AND to_jsonb(NEW) - v_workflow_keys IS DISTINCT FROM to_jsonb(OLD) - v_workflow_keys THEN
      RAISE EXCEPTION 'profile is locked while under review' USING ERRCODE = 'check_violation';
    END IF;
    IF (NEW.reviewed_by, NEW.reviewed_at, NEW.review_note) IS DISTINCT FROM (OLD.reviewed_by, OLD.reviewed_at, OLD.review_note) THEN
      RAISE EXCEPTION 'owners cannot edit review fields' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (v_definer AND (
         (OLD.status IN ('draft', 'rejected', 'suspended', 'verified') AND NEW.status = 'pending_mandal_review')
      OR NEW.status = 'suspended')) THEN
      RAISE EXCEPTION 'owners change status only through NSM functions (% -> %)', OLD.status, NEW.status USING ERRCODE = 'check_violation';
    END IF;
    -- Identity-bearing edits after verification go back to the (possibly new) mandal queue, so a
    -- verified member cannot switch gothra to dodge Sagothra exclusion.
    IF OLD.status = 'verified'
       AND (NEW.gender, NEW.date_of_birth, NEW.gothra_id, NEW.maternal_lineage, NEW.ancestral_native_district, NEW.ancestral_native_mandal)
           IS DISTINCT FROM (OLD.gender, OLD.date_of_birth, OLD.gothra_id, OLD.maternal_lineage, OLD.ancestral_native_district, OLD.ancestral_native_mandal) THEN
      NEW.status := 'pending_mandal_review';
      NEW.submitted_at := now();
      NEW.assigned_coordinator_user_id := fn_pick_coordinator(NEW.ancestral_native_district, NEW.ancestral_native_mandal, v_me);
    END IF;
    RETURN NEW;
  END IF;

  -- Another member's row changed inside a SECURITY DEFINER routine (erasure, photo takedown): those
  -- routines check their own authorisation and dual approval.
  IF v_definer THEN
    RETURN NEW;
  END IF;

  -- Not the owner: the row was reachable only through a coordinator policy.
  IF to_jsonb(NEW) - v_review_keys IS DISTINCT FROM to_jsonb(OLD) - v_review_keys THEN
    RAISE EXCEPTION 'coordinators may change only review fields' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (OLD.status = 'pending_mandal_review' AND NEW.status IN ('verified', 'rejected')) THEN
    RAISE EXCEPTION 'review transition % -> % not allowed', OLD.status, NEW.status USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status = 'verified' AND NOT fn_gothra_is_verified(NEW.gothra_id) THEN
    RAISE EXCEPTION 'gothra must be ratified before verification' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status = 'rejected' AND coalesce(btrim(NEW.review_note), '') = '' THEN
    RAISE EXCEPTION 'a rejection needs a reason' USING ERRCODE = 'check_violation';
  END IF;
  NEW.reviewed_by := v_me;
  NEW.reviewed_at := now();
  RETURN NEW;
END $$;

-- Coordinators no longer see profiles whose owner withdrew consent (suspended) or was erased.
DROP POLICY pol_profiles_coordinator_select ON profiles;
DROP POLICY pol_profiles_coordinator_update ON profiles;
CREATE POLICY pol_profiles_coordinator_select ON profiles FOR SELECT TO nsm_app_user
  USING (
    status IN ('pending_mandal_review', 'verified', 'rejected')
    AND (ancestral_native_district || '/' || ancestral_native_mandal = ANY ((SELECT fn_scope_mandals())::text[])
         OR ancestral_native_district = ANY ((SELECT fn_scope_districts())::text[]))
  );
CREATE POLICY pol_profiles_coordinator_update ON profiles FOR UPDATE TO nsm_app_user
  USING (
    status = 'pending_mandal_review'
    AND (ancestral_native_district || '/' || ancestral_native_mandal = ANY ((SELECT fn_scope_mandals())::text[])
         OR ancestral_native_district = ANY ((SELECT fn_scope_districts())::text[]))
  )
  WITH CHECK (
    ancestral_native_district || '/' || ancestral_native_mandal = ANY ((SELECT fn_scope_mandals())::text[])
    OR ancestral_native_district = ANY ((SELECT fn_scope_districts())::text[])
  );

-- Merged spelling variants are verified but inactive (not offered in the picker).
CREATE OR REPLACE FUNCTION fn_gothra_is_verified(p_gothra_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$ SELECT coalesce((SELECT is_verified FROM gothra_master WHERE id = p_gothra_id), false) $$;

-- Replaces 006: a suspended member resumes by re-granting consent, which re-submits for review.
CREATE OR REPLACE FUNCTION fn_submit_profile() RETURNS TABLE (matrimonial_id text, coordinator_assigned boolean)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_me      uuid := fn_current_user_id();
  v_p       profiles;
  v_purpose consent_purpose;
  v_coord   uuid;
  v_code    text;
  v_year    int;
  v_n       int;
  v_id      text;
BEGIN
  SELECT * INTO v_p FROM profiles p WHERE p.root_user_id = v_me FOR UPDATE;
  IF v_me IS NULL OR NOT FOUND THEN
    RAISE EXCEPTION 'caller has no profile' USING ERRCODE = 'no_data_found';
  END IF;
  IF v_p.status NOT IN ('draft', 'rejected', 'suspended') THEN
    RAISE EXCEPTION 'profile already submitted (%)', v_p.status USING ERRCODE = 'object_not_in_prerequisite_state';
  END IF;
  IF v_p.education_degree IS NULL OR v_p.occupation IS NULL OR v_p.income_bracket IS NULL
     OR v_p.phone_enc IS NULL OR v_p.door_address_enc IS NULL THEN
    RAISE EXCEPTION 'profile incomplete' USING ERRCODE = 'check_violation';
  END IF;
  FOREACH v_purpose IN ARRAY '{community_pledge,profile_processing,coordinator_verification}'::consent_purpose[] LOOP
    IF NOT fn_latest_consent(v_me, v_purpose) THEN
      RAISE EXCEPTION 'consent % not granted', v_purpose USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;

  v_coord := fn_pick_coordinator(v_p.ancestral_native_district, v_p.ancestral_native_mandal, v_me);
  v_id := v_p.matrimonial_id;
  IF v_id IS NULL THEN
    SELECT d.code INTO v_code FROM districts d WHERE d.slug = v_p.ancestral_native_district;
    v_year := extract(year FROM now() AT TIME ZONE 'Asia/Kolkata');
    INSERT INTO matrimonial_id_counters AS c (district_code, year, last_value) VALUES (v_code, v_year, 1)
    ON CONFLICT ON CONSTRAINT pk_matrimonial_id_counters DO UPDATE SET last_value = c.last_value + 1
    RETURNING c.last_value INTO v_n;
    v_id := format('NSM-TG-%s-%s-%s', v_code, v_year, lpad(v_n::text, greatest(4, length(v_n::text)), '0'));
  END IF;

  UPDATE profiles p
     SET status = 'pending_mandal_review', assigned_coordinator_user_id = v_coord,
         matrimonial_id = v_id, submitted_at = now()
   WHERE p.id = v_p.id;
  RETURN QUERY SELECT v_id, v_coord IS NOT NULL;
END $$;

-- ------------------------------------------------------------------------------ consent withdrawal
-- DPDP s.6(4): withdrawing any onboarding consent halts processing at once, whichever path wrote
-- the ledger row. Photo consent withdrawal drops the photo reference (the app deletes the objects).
CREATE FUNCTION fn_apply_consent_withdrawal() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
BEGIN
  IF NEW.purpose = 'photo_display' THEN
    UPDATE profiles SET photo_object_id = NULL WHERE root_user_id = NEW.root_user_id AND photo_object_id IS NOT NULL;
  ELSE
    UPDATE profiles SET status = 'suspended'
     WHERE root_user_id = NEW.root_user_id AND status IN ('pending_mandal_review', 'verified');
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_dpdp_consent_logs_withdrawal AFTER INSERT ON dpdp_consent_logs
  FOR EACH ROW WHEN (NOT NEW.granted AND NEW.purpose IN ('community_pledge', 'profile_processing', 'coordinator_verification', 'photo_display'))
  EXECUTE FUNCTION fn_apply_consent_withdrawal();

-- ------------------------------------------------------------------------------------------ photos
-- Which variant of p_profile_id's photo the caller may see; no row = none. The app signs a
-- short-lived URL only for the object this returns.
CREATE FUNCTION fn_photo_access(p_profile_id uuid) RETURNS TABLE (object_id uuid, variant text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me     uuid := fn_current_user_id();
  v_viewer uuid := fn_current_profile_id();
  v_t      profiles;
BEGIN
  SELECT * INTO v_t FROM profiles WHERE id = p_profile_id;
  IF v_me IS NULL OR NOT FOUND OR v_t.photo_object_id IS NULL OR v_t.status = 'erased'
     OR NOT fn_latest_consent(v_t.root_user_id, 'photo_display') THEN
    RETURN;
  END IF;
  IF v_t.root_user_id = v_me
     -- reviewers compare the photo with the person during verification (only then)
     OR (v_t.status = 'pending_mandal_review'
         AND (v_t.ancestral_native_district || '/' || v_t.ancestral_native_mandal = ANY (fn_scope_mandals())
              OR v_t.ancestral_native_district = ANY (fn_scope_districts())))
     -- grievance officer handling a ticket about this profile (e.g. unauthorized photo report)
     OR (fn_is_grievance_officer() AND EXISTS (
           SELECT 1 FROM grievance_tickets g
            WHERE g.subject_profile_id = p_profile_id AND g.assigned_officer_user_id = v_me
              AND g.complainant_user_id <> v_me AND g.status IN ('open', 'in_progress'))) THEN
    RETURN QUERY SELECT v_t.photo_object_id, 'full';
    RETURN;
  END IF;
  IF NOT fn_can_express_interest(p_profile_id) THEN  -- verified, non-Sagothra target; verified viewer
    RETURN;
  END IF;
  -- "Explicit approval" = an accepted interest between the two members.
  IF v_t.photo_visibility = 'public_verified' OR EXISTS (
       SELECT 1 FROM interests i
        WHERE i.status IN ('accepted', 'contact_unlocked')
          AND ((i.from_profile_id = v_viewer AND i.to_profile_id = p_profile_id)
            OR (i.from_profile_id = p_profile_id AND i.to_profile_id = v_viewer))) THEN
    RETURN QUERY SELECT v_t.photo_object_id, 'full';
  ELSIF v_t.photo_visibility = 'blurred' THEN
    RETURN QUERY SELECT v_t.photo_object_id, 'blurred';
  END IF;
END $$;

-- Sets (or with NULL removes) the caller's photo; returns the previous object id for deletion.
-- A new photo on a verified profile goes back to the coordinator: the photo is part of identity.
CREATE FUNCTION fn_set_profile_photo(p_object_id uuid) RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me uuid := fn_current_user_id();
  v_p  profiles;
BEGIN
  SELECT * INTO v_p FROM profiles WHERE root_user_id = v_me FOR UPDATE;
  IF v_me IS NULL OR NOT FOUND THEN
    RAISE EXCEPTION 'caller has no profile' USING ERRCODE = 'no_data_found';
  END IF;
  IF p_object_id IS NOT NULL THEN
    IF v_p.status NOT IN ('draft', 'pending_mandal_review', 'verified', 'rejected') THEN
      RAISE EXCEPTION 'profile is not active (%)', v_p.status USING ERRCODE = 'object_not_in_prerequisite_state';
    END IF;
    IF NOT fn_latest_consent(v_me, 'photo_display') THEN
      RAISE EXCEPTION 'photo consent not granted' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  UPDATE profiles
     SET photo_object_id = p_object_id,
         status       = CASE WHEN p_object_id IS NOT NULL AND status = 'verified' THEN 'pending_mandal_review' ELSE status END,
         submitted_at = CASE WHEN p_object_id IS NOT NULL AND status = 'verified' THEN now() ELSE submitted_at END,
         assigned_coordinator_user_id = CASE WHEN p_object_id IS NOT NULL AND status = 'verified'
           THEN fn_pick_coordinator(ancestral_native_district, ancestral_native_mandal, v_me)
           ELSE assigned_coordinator_user_id END
   WHERE id = v_p.id;
  RETURN v_p.photo_object_id;
END $$;

-- ---------------------------------------------------------------------------------- door address
-- Field verification (decision 2026-10-04): only the profile's assigned Mandal Coordinator (or the
-- District Lineage Officer for an unassigned profile), only while it is pending review, only with
-- the member's coordinator_verification consent in force. Every read is audited.
CREATE FUNCTION unmask_door_address(target_profile_id uuid) RETURNS text
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
#variable_conflict use_variable
DECLARE
  v_me  uuid := fn_current_user_id();
  v_key text := fn_contact_key();
  v_t   profiles;
BEGIN
  SELECT * INTO v_t FROM profiles p WHERE p.id = target_profile_id;
  IF v_me IS NULL OR NOT FOUND OR v_t.root_user_id = v_me OR v_t.status <> 'pending_mandal_review'
     OR v_t.door_address_enc IS NULL
     OR NOT fn_latest_consent(v_t.root_user_id, 'coordinator_verification')
     OR NOT coalesce(
          (v_t.assigned_coordinator_user_id = v_me
             AND v_t.ancestral_native_district || '/' || v_t.ancestral_native_mandal = ANY (fn_scope_mandals()))
       OR (v_t.assigned_coordinator_user_id IS NULL AND v_t.ancestral_native_district = ANY (fn_scope_districts())), false) THEN
    RAISE EXCEPTION 'door address unmask not permitted' USING ERRCODE = 'insufficient_privilege';
  END IF;
  INSERT INTO audit_access_logs (viewer_user_id, target_profile_id, basis) VALUES (v_me, target_profile_id, 'field_verification');
  RETURN pgp_sym_decrypt(v_t.door_address_enc, v_key);
END $$;

-- Replaces 005: audit table renamed; a member whose own profile is not verified (consent withdrawn,
-- under re-review, erased) can no longer unmask others.
CREATE OR REPLACE FUNCTION unmask_contact_details(target_profile_id uuid, grievance_ticket_id uuid DEFAULT NULL)
RETURNS TABLE (phone text, email text, whatsapp text)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
#variable_conflict use_variable
DECLARE
  v_me       uuid := fn_current_user_id();
  v_profile  uuid := fn_current_profile_id();
  v_key      text := fn_contact_key();
  v_target   profiles;
  v_interest uuid;
BEGIN
  SELECT * INTO v_target FROM profiles p WHERE p.id = target_profile_id;
  IF v_me IS NULL OR NOT FOUND THEN
    RAISE EXCEPTION 'contact unmask not permitted' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF v_target.root_user_id = v_me THEN
    NULL;
  ELSIF grievance_ticket_id IS NULL THEN
    SELECT i.id INTO v_interest
      FROM interests i
     WHERE i.status = 'contact_unlocked'
       AND v_target.status = 'verified'
       AND EXISTS (SELECT 1 FROM profiles me WHERE me.id = v_profile AND me.status = 'verified')
       AND ((i.from_profile_id = v_profile AND i.to_profile_id = target_profile_id)
         OR (i.from_profile_id = target_profile_id AND i.to_profile_id = v_profile))
       AND fn_contact_share_granted(i.id, v_me)
       AND fn_contact_share_granted(i.id, v_target.root_user_id);
    IF v_interest IS NULL THEN
      RAISE EXCEPTION 'contact unmask not permitted' USING ERRCODE = 'insufficient_privilege';
    END IF;
    INSERT INTO audit_access_logs (viewer_user_id, target_profile_id, basis, interest_id)
    VALUES (v_me, target_profile_id, 'mutual_interest', v_interest);
  ELSE
    IF NOT fn_is_grievance_officer() OR NOT EXISTS (
         SELECT 1 FROM grievance_tickets t
          WHERE t.id = grievance_ticket_id
            AND t.subject_profile_id = target_profile_id
            AND t.assigned_officer_user_id = v_me
            AND t.complainant_user_id <> v_me
            AND t.status IN ('open', 'in_progress')) THEN
      RAISE EXCEPTION 'contact unmask not permitted' USING ERRCODE = 'insufficient_privilege';
    END IF;
    INSERT INTO audit_access_logs (viewer_user_id, target_profile_id, basis, grievance_ticket_id)
    VALUES (v_me, target_profile_id, 'grievance', grievance_ticket_id);
  END IF;

  RETURN QUERY SELECT pgp_sym_decrypt(v_target.phone_enc, v_key),
                      pgp_sym_decrypt(v_target.email_enc, v_key),
                      pgp_sym_decrypt(v_target.whatsapp_enc, v_key);
END $$;

-- --------------------------------------------------------------------------------------- interests
-- Replaces 003's guard: accepting or unlocking needs the acting member to be verified (a suspended
-- member's processing is halted).
CREATE OR REPLACE FUNCTION fn_guard_interest_update() RETURNS trigger
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
  IF NEW.status IN ('accepted', 'contact_unlocked')
     AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_me AND status = 'verified') THEN
    RAISE EXCEPTION 'only verified members can accept or unlock' USING ERRCODE = 'check_violation';
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

-- Anti-scraping / anti-spam: at most 10 interests per member per rolling day.
CREATE FUNCTION fn_limit_interest_rate() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
BEGIN
  IF (SELECT count(*) FROM interests WHERE from_profile_id = NEW.from_profile_id AND created_at > now() - interval '1 day') >= 10 THEN
    RAISE EXCEPTION 'daily interest limit reached' USING ERRCODE = 'program_limit_exceeded';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_interests_rate_limit BEFORE INSERT ON interests
  FOR EACH ROW EXECUTE FUNCTION fn_limit_interest_rate();

-- --------------------------------------------------------------------------------- gothra lineage
ALTER TABLE gothra_master ADD COLUMN resolved_by uuid, ADD COLUMN resolved_at timestamptz;
COMMENT ON COLUMN gothra_master.resolved_by IS 'District Lineage Officer who ratified or merged the proposal. Purpose: accountability.';

-- A District Lineage Officer ratifies a proposal as its own lineage, or merges it into a verified
-- gothra's lineage (Sagothra exclusion then treats both as one). Only for proposals used by a
-- submitted profile in their district.
CREATE FUNCTION fn_resolve_gothra_proposal(p_gothra_id uuid, p_merge_into uuid) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me     uuid := fn_current_user_id();
  v_target gothra_master;
BEGIN
  IF v_me IS NULL OR NOT EXISTS (
       SELECT 1 FROM gothra_master g JOIN profiles p ON p.gothra_id = g.id
        WHERE g.id = p_gothra_id AND NOT g.is_verified
          AND p.status IN ('pending_mandal_review', 'rejected') AND p.root_user_id <> v_me
          AND p.ancestral_native_district = ANY (fn_scope_districts())) THEN
    RAISE EXCEPTION 'not a proposal in your district' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_merge_into IS NULL THEN
    UPDATE gothra_master SET is_verified = true, resolved_by = v_me, resolved_at = now() WHERE id = p_gothra_id;
    RETURN;
  END IF;
  SELECT * INTO v_target FROM gothra_master WHERE id = p_merge_into AND is_verified AND active AND id <> p_gothra_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'merge target must be a verified gothra' USING ERRCODE = 'check_violation';
  END IF;
  UPDATE gothra_master
     SET is_verified = true, active = false, lineage_group = v_target.lineage_group, resolved_by = v_me, resolved_at = now()
   WHERE id = p_gothra_id;
END $$;

-- -------------------------------------------------------------------------------------- grievances
ALTER TABLE grievance_tickets DROP CONSTRAINT ck_grievance_tickets_category,
  ADD CONSTRAINT ck_grievance_tickets_category CHECK (category IN
    ('data_access', 'data_correction', 'data_erasure', 'consent_withdrawal', 'misconduct',
     'profile_dispute', 'unauthorized_photo', 'other'));

-- Every officer decision on a ticket. Destructive actions (erasure, photo takedown) take effect only
-- when a second grievance officer approves; 'resolve' is recorded and applied by one officer.
CREATE TABLE grievance_actions (
  id          uuid CONSTRAINT pk_grievance_actions PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid NOT NULL CONSTRAINT fk_grievance_actions_ticket_id REFERENCES grievance_tickets (id),
  action      text NOT NULL CONSTRAINT ck_grievance_actions_action CHECK (action IN ('erase_profile', 'remove_photo', 'resolve')),
  note        text NOT NULL CONSTRAINT ck_grievance_actions_note CHECK (length(btrim(note)) BETWEEN 1 AND 1000),
  proposed_by uuid NOT NULL,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid,
  approved_at timestamptz,
  CONSTRAINT ck_grievance_actions_dual_control CHECK (
    action = 'resolve' OR approved_by IS NULL OR approved_by <> proposed_by)
);
COMMENT ON COLUMN grievance_actions.note IS 'Officer reasoning. Purpose: grievance redressal record (DPDP s.13); must not contain contact data.';
CREATE INDEX ix_grievance_actions_ticket_id ON grievance_actions (ticket_id);
CREATE TRIGGER trg_grievance_actions_no_delete BEFORE DELETE ON grievance_actions
  FOR EACH ROW EXECUTE FUNCTION fn_reject_mutation();
CREATE TRIGGER trg_grievance_actions_no_truncate BEFORE TRUNCATE ON grievance_actions
  FOR EACH STATEMENT EXECUTE FUNCTION fn_reject_mutation();
ALTER TABLE grievance_actions ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
GRANT SELECT ON grievance_actions TO nsm_app_user, nsm_grievance_ro;
CREATE POLICY pol_grievance_actions_officer_select ON grievance_actions FOR SELECT TO nsm_app_user
  USING ((SELECT fn_is_grievance_officer()));
CREATE POLICY pol_grievance_actions_grievance_ro_select ON grievance_actions FOR SELECT TO nsm_grievance_ro
  USING (true);

CREATE FUNCTION fn_propose_grievance_action(p_ticket_id uuid, p_action text, p_note text) RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me uuid := fn_current_user_id();
  v_t  grievance_tickets;
  v_id uuid;
BEGIN
  SELECT * INTO v_t FROM grievance_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND OR NOT fn_is_grievance_officer() OR v_t.assigned_officer_user_id IS DISTINCT FROM v_me
     OR v_t.complainant_user_id = v_me OR v_t.status NOT IN ('open', 'in_progress') THEN
    RAISE EXCEPTION 'not your open ticket' USING ERRCODE = 'insufficient_privilege';
  END IF;
  -- Erasure is the data principal's own right: only for an erasure request about their own profile.
  IF (p_action = 'erase_profile' AND (v_t.category <> 'data_erasure' OR NOT EXISTS (
        SELECT 1 FROM profiles WHERE id = v_t.subject_profile_id AND root_user_id = v_t.complainant_user_id)))
     OR (p_action = 'remove_photo' AND (v_t.category <> 'unauthorized_photo' OR v_t.subject_profile_id IS NULL)) THEN
    RAISE EXCEPTION 'action % does not fit this ticket', p_action USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO grievance_actions (ticket_id, action, note, proposed_by, approved_by, approved_at)
  VALUES (p_ticket_id, p_action, p_note, v_me,
          CASE WHEN p_action = 'resolve' THEN v_me END, CASE WHEN p_action = 'resolve' THEN now() END)
  RETURNING id INTO v_id;
  UPDATE grievance_tickets SET status = CASE WHEN p_action = 'resolve' THEN 'resolved' ELSE 'in_progress' END::grievance_status
   WHERE id = p_ticket_id;
  RETURN v_id;
END $$;

-- Second officer approves and executes. Returns the photo object id the app must delete, if any.
CREATE FUNCTION fn_approve_grievance_action(p_action_id uuid) RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me    uuid := fn_current_user_id();
  v_a     grievance_actions;
  v_t     grievance_tickets;
  v_photo uuid;
BEGIN
  SELECT * INTO v_a FROM grievance_actions WHERE id = p_action_id FOR UPDATE;
  SELECT * INTO v_t FROM grievance_tickets WHERE id = v_a.ticket_id FOR UPDATE;
  IF v_a.id IS NULL OR NOT fn_is_grievance_officer() OR v_a.approved_by IS NOT NULL
     OR v_a.proposed_by = v_me OR v_t.complainant_user_id = v_me OR v_t.status NOT IN ('open', 'in_progress')
     OR EXISTS (SELECT 1 FROM profiles WHERE id = v_t.subject_profile_id AND root_user_id = v_me) THEN
    RAISE EXCEPTION 'approval needs a second, uninvolved grievance officer' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT photo_object_id INTO v_photo FROM profiles WHERE id = v_t.subject_profile_id FOR UPDATE;
  IF v_a.action = 'remove_photo' THEN
    UPDATE profiles SET photo_object_id = NULL WHERE id = v_t.subject_profile_id;
  ELSE
    -- Erasure: contact ciphertext, photo, identity and profile details go; the ledger, audit logs
    -- and the matrimonial ID (reference in those logs) remain. Interests are removed with it.
    DELETE FROM interests WHERE v_t.subject_profile_id IN (from_profile_id, to_profile_id);
    UPDATE profiles
       SET status = 'erased', display_name = 'Erased member', gender = NULL, date_of_birth = NULL, gothra_id = NULL,
           maternal_lineage = NULL, education_degree = NULL, occupation = NULL, income_bracket = NULL,
           salon_hub_slug = NULL, birth_time = NULL, birth_place = NULL, nakshatra = NULL,
           phone_enc = NULL, email_enc = NULL, whatsapp_enc = NULL, door_address_enc = NULL,
           photo_object_id = NULL, review_note = NULL, assigned_coordinator_user_id = NULL
     WHERE id = v_t.subject_profile_id;
  END IF;
  UPDATE grievance_actions SET approved_by = v_me, approved_at = now() WHERE id = p_action_id;
  UPDATE grievance_tickets SET status = 'resolved' WHERE id = v_t.id;
  RETURN v_photo;
END $$;

-- ------------------------------------------------------------------------------------------ grants
GRANT EXECUTE ON FUNCTION
  fn_photo_access(uuid), fn_set_profile_photo(uuid), unmask_door_address(uuid),
  fn_resolve_gothra_proposal(uuid, uuid), fn_propose_grievance_action(uuid, text, text),
  fn_approve_grievance_action(uuid)
TO nsm_app_user;
