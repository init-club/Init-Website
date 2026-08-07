import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) process.exit(1);

const sql = postgres(dbUrl, { ssl: 'require' });

async function inspectUsers() {
  console.log('--- ALL ADMIN USERS ---');
  const admins = await sql`
    SELECT id, username, role, auth_user_id, name, created_at
    FROM public.users
    WHERE LOWER(role) = 'admin';
  `;
  console.table(admins);

  console.log('\n--- SEARCH BIJJUDAMA / NITANSH IN PUBLIC.USERS ---');
  const bijju = await sql`
    SELECT id, username, role, auth_user_id, name, created_at
    FROM public.users
    WHERE LOWER(username) LIKE '%bijju%' OR LOWER(name) LIKE '%nitan%' OR LOWER(username) LIKE '%nitan%';
  `;
  console.table(bijju);

  console.log('\n--- SEARCH IN AUTH.USERS ---');
  const authUsers = await sql`
    SELECT id, email, raw_user_meta_data->>'preferred_username' as pref_user, raw_user_meta_data->>'user_name' as gh_user, created_at
    FROM auth.users
    WHERE LOWER(email) LIKE '%nitan%' OR LOWER(raw_user_meta_data->>'preferred_username') LIKE '%bijju%' OR LOWER(raw_user_meta_data->>'user_name') LIKE '%bijju%';
  `;
  console.table(authUsers);

  await sql.end();
}

inspectUsers();
