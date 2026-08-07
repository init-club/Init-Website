import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) process.exit(1);

const sql = postgres(dbUrl, { ssl: 'require' });

async function inspectRlsAndColumns() {
  console.log('--- PUBLIC.USERS RLS STATUS ---');
  const rel = await sql`
    SELECT relname, relrowsecurity, relforcerowsecurity
    FROM pg_class
    WHERE relname = 'users';
  `;
  console.table(rel);

  console.log('--- ALL POLICIES ON PUBLIC.USERS ---');
  const policies = await sql`
    SELECT policyname, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename = 'users';
  `;
  console.table(policies);

  console.log('--- BIJJUDAMA FULL RECORD ---');
  const user = await sql`
    SELECT *
    FROM public.users
    WHERE username = 'BIJJUDAMA';
  `;
  console.log(user[0]);

  await sql.end();
}

inspectRlsAndColumns();
