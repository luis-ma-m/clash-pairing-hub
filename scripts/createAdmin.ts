import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in your environment');
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY);

async function main() {
  const email = 'admin@luis.martin';
  const password = 'sa1965';

  let userId: string | undefined;

  if (SERVICE_KEY) {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error('Failed to create auth user:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
  } else {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error || !data.user) {
      console.error('Failed to sign up user:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
  }

  const { error: insertError } = await client.from('users').insert({
    id: userId,
    email,
    role: 'admin',
    name: 'Admin User',
  });

  if (insertError) {
    console.error('Failed to insert user row:', insertError.message);
    process.exit(1);
  }

  console.log(`Admin user ${email} created`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
