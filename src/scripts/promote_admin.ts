import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) process.exit(1);

const sql = postgres(dbUrl, { ssl: 'require' });

async function setBijjudamaAdmin() {
  console.log('Promoting BIJJUDAMA to admin role in database...');
  const res = await sql`
    UPDATE public.users 
    SET role = 'admin' 
    WHERE username = 'BIJJUDAMA'
    RETURNING id, username, role, auth_user_id;
  `;
  console.log('Updated user record:', res);
  await sql.end();
}

setBijjudamaAdmin();
