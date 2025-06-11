-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING ( auth.uid() = id );

-- Allow users to update name and avatar on their own profile
CREATE POLICY "Users can edit their own profile"
ON public.users FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- Allow admins full access
CREATE POLICY "Admins can manage all users"
ON public.users FOR ALL
USING ( auth.jwt() ->> 'role' = 'admin' );
