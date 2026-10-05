SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 006: onboarding funnel (Phase 3): districts, ratified gothra baseline + member proposals,
-- heritage/career/privacy columns, submission with consent check, coordinator assignment and
-- matrimonial ID generation. Profiles stay locked while a coordinator reviews them.

-- ---------------------------------------------------------------------------------------- districts
CREATE TABLE districts (
  slug    text CONSTRAINT pk_districts PRIMARY KEY CONSTRAINT ck_districts_slug CHECK (slug ~ '^[a-z][a-z-]{1,40}$'),
  code    text NOT NULL CONSTRAINT uq_districts_code UNIQUE CONSTRAINT ck_districts_code CHECK (code ~ '^[A-Z]{4}$'),
  name_en text NOT NULL,
  name_te text NOT NULL
);
COMMENT ON COLUMN districts.code IS 'Four-letter code used in matrimonial IDs (NSM-TG-<code>-YYYY-NNNN).';
ALTER TABLE districts ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;
INSERT INTO districts (slug, code, name_en, name_te) VALUES
  ('adilabad',                'ADLB', 'Adilabad',                'ఆదిలాబాద్'),
  ('bhadradri-kothagudem',    'BDKT', 'Bhadradri Kothagudem',    'భద్రాద్రి కొత్తగూడెం'),
  ('hanumakonda',             'HNMK', 'Hanumakonda',             'హనుమకొండ'),
  ('hyderabad',               'HYDB', 'Hyderabad',               'హైదరాబాద్'),
  ('jagtial',                 'JGTL', 'Jagtial',                 'జగిత్యాల'),
  ('jangaon',                 'JNGN', 'Jangaon',                 'జనగామ'),
  ('jayashankar-bhupalpally', 'JSBP', 'Jayashankar Bhupalpally', 'జయశంకర్ భూపాలపల్లి'),
  ('jogulamba-gadwal',        'JGGD', 'Jogulamba Gadwal',        'జోగులాంబ గద్వాల'),
  ('kamareddy',               'KMRD', 'Kamareddy',               'కామారెడ్డి'),
  ('karimnagar',              'KRMN', 'Karimnagar',              'కరీంనగర్'),
  ('khammam',                 'KHMM', 'Khammam',                 'ఖమ్మం'),
  ('komaram-bheem-asifabad',  'KMBA', 'Komaram Bheem Asifabad',  'కుమురం భీం ఆసిఫాబాద్'),
  ('mahabubabad',             'MHBD', 'Mahabubabad',             'మహబూబాబాద్'),
  ('mahabubnagar',            'MBNR', 'Mahabubnagar',            'మహబూబ్‌నగర్'),
  ('mancherial',              'MNCL', 'Mancherial',              'మంచిర్యాల'),
  ('medak',                   'MEDK', 'Medak',                   'మెదక్'),
  ('medchal-malkajgiri',      'MDCL', 'Medchal Malkajgiri',      'మేడ్చల్ మల్కాజ్‌గిరి'),
  ('mulugu',                  'MULG', 'Mulugu',                  'ములుగు'),
  ('nagarkurnool',            'NGKL', 'Nagarkurnool',            'నాగర్‌కర్నూల్'),
  ('nalgonda',                'NLGD', 'Nalgonda',                'నల్గొండ'),
  ('narayanpet',              'NRPT', 'Narayanpet',              'నారాయణపేట'),
  ('nirmal',                  'NRML', 'Nirmal',                  'నిర్మల్'),
  ('nizamabad',               'NZMB', 'Nizamabad',               'నిజామాబాద్'),
  ('peddapalli',              'PDPL', 'Peddapalli',              'పెద్దపల్లి'),
  ('rajanna-sircilla',        'RJSL', 'Rajanna Sircilla',        'రాజన్న సిరిసిల్ల'),
  ('rangareddy',              'RNGR', 'Rangareddy',              'రంగారెడ్డి'),
  ('sangareddy',              'SNGR', 'Sangareddy',              'సంగారెడ్డి'),
  ('siddipet',                'SDPT', 'Siddipet',                'సిద్దిపేట'),
  ('suryapet',                'SRPT', 'Suryapet',                'సూర్యాపేట'),
  ('vikarabad',               'VKBD', 'Vikarabad',               'వికారాబాద్'),
  ('wanaparthy',              'WNPT', 'Wanaparthy',              'వనపర్తి'),
  ('warangal',                'WRGL', 'Warangal',                'వరంగల్'),
  ('yadadri-bhuvanagiri',     'YDBG', 'Yadadri Bhuvanagiri',     'యాదాద్రి భువనగిరి');

ALTER TABLE sub_admins ADD CONSTRAINT fk_sub_admins_district FOREIGN KEY (district) REFERENCES districts (slug);

-- ----------------------------------------------------------------------------------- gothra_master
-- Decision 2026-10-04: the 22 seeded gothras are the verified (selectable) baseline. Member
-- proposals ("Other / Propose Gothra") enter unverified, in their own lineage group, and block
-- profile verification until a lineage officer ratifies or merges them.
ALTER TABLE gothra_master RENAME COLUMN is_provisional TO is_verified;
UPDATE gothra_master SET is_verified = true;
ALTER TABLE gothra_master ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE gothra_master ADD COLUMN proposed_by uuid;
COMMENT ON COLUMN gothra_master.proposed_by IS 'root_user_id of the proposing member. Purpose: lineage officer follow-up; one open proposal per member.';
CREATE UNIQUE INDEX uq_gothra_master_open_proposal ON gothra_master (proposed_by) WHERE NOT is_verified;

-- ------------------------------------------------------------------------------------------- enums
-- Vocations as offered in the Phase 3 intake. Pre-launch swap: rows holding a dropped value
-- ('other') map to NULL and abort the migration instead of being silently re-labelled.
CREATE TYPE vocation_v2 AS ENUM ('nadopasana', 'wellness_artisan', 'corporate_tech_civil',
                                 'healthcare_traditional_medicine', 'scholarly_academic');
ALTER TABLE profiles ALTER COLUMN vocation TYPE vocation_v2 USING (CASE vocation::text
  WHEN 'salon_entrepreneur' THEN 'wellness_artisan'
  WHEN 'corporate'          THEN 'corporate_tech_civil'
  WHEN 'government'         THEN 'corporate_tech_civil'
  WHEN 'other'              THEN NULL
  ELSE vocation::text END)::vocation_v2;
DROP TYPE vocation;
ALTER TYPE vocation_v2 RENAME TO vocation;

CREATE TYPE income_bracket   AS ENUM ('upto_3l', '3l_6l', '6l_12l', '12l_25l', '25l_50l', 'above_50l', 'prefer_not_to_say');
CREATE TYPE photo_visibility AS ENUM ('public_verified', 'blurred', 'on_request');
CREATE TYPE nakshatra AS ENUM (
  'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra', 'punarvasu', 'pushya', 'ashlesha',
  'magha', 'purva_phalguni', 'uttara_phalguni', 'hasta', 'chitra', 'swati', 'vishakha', 'anuradha',
  'jyeshtha', 'mula', 'purva_ashadha', 'uttara_ashadha', 'shravana', 'dhanishta', 'shatabhisha',
  'purva_bhadrapada', 'uttara_bhadrapada', 'revati');
-- Signed Self-Respect Pledge (Step 2). Not a processing purpose, but it needs the same
-- immutable, hash-chained evidence trail. Not usable inside this transaction (PG rule).
ALTER TYPE consent_purpose ADD VALUE 'community_pledge';

-- ---------------------------------------------------------------------------------------- profiles
ALTER TABLE profiles RENAME COLUMN district TO ancestral_native_district;
ALTER TABLE profiles RENAME COLUMN mandal TO ancestral_native_mandal;
ALTER TABLE profiles RENAME CONSTRAINT ck_profiles_district TO ck_profiles_ancestral_native_district;
ALTER TABLE profiles RENAME CONSTRAINT ck_profiles_mandal TO ck_profiles_ancestral_native_mandal;
ALTER INDEX ix_profiles_district_mandal RENAME TO ix_profiles_ancestral_native_district_mandal;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_ancestral_native_district
  FOREIGN KEY (ancestral_native_district) REFERENCES districts (slug);
COMMENT ON COLUMN profiles.ancestral_native_district IS 'Slug. Purpose: coordinator scoping/assignment, matrimonial ID, proximity ranking.';
COMMENT ON COLUMN profiles.ancestral_native_mandal   IS 'Slug. Purpose: coordinator scoping/assignment and proximity ranking.';

-- Career fields are nullable so a draft can be partial; fn_submit_profile() requires them.
ALTER TABLE profiles
  ADD COLUMN maternal_lineage text CONSTRAINT ck_profiles_maternal_lineage CHECK (length(btrim(maternal_lineage)) BETWEEN 1 AND 80),
  ADD COLUMN education_degree text CONSTRAINT ck_profiles_education_degree CHECK (length(btrim(education_degree)) BETWEEN 1 AND 120),
  ADD COLUMN occupation       text CONSTRAINT ck_profiles_occupation CHECK (length(btrim(occupation)) BETWEEN 1 AND 120),
  ADD COLUMN income_bracket   income_bracket,
  ADD COLUMN salon_hub_slug   text CONSTRAINT ck_profiles_salon_hub_slug CHECK (salon_hub_slug ~ '^[a-z0-9][a-z0-9-]{2,62}$'),
  ADD COLUMN birth_time       time,
  ADD COLUMN birth_place      text CONSTRAINT ck_profiles_birth_place CHECK (length(btrim(birth_place)) BETWEEN 1 AND 80),
  ADD COLUMN nakshatra        nakshatra,
  ADD COLUMN photo_visibility photo_visibility NOT NULL DEFAULT 'on_request',
  ADD COLUMN assigned_coordinator_user_id uuid,
  ADD COLUMN matrimonial_id   text CONSTRAINT uq_profiles_matrimonial_id UNIQUE
                                   CONSTRAINT ck_profiles_matrimonial_id CHECK (matrimonial_id ~ '^NSM-TG-[A-Z]{4}-[0-9]{4}-[0-9]{4,}$'),
  ADD COLUMN submitted_at     timestamptz,
  ADD CONSTRAINT ck_profiles_salon_hub_vocation CHECK (salon_hub_slug IS NULL OR vocation = 'wellness_artisan');
COMMENT ON COLUMN profiles.maternal_lineage IS 'Optional. Purpose: family lineage customs checked by coordinators and families.';
COMMENT ON COLUMN profiles.education_degree IS 'Purpose: shown to matches.';
COMMENT ON COLUMN profiles.occupation       IS 'Purpose: shown to matches.';
COMMENT ON COLUMN profiles.income_bracket   IS 'Bracket only (or prefer_not_to_say). Purpose: shown to matches.';
COMMENT ON COLUMN profiles.salon_hub_slug   IS 'Optional enterprise badge: listing slug on /salon-hub, confirmed by the coordinator.';
COMMENT ON COLUMN profiles.birth_time       IS 'Optional Jathakam field. Purpose: horoscope matching by families.';
COMMENT ON COLUMN profiles.birth_place      IS 'Optional Jathakam field. Purpose: horoscope matching by families.';
COMMENT ON COLUMN profiles.nakshatra        IS 'Optional Jathakam field. Purpose: horoscope matching by families.';
COMMENT ON COLUMN profiles.photo_visibility IS 'Owner privacy choice for the (Phase 4) photo; most private by default.';
COMMENT ON COLUMN profiles.assigned_coordinator_user_id IS 'Mandal coordinator queue owner; NULL = district lineage officer queue.';
COMMENT ON COLUMN profiles.matrimonial_id   IS 'Public reference, generated once at first submission.';

CREATE TABLE matrimonial_id_counters (
  district_code text NOT NULL CONSTRAINT fk_matrimonial_id_counters_district_code REFERENCES districts (code),
  year          int  NOT NULL,
  last_value    int  NOT NULL,
  CONSTRAINT pk_matrimonial_id_counters PRIMARY KEY (district_code, year)
);
ALTER TABLE matrimonial_id_counters ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------------------- helpers
CREATE FUNCTION fn_gothra_is_verified(p_gothra_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$ SELECT coalesce((SELECT is_verified AND active FROM gothra_master WHERE id = p_gothra_id), false) $$;

-- Least-loaded active coordinator of that mandal, never the member themselves; NULL routes the
-- profile to the district lineage officer (who already sees the whole district via RLS).
CREATE FUNCTION fn_pick_coordinator(p_district text, p_mandal text, p_exclude uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
  SELECT sa.root_user_id
    FROM sub_admins sa
   WHERE sa.active AND sa.role = 'mandal_coordinator'
     AND sa.district = p_district AND sa.mandal = p_mandal
     AND sa.root_user_id IS DISTINCT FROM p_exclude
   ORDER BY (SELECT count(*) FROM profiles q
              WHERE q.assigned_coordinator_user_id = sa.root_user_id AND q.status = 'pending_mandal_review'),
            sa.created_at, sa.id
   LIMIT 1
$$;

-- Replaces 003's guard: renamed columns, review lock, submission only via fn_submit_profile(),
-- re-routing on identity edits, and no verification while the gothra is unratified.
CREATE OR REPLACE FUNCTION fn_guard_profile_update() RETURNS trigger
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
    -- A coordinator must approve exactly what they reviewed.
    IF OLD.status = 'pending_mandal_review' THEN
      RAISE EXCEPTION 'profile is locked while under review' USING ERRCODE = 'check_violation';
    END IF;
    IF (NEW.reviewed_by, NEW.reviewed_at, NEW.review_note) IS DISTINCT FROM (OLD.reviewed_by, OLD.reviewed_at, OLD.review_note) THEN
      RAISE EXCEPTION 'owners cannot edit review fields' USING ERRCODE = 'check_violation';
    END IF;
    -- current_user is nsm_owner only inside SECURITY DEFINER code, i.e. fn_submit_profile().
    IF NEW.status IS DISTINCT FROM OLD.status AND (current_user = 'nsm_app_user'
       OR NOT (OLD.status IN ('draft', 'rejected') AND NEW.status = 'pending_mandal_review')) THEN
      RAISE EXCEPTION 'owners submit only via fn_submit_profile (% -> %)', OLD.status, NEW.status USING ERRCODE = 'check_violation';
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
  IF NEW.status = 'verified' AND OLD.status <> 'verified' AND NOT fn_gothra_is_verified(NEW.gothra_id) THEN
    RAISE EXCEPTION 'gothra must be ratified before verification' USING ERRCODE = 'check_violation';
  END IF;
  NEW.reviewed_by := v_me;
  NEW.reviewed_at := now();
  RETURN NEW;
END $$;

-- "Other / Propose Gothra": returns an existing gothra on a name/slug match, else records one
-- unverified proposal per member in its own lineage group (fail-closed for Sagothra matching).
CREATE FUNCTION fn_propose_gothra(p_name_en text, p_name_te text) RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = matrimony_shared, pg_temp
AS $$
DECLARE
  v_me   uuid := fn_current_user_id();
  v_name text := btrim(regexp_replace(coalesce(p_name_en, ''), '\s+', ' ', 'g'));
  v_te   text := coalesce(nullif(btrim(p_name_te), ''), btrim(regexp_replace(coalesce(p_name_en, ''), '\s+', ' ', 'g')));
  v_slug text;
  v_id   uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'no request identity' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_name !~ '^[A-Za-z][A-Za-z .''-]{1,58}$' OR length(v_te) > 60 THEN
    RAISE EXCEPTION 'invalid gothra name' USING ERRCODE = 'check_violation';
  END IF;
  v_slug := left(btrim(regexp_replace(lower(v_name), '[^a-z]+', '_', 'g'), '_'), 40);
  SELECT id INTO v_id FROM gothra_master WHERE slug = v_slug OR lower(name_en) = lower(v_name) ORDER BY is_verified DESC LIMIT 1;
  IF FOUND THEN
    RETURN v_id;
  END IF;
  IF EXISTS (SELECT 1 FROM gothra_master WHERE proposed_by = v_me AND NOT is_verified) THEN
    RAISE EXCEPTION 'one open gothra proposal per member' USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO gothra_master (slug, name_en, name_te, lineage_group, is_verified, proposed_by)
  VALUES (v_slug, v_name, v_te, v_slug, false, v_me)
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- Draft/rejected -> pending_mandal_review. Requires a complete profile with encrypted contact and
-- the caller's latest pledge, profile_processing and coordinator_verification rows granted.
-- ponytail: counters lock one (district, year) row per submission; fine at community scale.
CREATE FUNCTION fn_submit_profile() RETURNS TABLE (matrimonial_id text, coordinator_assigned boolean)
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
  IF v_p.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'profile already submitted (%)', v_p.status USING ERRCODE = 'object_not_in_prerequisite_state';
  END IF;
  IF v_p.education_degree IS NULL OR v_p.occupation IS NULL OR v_p.income_bracket IS NULL
     OR v_p.phone_enc IS NULL OR v_p.door_address_enc IS NULL THEN
    RAISE EXCEPTION 'profile incomplete' USING ERRCODE = 'check_violation';
  END IF;
  FOREACH v_purpose IN ARRAY '{community_pledge,profile_processing,coordinator_verification}'::consent_purpose[] LOOP
    IF NOT coalesce((SELECT c.granted FROM dpdp_consent_logs c
                      WHERE c.root_user_id = v_me AND c.purpose = v_purpose
                      ORDER BY c.seq DESC LIMIT 1), false) THEN
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

-- ------------------------------------------------------------------------------------------ grants
GRANT SELECT ON districts TO nsm_app_user;
CREATE POLICY pol_districts_member_select ON districts FOR SELECT TO nsm_app_user USING (true);

-- Unratified proposals are visible only through a profile the viewer can already see.
DROP POLICY pol_gothra_master_member_select ON gothra_master;
CREATE POLICY pol_gothra_master_member_select ON gothra_master FOR SELECT TO nsm_app_user
  USING (is_verified OR EXISTS (SELECT 1 FROM profiles p WHERE p.gothra_id = gothra_master.id));

GRANT SELECT (maternal_lineage, education_degree, occupation, income_bracket, salon_hub_slug, birth_time,
              birth_place, nakshatra, photo_visibility, assigned_coordinator_user_id, matrimonial_id, submitted_at)
  ON profiles TO nsm_app_user;
GRANT INSERT (maternal_lineage, education_degree, occupation, income_bracket, salon_hub_slug, birth_time,
              birth_place, nakshatra, photo_visibility)
  ON profiles TO nsm_app_user;
GRANT UPDATE (maternal_lineage, education_degree, occupation, income_bracket, salon_hub_slug, birth_time,
              birth_place, nakshatra, photo_visibility)
  ON profiles TO nsm_app_user;

GRANT EXECUTE ON FUNCTION
  fn_gothra_is_verified(uuid), fn_pick_coordinator(text, text, uuid),
  fn_propose_gothra(text, text), fn_submit_profile()
TO nsm_app_user;
