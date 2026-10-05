-- Shared fixture for the 004/005 suites. Runs inside the caller's transaction (always rolled back),
-- connected as a superuser that switches roles.
--
--   A  Kashyapa    suryapet/kodad          male    verified by M
--   B  Bharadwaja  suryapet/kodad          female  verified by M
--   C  Kashyapa    suryapet/huzurnagar     female  verified by L   (Sagothra with A)
--   D  Vasishtha   hyderabad/secunderabad  female  verified by operator
--   X  member with no profile
--   M  mandal coordinator (suryapet/kodad), L district lineage officer (suryapet), G grievance officer
SET LOCAL search_path = matrimony_shared, pg_temp;
SELECT set_config('nsm.contact_key', 'fixture-contact-key-0123456789abcdef', true);

CREATE FUNCTION pg_temp.u(who text) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('10000000-0000-4000-8000-0000000000' || CASE who
    WHEN 'A' THEN '0a' WHEN 'B' THEN '0b' WHEN 'C' THEN '0c' WHEN 'D' THEN '0d' WHEN 'X' THEN '0e'
    WHEN 'M' THEN '1a' WHEN 'L' THEN '1b' WHEN 'G' THEN '1c' WHEN 'ADMIN' THEN 'ff' END)::uuid
$$;
CREATE FUNCTION pg_temp.p(who text) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('20000000' || substr(pg_temp.u(who)::text, 9))::uuid
$$;
CREATE FUNCTION pg_temp.act_as(who text, roles text DEFAULT '["member"]') RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', coalesce(pg_temp.u(who)::text, ''), true);
  PERFORM set_config('request.jwt.claim.roles', roles, true);
END $$;

SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
INSERT INTO sub_admins (root_user_id, role, district, mandal, assigned_by) VALUES
  (pg_temp.u('M'), 'mandal_coordinator',       'suryapet', 'kodad', pg_temp.u('ADMIN')),
  (pg_temp.u('L'), 'district_lineage_officer', 'suryapet', NULL,    pg_temp.u('ADMIN')),
  (pg_temp.u('G'), 'grievance_officer',        NULL,       NULL,    pg_temp.u('ADMIN'));
INSERT INTO profiles (id, root_user_id, ns_membership_id, display_name, gender, date_of_birth,
                      gothra_id, ancestral_native_district, ancestral_native_mandal, vocation, status)
SELECT pg_temp.p(v.who), pg_temp.u(v.who), v.nsid, v.name, v.gender::gender,
       current_date - v.age * interval '1 year', g.id, v.district, v.mandal, v.vocation::vocation,
       'draft'
  FROM (VALUES
    ('A', 'NS-TG-SRPT-10001', 'Arjun',    'male',   30, 'kashyapa',   'suryapet',  'kodad',        'nadopasana'),
    ('B', 'NS-TG-SRPT-10002', 'Bhavani',  'female', 27, 'bharadwaja', 'suryapet',  'kodad',        'wellness_artisan'),
    ('C', 'NS-TG-SRPT-10003', 'Chandana', 'female', 26, 'kashyapa',   'suryapet',  'huzurnagar',   'corporate_tech_civil'),
    ('D', 'NS-TG-HYD-10004',  'Divya',    'female', 28, 'vasishtha',  'hyderabad', 'secunderabad', 'healthcare_traditional_medicine')
  ) AS v(who, nsid, name, gender, age, gothra, district, mandal, vocation)
  JOIN gothra_master g ON g.slug = v.gothra;

SET LOCAL ROLE nsm_app_user;
SELECT pg_temp.act_as('A');
SELECT fn_set_contact_details('+919876500001', 'arjun@example.invalid', '+919876500001', '1-2 Main Road, Kodad');
SELECT pg_temp.act_as('B');
SELECT fn_set_contact_details('+919876500002', 'bhavani@example.invalid', '+919876500012', '3-4 Temple Street, Kodad');
SELECT pg_temp.act_as('C');
SELECT fn_set_contact_details('+919876500003', 'chandana@example.invalid', '+919876500003', '5 Bazaar Road, Huzurnagar');
SELECT pg_temp.act_as('D');
SELECT fn_set_contact_details('+919876500004', 'divya@example.invalid', '+919876500004', '6 Station Road, Secunderabad');

RESET ROLE;
SET LOCAL ROLE nsm_owner;
SELECT pg_temp.act_as(NULL);
UPDATE profiles SET status = CASE WHEN id = pg_temp.p('D') THEN 'verified' ELSE 'pending_mandal_review' END::profile_status;
RESET ROLE;
SET LOCAL ROLE nsm_app_user;
SELECT pg_temp.act_as('M', '["member","mandal_coordinator"]');
UPDATE profiles SET status = 'verified' WHERE id IN (pg_temp.p('A'), pg_temp.p('B'));
SELECT pg_temp.act_as('L', '["member","district_lineage_officer"]');
UPDATE profiles SET status = 'verified' WHERE id = pg_temp.p('C');

SELECT pg_temp.act_as(NULL);
RESET ROLE;
