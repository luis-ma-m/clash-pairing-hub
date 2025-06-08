-- 0003_add_constraint_settings.sql
-- Add table for pairing constraint toggles

CREATE TABLE IF NOT EXISTS public.constraint_settings (
    name text PRIMARY KEY,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.constraint_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read constraint_settings" ON public.constraint_settings
  FOR SELECT USING (true);
CREATE POLICY "Manage constraint_settings" ON public.constraint_settings
  FOR ALL USING (current_user_role() IN ('admin','organizer'));
