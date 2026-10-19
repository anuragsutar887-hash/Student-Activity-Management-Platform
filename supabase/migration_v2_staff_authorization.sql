-- ==============================================================================
-- IT PULSE: STAFF AUTHORIZATION & ACADEMIC GROUPS MIGRATION V2
-- Additive migration: adds new tables only. No existing tables are modified.
-- Safe to run multiple times (idempotent).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.academic_classes (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  academic_session TEXT NOT NULL,
  year_level       TEXT NOT NULL,
  department       TEXT NOT NULL,
  division         TEXT DEFAULT NULL,
  status           TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (academic_session, year_level, department, division)
);

ALTER TABLE public.academic_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read academic_classes" ON public.academic_classes;
CREATE POLICY "Public read academic_classes" ON public.academic_classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage academic_classes" ON public.academic_classes;
CREATE POLICY "Admin manage academic_classes" ON public.academic_classes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_email   TEXT NOT NULL,
  staff_name    TEXT NOT NULL,
  class_id      BIGINT NOT NULL REFERENCES public.academic_classes(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Revoked')),
  assigned_by   TEXT NOT NULL DEFAULT 'admin@itpulse.edu',
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ DEFAULT NULL,
  revoked_by    TEXT DEFAULT NULL,
  notes         TEXT DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_staff_assignment
  ON public.staff_assignments (staff_email, class_id) WHERE status = 'Active';

ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read staff_assignments" ON public.staff_assignments;
CREATE POLICY "Public read staff_assignments" ON public.staff_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage staff_assignments" ON public.staff_assignments;
CREATE POLICY "Admin manage staff_assignments" ON public.staff_assignments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.class_memberships (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_prn   TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  student_email TEXT DEFAULT NULL,
  class_id      BIGINT NOT NULL REFERENCES public.academic_classes(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Removed', 'Transferred')),
  enrolled_by   TEXT NOT NULL DEFAULT 'admin@itpulse.edu',
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at    TIMESTAMPTZ DEFAULT NULL,
  removed_by    TEXT DEFAULT NULL,
  notes         TEXT DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_class_membership
  ON public.class_memberships (student_prn, class_id) WHERE status = 'Active';

ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read class_memberships" ON public.class_memberships;
CREATE POLICY "Public read class_memberships" ON public.class_memberships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage class_memberships" ON public.class_memberships;
CREATE POLICY "Staff manage class_memberships" ON public.class_memberships FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor        TEXT NOT NULL,
  actor_role   TEXT DEFAULT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT DEFAULT NULL,
  target_id    TEXT DEFAULT NULL,
  target_label TEXT DEFAULT NULL,
  details      JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor   ON public.audit_logs (actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read audit_logs" ON public.audit_logs;
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert audit_logs" ON public.audit_logs;
CREATE POLICY "Insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_academic_classes_updated_at ON public.academic_classes;
CREATE TRIGGER trg_academic_classes_updated_at
  BEFORE UPDATE ON public.academic_classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_staff_assignments_updated_at ON public.staff_assignments;
CREATE TRIGGER trg_staff_assignments_updated_at
  BEFORE UPDATE ON public.staff_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_class_memberships_updated_at ON public.class_memberships;
CREATE TRIGGER trg_class_memberships_updated_at
  BEFORE UPDATE ON public.class_memberships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.academic_classes (academic_session, year_level, department)
VALUES
  ('2026-27', 'FY',         'Information Technology'),
  ('2026-27', 'SY',         'Information Technology'),
  ('2026-27', 'TY',         'Information Technology'),
  ('2026-27', 'Final Year', 'Information Technology')
ON CONFLICT DO NOTHING;