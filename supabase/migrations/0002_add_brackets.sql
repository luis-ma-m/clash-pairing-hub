-- 0002_add_brackets.sql
-- Add brackets table for elimination brackets

CREATE TABLE IF NOT EXISTS public.brackets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL CHECK (type IN ('single','double')),
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read brackets" ON public.brackets FOR SELECT USING (true);
CREATE POLICY "Manage brackets" ON public.brackets FOR ALL USING (current_user_role() IN ('admin','organizer'));
