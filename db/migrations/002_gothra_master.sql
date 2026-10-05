SET search_path = matrimony_shared, pg_temp;
SET ROLE nsm_owner;
-- 002: gothra reference directory.
--
-- Seed = widely attested rishi gothras, all flagged is_provisional. The community association must
-- ratify this list before launch; profiles naming an unlisted gothra go to the coordinator
-- discrepancy queue (Phase 3) rather than being guessed here.
--
-- lineage_group is the exogamy key: Sagothra exclusion compares lineage_group, not gothra id, so
-- elders can declare spelling variants or allied lineages as one group by giving them the same
-- value, without touching profiles. Seeded 1:1 with the gothra (no groupings asserted).

CREATE TABLE gothra_master (
  id             uuid CONSTRAINT pk_gothra_master PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL CONSTRAINT uq_gothra_master_slug UNIQUE
                   CONSTRAINT ck_gothra_master_slug CHECK (slug ~ '^[a-z][a-z_]{1,40}$'),
  name_en        text NOT NULL CONSTRAINT ck_gothra_master_name_en CHECK (length(btrim(name_en)) BETWEEN 1 AND 60),
  name_te        text NOT NULL CONSTRAINT ck_gothra_master_name_te CHECK (length(btrim(name_te)) BETWEEN 1 AND 60),
  lineage_group  text NOT NULL CONSTRAINT ck_gothra_master_lineage_group CHECK (lineage_group ~ '^[a-z][a-z_]{1,40}$'),
  is_provisional boolean NOT NULL DEFAULT true,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_gothra_master_lineage_group ON gothra_master (lineage_group);
CREATE TRIGGER trg_gothra_master_touch BEFORE UPDATE ON gothra_master
  FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();
ALTER TABLE gothra_master ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY;

INSERT INTO gothra_master (slug, name_en, name_te, lineage_group) VALUES
  ('kashyapa',    'Kashyapa',    'కాశ్యప',     'kashyapa'),
  ('bharadwaja',  'Bharadwaja',  'భరద్వాజ',    'bharadwaja'),
  ('vasishtha',   'Vasishtha',   'వశిష్ఠ',      'vasishtha'),
  ('vishwamitra', 'Vishwamitra', 'విశ్వామిత్ర',  'vishwamitra'),
  ('gautama',     'Gautama',     'గౌతమ',       'gautama'),
  ('atreya',      'Atreya',      'ఆత్రేయ',      'atreya'),
  ('jamadagni',   'Jamadagni',   'జమదగ్ని',     'jamadagni'),
  ('agastya',     'Agastya',     'అగస్త్య',     'agastya'),
  ('kaundinya',   'Kaundinya',   'కౌండిన్య',    'kaundinya'),
  ('shandilya',   'Shandilya',   'శాండిల్య',    'shandilya'),
  ('harita',      'Harita',      'హరిత',       'harita'),
  ('vatsa',       'Vatsa',       'వత్స',       'vatsa'),
  ('srivatsa',    'Srivatsa',    'శ్రీవత్స',     'srivatsa'),
  ('kaushika',    'Kaushika',    'కౌశిక',      'kaushika'),
  ('mudgala',     'Mudgala',     'ముద్గల',      'mudgala'),
  ('gargya',      'Gargya',      'గార్గ్య',      'gargya'),
  ('parashara',   'Parashara',   'పరాశర',      'parashara'),
  ('angirasa',    'Angirasa',    'ఆంగీరస',     'angirasa'),
  ('bhargava',    'Bhargava',    'భార్గవ',      'bhargava'),
  ('dhananjaya',  'Dhananjaya',  'ధనంజయ',     'dhananjaya'),
  ('kutsa',       'Kutsa',       'కుత్స',       'kutsa'),
  ('kanva',       'Kanva',       'కణ్వ',        'kanva');
