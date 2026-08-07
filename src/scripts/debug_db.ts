import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is missing from .env.local');
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function debugBackend() {
  console.log('--- DB DEBUG: USERS TABLE ---');
  const users = await sql`
    SELECT id, username, role, auth_user_id, name, created_at
    FROM public.users;
  `;
  console.log('Total users in public.users:', users.length);
  console.table(users);

  console.log('\n--- DB DEBUG: AUTH.USERS TABLE ---');
  const authUsers = await sql`
    SELECT id, email, raw_user_meta_data->>'preferred_username' as pref_username, raw_user_meta_data->>'user_name' as gh_username, created_at
    FROM auth.users;
  `;
  console.log('Total auth users in auth.users:', authUsers.length);
  console.table(authUsers);

  console.log('\n--- DB DEBUG: RLS POLICIES ON PUBLIC.USERS ---');
  const rls = await sql`
    SELECT tablename, policyname, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename = 'users';
  `;
  console.table(rls);

  await sql.end();
}

debugBackend();
