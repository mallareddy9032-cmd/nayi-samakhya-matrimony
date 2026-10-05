SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 004: policy helpers, grants and RLS policies.
-- Helpers are STABLE SECURITY DEFINER (read the viewer's own rows without RLS recursion) and are
-- wrapped as (SELECT fn()) in policies so they run once per statement, not once per row.

-- Gothra ids sharing the viewer's lineage group; NULL unless the viewer has a verified profile.
CREATE FUNCTION fn_viewer_sagothra_ids() RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT array_agg(peer.id)
    FROM profiles p
    JOIN gothra_master own  ON own.id = p.gothra_id
    JOIN gothra_master peer ON peer.lineage_group = own.lineage_group
   WHERE p.root_user_id = fn_current_user_id() AND p.status = 'verified'
$$;

-- Coordinator scope = active sub_admins assignment AND the matching role in the verified token.
CREATE FUNCTION fn_scope_mandals() RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT coalesce(array_agg(district || '/' || mandal), '{}')
    FROM sub_admins
   WHERE root_user_id = fn_current_user_id() AND active AND role = 'mandal_coordinator'
     AND fn_has_token_role('mandal_coordinator')
$$;

CREATE FUNCTION fn_scope_districts() RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT coalesce(array_agg(district), '{}')
    FROM sub_admins
   WHERE root_user_id = fn_current_user_id() AND active AND role = 'district_lineage_officer'
     AND fn_has_token_role('district_lineage_officer')
$$;

CREATE FUNCTION fn_is_grievance_officer() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT fn_has_token_role('grievance_officer') AND EXISTS (
    SELECT 1 FROM sub_admins
     WHERE root_user_id = fn_current_user_id() AND active AND role = 'grievance_officer')
$$;

-- An interest may target only a verified, non-Sagothra profile, from a verified viewer. Uses the
-- member rule even for coordinators (who can otherwise see Sagothra profiles in their scope).
CREATE FUNCTION fn_can_express_interest(p_target_profile_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT coalesce((
    SELECT t.status = 'verified'
       AND t.root_user_id <> fn_current_user_id()
       AND NOT (t.gothra_id = ANY (fn_viewer_sagothra_ids()))
      FROM profiles t
     WHERE t.id = p_target_profile_id), false)
$$;

GRANT EXECUTE ON FUNCTION
  fn_current_user_id(), fn_current_roles(), fn_has_token_role(text), fn_current_profile_id(),
  fn_viewer_sagothra_ids(), fn_scope_mandals(), fn_scope_districts(), fn_is_grievance_officer(),
  fn_can_express_interest(uuid)
TO nsm_app_user;
GRANT EXECUTE ON FUNCTION fn_verify_consent_chain() TO nsm_grievance_ro;

-- ---------------------------------------------------------------------------------- gothra_master
GRANT SELECT ON gothra_master TO nsm_app_user;
CREATE POLICY pol_gothra_master_member_select ON gothra_master FOR SELECT TO nsm_app_user USING (true);

-- --------------------------------------------------------------------------------------- profiles
-- No privilege at all on *_enc columns: the only read path is unmask_contact_details().
GRANT SELECT (id, root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
              district, mandal, vocation, status, reviewed_by, reviewed_at, review_note, created_at, updated_at)
  ON profiles TO nsm_app_user;
GRANT INSERT (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id,
              district, mandal, vocation)
  ON profiles TO nsm_app_user;
GRANT UPDATE (display_name, gender, date_of_birth, gothra_id, district, mandal, vocation,
              status, review_note)
  ON profiles TO nsm_app_user;
GRANT DELETE ON profiles TO nsm_app_user;

-- Policy 1: owner has full CRUD on their own row.
CREATE POLICY pol_profiles_self_all ON profiles FOR ALL TO nsm_app_user
  USING (root_user_id = (SELECT fn_current_user_id()))
  WITH CHECK (root_user_id = (SELECT fn_current_user_id()));

-- Policy 2: discovery shows verified profiles outside the viewer's lineage group.
CREATE POLICY pol_profiles_member_select ON profiles FOR SELECT TO nsm_app_user
  USING (
    status = 'verified'
    AND root_user_id <> (SELECT fn_current_user_id())
    AND (SELECT fn_viewer_sagothra_ids()) IS NOT NULL
    AND NOT (gothra_id = ANY ((SELECT fn_viewer_sagothra_ids())::uuid[]))
  );

-- Policy 3: coordinators see and review submitted profiles inside their assignment only.
CREATE POLICY pol_profiles_coordinator_select ON profiles FOR SELECT TO nsm_app_user
  USING (
    status <> 'draft'
    AND (district || '/' || mandal = ANY ((SELECT fn_scope_mandals())::text[])
         OR district = ANY ((SELECT fn_scope_districts())::text[]))
  );
CREATE POLICY pol_profiles_coordinator_update ON profiles FOR UPDATE TO nsm_app_user
  USING (
    status <> 'draft'
    AND (district || '/' || mandal = ANY ((SELECT fn_scope_mandals())::text[])
         OR district = ANY ((SELECT fn_scope_districts())::text[]))
  )
  WITH CHECK (
    district || '/' || mandal = ANY ((SELECT fn_scope_mandals())::text[])
    OR district = ANY ((SELECT fn_scope_districts())::text[])
  );

-- -------------------------------------------------------------------------------------- interests
GRANT SELECT ON interests TO nsm_app_user;
GRANT INSERT (from_profile_id, to_profile_id) ON interests TO nsm_app_user;
GRANT UPDATE (status) ON interests TO nsm_app_user;

CREATE POLICY pol_interests_participant_select ON interests FOR SELECT TO nsm_app_user
  USING ((SELECT fn_current_profile_id()) IN (from_profile_id, to_profile_id));
CREATE POLICY pol_interests_sender_insert ON interests FOR INSERT TO nsm_app_user
  WITH CHECK (from_profile_id = (SELECT fn_current_profile_id()) AND fn_can_express_interest(to_profile_id));
CREATE POLICY pol_interests_participant_update ON interests FOR UPDATE TO nsm_app_user
  USING ((SELECT fn_current_profile_id()) IN (from_profile_id, to_profile_id))
  WITH CHECK ((SELECT fn_current_profile_id()) IN (from_profile_id, to_profile_id));

-- ------------------------------------------------------------------------------ dpdp_consent_logs
-- INSERT + SELECT only; UPDATE/DELETE are never granted and also rejected by trigger.
GRANT SELECT ON dpdp_consent_logs TO nsm_app_user, nsm_grievance_ro;
GRANT INSERT (root_user_id, purpose, interest_id, notice_version, statement, granted, ip, user_agent)
  ON dpdp_consent_logs TO nsm_app_user;

CREATE POLICY pol_dpdp_consent_logs_self_select ON dpdp_consent_logs FOR SELECT TO nsm_app_user
  USING (root_user_id = (SELECT fn_current_user_id()));
-- contact_share rows are written only by fn_grant/withdraw_contact_share, which keep the interest
-- flags and the ledger in step.
CREATE POLICY pol_dpdp_consent_logs_self_insert ON dpdp_consent_logs FOR INSERT TO nsm_app_user
  WITH CHECK (root_user_id = (SELECT fn_current_user_id()) AND purpose <> 'contact_share');
CREATE POLICY pol_dpdp_consent_logs_grievance_ro_select ON dpdp_consent_logs FOR SELECT TO nsm_grievance_ro
  USING (true);

-- ------------------------------------------------------------------------------------- sub_admins
-- Isolated RBAC: the app can only read its own assignments; writes are operator-only.
GRANT SELECT ON sub_admins TO nsm_app_user;
CREATE POLICY pol_sub_admins_self_select ON sub_admins FOR SELECT TO nsm_app_user
  USING (root_user_id = (SELECT fn_current_user_id()));

-- ------------------------------------------------------------------------------ grievance_tickets
GRANT SELECT ON grievance_tickets TO nsm_app_user, nsm_grievance_ro;
GRANT INSERT (complainant_user_id, subject_profile_id, category, description) ON grievance_tickets TO nsm_app_user;
GRANT UPDATE (status, assigned_officer_user_id) ON grievance_tickets TO nsm_app_user;

CREATE POLICY pol_grievance_tickets_complainant_select ON grievance_tickets FOR SELECT TO nsm_app_user
  USING (complainant_user_id = (SELECT fn_current_user_id()));
CREATE POLICY pol_grievance_tickets_complainant_insert ON grievance_tickets FOR INSERT TO nsm_app_user
  WITH CHECK (complainant_user_id = (SELECT fn_current_user_id()));
CREATE POLICY pol_grievance_tickets_officer_select ON grievance_tickets FOR SELECT TO nsm_app_user
  USING ((SELECT fn_is_grievance_officer()));
CREATE POLICY pol_grievance_tickets_officer_update ON grievance_tickets FOR UPDATE TO nsm_app_user
  USING ((SELECT fn_is_grievance_officer()))
  WITH CHECK ((SELECT fn_is_grievance_officer()));
CREATE POLICY pol_grievance_tickets_grievance_ro_select ON grievance_tickets FOR SELECT TO nsm_grievance_ro
  USING (true);

-- --------------------------------------------------------------------------- contact_access_audit
-- Written only by unmask_contact_details(). Members can see who unmasked their contact (DPDP s.11).
GRANT SELECT ON contact_access_audit TO nsm_app_user, nsm_grievance_ro;
CREATE POLICY pol_contact_access_audit_target_select ON contact_access_audit FOR SELECT TO nsm_app_user
  USING (target_profile_id = (SELECT fn_current_profile_id()));
CREATE POLICY pol_contact_access_audit_grievance_ro_select ON contact_access_audit FOR SELECT TO nsm_grievance_ro
  USING (true);
