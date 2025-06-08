-- Seed data for DebateMinistrator
-- Inserts an admin user placeholder

INSERT INTO public.users (id, email, role, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'Admin User')
ON CONFLICT DO NOTHING;

-- Initialize settings with round 1
INSERT INTO public.settings (id, "currentRound")
VALUES ('11111111-1111-1111-1111-111111111111', 1)
ON CONFLICT DO NOTHING;

-- Default constraint settings
INSERT INTO public.constraint_settings (name, enabled) VALUES
  ('NoRepeatMatch', true),
  ('JudgeAvailability', true),
  ('RoomCapacity', true)
ON CONFLICT (name) DO NOTHING;
