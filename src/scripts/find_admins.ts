import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) process.exit(1);

const sql = postgres(dbUrl, { ssl: 'require' });

async function findAdmins() {
  console.log('--- ADMIN USERS IN PUBLIC.USERS ---');
  const admins = await sql`
    SELECT id, username, role, auth_user_id, name
    FROM public.users
    WHERE LOWER(role) = 'admin';
  `;
  console.table(admins);

  console.log('\n--- ALL USERS WITH NON-NULL AUTH_USER_ID ---');
  const linkedUsers = await sql`
    SELECT id, username, role, auth_user_id
    FROM public.users
    WHERE auth_user_id IS NOT NULL;
  `;
  console.table(linkedUsers);

  await sql.end();
}

findAdmins();
