-- Add additional fields to users table
ALTER TABLE public.users
  ADD COLUMN avatar_url text,
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN last_login timestamptz;
