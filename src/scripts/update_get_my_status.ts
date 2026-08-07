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

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL database...');
  try {
    await sql`DROP FUNCTION IF EXISTS public.get_my_status();`;

    await sql`
      CREATE OR REPLACE FUNCTION public.get_my_status()
      RETURNS SETOF public.users
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        current_user_id uuid := auth.uid();
        gh_username text := auth.jwt()->'user_metadata'->>'preferred_username';
      BEGIN
        IF gh_username IS NULL THEN
          gh_username := auth.jwt()->'user_metadata'->>'user_name';
        END IF;

        -- 1. First attempt: Match by auth_user_id
        IF current_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = current_user_id) THEN
          RETURN QUERY SELECT * FROM public.users WHERE auth_user_id = current_user_id;
        
        -- 2. Fallback: Match by github username and automatically link auth_user_id
        ELSIF gh_username IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(gh_username)) THEN
          IF current_user_id IS NOT NULL THEN
            UPDATE public.users 
            SET auth_user_id = current_user_id 
            WHERE LOWER(username) = LOWER(gh_username) AND auth_user_id IS NULL;
          END IF;
          RETURN QUERY SELECT * FROM public.users WHERE LOWER(username) = LOWER(gh_username);
        END IF;
      END;
      $$;
    `;
    console.log('Successfully updated get_my_status function in Supabase PostgreSQL!');

    // Also update any existing user where role is admin/member but auth_user_id was null
    const updatedRows = await sql`
      UPDATE public.users u
      SET auth_user_id = a.id
      FROM auth.users a
      WHERE u.auth_user_id IS NULL
        AND (
          LOWER(u.username) = LOWER(a.raw_user_meta_data->>'preferred_username')
          OR LOWER(u.username) = LOWER(a.raw_user_meta_data->>'user_name')
        )
      RETURNING u.id, u.username, u.role, u.auth_user_id;
    `;

    console.log(`Auto-linked ${updatedRows.length} existing unlinked user accounts:`, updatedRows);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

runMigration();
