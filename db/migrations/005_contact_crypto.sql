SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 005: contact encryption, bilateral contact-share consent, and the single unmask path.
--
-- The key never lives in the database: src/lib/crypto.ts sets it transaction-locally with
-- set_config('nsm.contact_key', $1, true) right before calling these functions and clears it after.

CREATE FUNCTION fn_contact_key() RETURNS text
LANGUAGE plpgsql STABLE SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_key text := nullif(current_setting('nsm.contact_key', true), '');
BEGIN
  IF v_key IS NULL OR length(v_key) < 32 THEN
    RAISE EXCEPTION 'contact key not provided' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN v_key;
END $$;

-- Latest contact_share decision of p_user for p_interest_id (withdrawal = newer row, granted=false).
CREATE FUNCTION fn_contact_share_granted(p_interest_id uuid, p_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT coalesce((
    SELECT granted FROM dpdp_consent_logs
     WHERE purpose = 'contact_share' AND interest_id = p_interest_id AND root_user_id = p_user_id
     ORDER BY seq DESC LIMIT 1), false)
$$;

-- Caller writes their own contact details; plaintext never touches a table.
CREATE FUNCTION fn_set_contact_details(p_phone text, p_email text, p_whatsapp text, p_door_address text) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_key  text := fn_contact_key();
  v_opts text := 'cipher-algo=aes256, compress-algo=0';
BEGIN
  IF p_phone !~ '^\+?[0-9]{10,15}$' OR p_whatsapp !~ '^\+?[0-9]{10,15}$'
     OR length(p_email) > 254 OR p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     OR length(p_door_address) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'invalid contact details' USING ERRCODE = 'check_violation';
  END IF;
  UPDATE profiles
     SET phone_enc        = pgp_sym_encrypt(p_phone, v_key, v_opts),
         email_enc        = pgp_sym_encrypt(p_email, v_key, v_opts),
         whatsapp_enc     = pgp_sym_encrypt(p_whatsapp, v_key, v_opts),
         door_address_enc = pgp_sym_encrypt(p_door_address, v_key, v_opts)
   WHERE root_user_id = fn_current_user_id();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'caller has no profile' USING ERRCODE = 'no_data_found';
  END IF;
END $$;

CREATE FUNCTION fn_grant_contact_share(p_interest_id uuid, p_notice_version text, p_statement text,
                                       p_ip inet, p_user_agent text) RETURNS interest_status
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me      uuid := fn_current_user_id();
  v_profile uuid := fn_current_profile_id();
  v_row     interests;
BEGIN
  SELECT * INTO v_row FROM interests WHERE id = p_interest_id FOR UPDATE;
  IF NOT FOUND OR v_profile IS NULL OR v_profile NOT IN (v_row.from_profile_id, v_row.to_profile_id) THEN
    RAISE EXCEPTION 'not a participant' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_row.status <> 'accepted' THEN
    RAISE EXCEPTION 'contact sharing needs an accepted interest (is %)', v_row.status USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO dpdp_consent_logs (root_user_id, purpose, interest_id, notice_version, statement, granted, ip, user_agent)
  VALUES (v_me, 'contact_share', p_interest_id, p_notice_version, p_statement, true, p_ip, p_user_agent);

  UPDATE interests
     SET sender_contact_consent_at    = CASE WHEN v_profile = from_profile_id THEN coalesce(sender_contact_consent_at, now()) ELSE sender_contact_consent_at END,
         recipient_contact_consent_at = CASE WHEN v_profile = to_profile_id THEN coalesce(recipient_contact_consent_at, now()) ELSE recipient_contact_consent_at END
   WHERE id = p_interest_id
  RETURNING * INTO v_row;

  IF v_row.sender_contact_consent_at IS NOT NULL AND v_row.recipient_contact_consent_at IS NOT NULL THEN
    UPDATE interests SET status = 'contact_unlocked' WHERE id = p_interest_id RETURNING * INTO v_row;
  END IF;
  RETURN v_row.status;
END $$;

-- Withdrawal is one call, same depth as granting (DPDP s.6(4)): ledger row + interest closed.
CREATE FUNCTION fn_withdraw_contact_share(p_interest_id uuid, p_notice_version text, p_statement text,
                                          p_ip inet, p_user_agent text) RETURNS interest_status
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me      uuid := fn_current_user_id();
  v_profile uuid := fn_current_profile_id();
  v_row     interests;
BEGIN
  SELECT * INTO v_row FROM interests WHERE id = p_interest_id FOR UPDATE;
  IF NOT FOUND OR v_profile IS NULL OR v_profile NOT IN (v_row.from_profile_id, v_row.to_profile_id) THEN
    RAISE EXCEPTION 'not a participant' USING ERRCODE = 'insufficient_privilege';
  END IF;

  INSERT INTO dpdp_consent_logs (root_user_id, purpose, interest_id, notice_version, statement, granted, ip, user_agent)
  VALUES (v_me, 'contact_share', p_interest_id, p_notice_version, p_statement, false, p_ip, p_user_agent);

  IF v_row.status IN ('accepted', 'contact_unlocked') THEN
    UPDATE interests SET status = 'withdrawn' WHERE id = p_interest_id RETURNING * INTO v_row;
  END IF;
  RETURN v_row.status;
END $$;

-- The ONLY way to read contact plaintext. Allowed when:
--   self:      the caller owns the profile (DPDP right of access; not audited),
--   (a) mutual: a contact_unlocked interest links caller and a verified target, and BOTH parties'
--               latest contact_share consent for it is granted,
--   (b) grievance: caller is a token+assigned grievance officer, the ticket is open/in_progress,
--               assigned to them, about this profile, and not filed by themselves.
-- Every non-self success writes contact_access_audit; every refusal raises 42501.
CREATE FUNCTION unmask_contact_details(target_profile_id uuid, grievance_ticket_id uuid DEFAULT NULL)
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
       AND ((i.from_profile_id = v_profile AND i.to_profile_id = target_profile_id)
         OR (i.from_profile_id = target_profile_id AND i.to_profile_id = v_profile))
       AND fn_contact_share_granted(i.id, v_me)
       AND fn_contact_share_granted(i.id, v_target.root_user_id);
    IF v_interest IS NULL THEN
      RAISE EXCEPTION 'contact unmask not permitted' USING ERRCODE = 'insufficient_privilege';
    END IF;
    INSERT INTO contact_access_audit (viewer_user_id, target_profile_id, basis, interest_id)
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
    INSERT INTO contact_access_audit (viewer_user_id, target_profile_id, basis, grievance_ticket_id)
    VALUES (v_me, target_profile_id, 'grievance', grievance_ticket_id);
  END IF;

  RETURN QUERY SELECT pgp_sym_decrypt(v_target.phone_enc, v_key),
                      pgp_sym_decrypt(v_target.email_enc, v_key),
                      pgp_sym_decrypt(v_target.whatsapp_enc, v_key);
END $$;

GRANT EXECUTE ON FUNCTION
  fn_set_contact_details(text, text, text, text),
  fn_grant_contact_share(uuid, text, text, inet, text),
  fn_withdraw_contact_share(uuid, text, text, inet, text),
  unmask_contact_details(uuid, uuid)
TO nsm_app_user;
