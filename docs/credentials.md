# Admin Credentials and Supabase Environment

The initial admin user credentials are:

- **Email:** `admin@luis.martin`
- **Password:** `sa1965`

These credentials are required when running the setup script:

```bash
npm run create-admin
```

Ensure the following environment variables are configured in your `.env` file before executing this command:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional)

The values should correspond to your Supabase project. See the README for details on obtaining them.
