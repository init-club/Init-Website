# Supabase Database Direct Access & PostgREST Client Guide

This document explains how the application and administrative scripts communicate directly with the hosted **Supabase PostgreSQL** instance over HTTP/HTTPS APIs without requiring the Supabase CLI (`supabase cli`).

---

## 1. Overview of Supabase Direct API Access

Supabase exposes auto-generated RESTful APIs for PostgreSQL tables via **PostgREST**. By leveraging official client libraries such as `@supabase/supabase-js`, applications and Node.js maintenance scripts can interact directly with the database endpoint (`https://<project-ref>.supabase.co`).

---

## 2. Environment Variables & Authentication Keys

Direct API access relies on environment variables configured in `.env.local` (or standard environment manager):

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

### Key Differences:
1. **`VITE_SUPABASE_PUBLISHABLE_KEY` (Anon/Public Key)**:
   - Used by the React frontend client (`src/supabaseClient.ts`).
   - Enforces **Row Level Security (RLS)** policies defined in PostgreSQL.
2. **`SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key)**:
   - Used by administrative Node.js maintenance scripts and Supabase Edge Functions.
   - Bypasses RLS policies for database administration, schema maintenance, and batch data updates.

---

## 3. Interacting Programmatically (Node.js & `@supabase/supabase-js`)

Without relying on local Supabase CLI tools, Node.js scripts can connect directly over PostgREST HTTP protocols:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Instantiate administrative client with elevated permissions
const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Direct database queries & updates
async function updateDatabase() {
  const { data, error } = await supabase
    .from('contribution_stats')
    .update({ score: 100 })
    .eq('user_id', 'target-user-uuid');

  if (error) console.error('API Error:', error);
}
```

---

---

## 4. Performing Database Migrations Without Supabase CLI

Database migrations and schema updates can be generated and applied directly via **Drizzle ORM** (`drizzle-kit`) using the direct connection string (`DATABASE_URL`) without requiring `supabase cli`:

### Connection Requirements:
Set the direct PostgreSQL connection string in `.env.local`:
```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
```

### Execution Commands:

1. **Generate Migration Files**:
   Generate SQL migration scripts based on changes in `src/db/schema.ts`:
   ```bash
   npx drizzle-kit generate
   ```

2. **Push Migration Directly to Live Database**:
   Push schema changes directly to the hosted Supabase PostgreSQL instance:
   ```bash
   npx drizzle-kit push
   ```

3. **Execute SQL Migration Scripts via Node.js (`postgres` driver)**:
   For custom SQL migrations without CLI:
   ```typescript
   import postgres from 'postgres';

   const sql = postgres(process.env.DATABASE_URL!);
   await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_core_member BOOLEAN DEFAULT false;`;
   await sql.end();
   ```

---

## 5. Why This Architecture Works Without Supabase CLI

- **RESTful Endpoints**: PostgREST maps HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) directly to PostgreSQL table operations.
- **Hosted Pooler Access**: Direct connection strings (`DATABASE_URL`) connect to Supabase's hosted pgBouncer transaction pooler over port `6543`.
- **Zero Local CLI Dependency**: Production web apps, Drizzle migrations, and maintenance tasks execute standard HTTPS and SQL connections without requiring local Deno/Docker CLI runtimes.
