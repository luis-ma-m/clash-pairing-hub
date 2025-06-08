-- 0001_create_schema.sql
-- Schema for DebateMinistrator

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table links to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('admin','organizer','judge','speaker')),
    name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Function to check current role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Tournaments
CREATE TABLE IF NOT EXISTS public.tournaments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    format text,
    status text DEFAULT 'draft',
    settings jsonb,
    owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    name text NOT NULL,
    organization text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Speakers
CREATE TABLE IF NOT EXISTS public.speakers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    name text NOT NULL,
    position integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Rounds
CREATE TABLE IF NOT EXISTS public.rounds (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_number integer NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Debates
CREATE TABLE IF NOT EXISTS public.debates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id uuid REFERENCES public.rounds(id) ON DELETE CASCADE,
    room text,
    status text DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Debate teams
CREATE TABLE IF NOT EXISTS public.debate_teams (
    debate_id uuid REFERENCES public.debates(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    position text,
    PRIMARY KEY (debate_id, team_id)
);

-- Scores
CREATE TABLE IF NOT EXISTS public.scores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id uuid REFERENCES public.debates(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    speaker_id uuid REFERENCES public.speakers(id) ON DELETE CASCADE,
    points integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Common policy helpers
CREATE POLICY "All select" ON public.users FOR SELECT USING (auth.uid() = id OR current_user_role() = 'admin');
CREATE POLICY "All update" ON public.users FOR UPDATE USING (auth.uid() = id OR current_user_role() = 'admin');
CREATE POLICY "Admin manage" ON public.users FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "Read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Manage tournaments" ON public.tournaments FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Manage teams" ON public.teams FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Manage speakers" ON public.speakers FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Manage rounds" ON public.rounds FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read debates" ON public.debates FOR SELECT USING (true);
CREATE POLICY "Manage debates" ON public.debates FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read debate teams" ON public.debate_teams FOR SELECT USING (true);
CREATE POLICY "Manage debate teams" ON public.debate_teams FOR ALL USING (current_user_role() IN ('admin','organizer'));

CREATE POLICY "Read scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Manage scores" ON public.scores FOR ALL USING (current_user_role() IN ('admin','organizer'));

