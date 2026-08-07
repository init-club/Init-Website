import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) process.exit(1);

const sql = postgres(dbUrl, { ssl: 'require' });

async function testRpc() {
  console.log('--- RPC TEST: get_my_status DEFINITION ---');
  const funcDef = await sql`
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_my_status';
  `;
  console.log(funcDef[0]?.pg_get_functiondef);

  await sql.end();
}

testRpc();
