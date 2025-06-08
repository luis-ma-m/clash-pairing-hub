-- Seed data for DebateMinistrator
-- Inserts an admin user placeholder

INSERT INTO public.users (id, email, role, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'Admin User')
ON CONFLICT DO NOTHING;
