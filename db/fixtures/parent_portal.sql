-- LOCAL ONLY: stand-in for the parent portal's own tables in the same database, loaded by the
-- postgres container's initdb before NSM migrations so the isolation assertions have real targets.
CREATE SCHEMA portal;
CREATE TABLE portal.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ns_membership_id text NOT NULL,
  phone text NOT NULL
);
CREATE TABLE portal.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  amount_inr numeric(12, 2) NOT NULL
);
CREATE TABLE portal.telemetry_events (
  id bigserial PRIMARY KEY,
  member_id uuid,
  event text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  token_hash text NOT NULL
);
INSERT INTO portal.members (ns_membership_id, phone) VALUES ('NS-TG-SRPT-10482', '+910000000000');
INSERT INTO portal.loans (member_id, amount_inr) SELECT id, 25000 FROM portal.members;
INSERT INTO portal.telemetry_events (member_id, event) SELECT id, 'login' FROM portal.members;
INSERT INTO public.portal_sessions (member_id, token_hash) SELECT id, 'sha256:deadbeef' FROM portal.members;
