-- 0004_add_tournament_id_to_pairings_brackets.sql
-- Add tournament_id column to pairings and brackets tables

ALTER TABLE public.pairings
  ADD COLUMN tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE;

ALTER TABLE public.brackets
  ADD COLUMN tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE;
