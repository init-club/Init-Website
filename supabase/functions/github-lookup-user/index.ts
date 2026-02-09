import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { github_username } = await req.json()

        if (!github_username) {
            throw new Error("Missing github_username in request body")
        }

        // 1. Verify GitHub Membership
        // Using the GitHub API to check membership in 'init-club'
        const GH_PAT = Deno.env.get('github_pat')
        if (!GH_PAT) throw new Error("Missing 'github_pat' environment variable")

        const ghRes = await fetch(`https://api.github.com/orgs/init-club/memberships/${github_username}`, {
            headers: {
                Authorization: `Bearer ${GH_PAT}`,
                Accept: 'application/vnd.github+json'
            }
        })

        if (!ghRes.ok) {
            console.log(`User ${github_username} not found in org or error: ${ghRes.status}`)
            return new Response(JSON.stringify({ error: "User not in organization" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const membershipData = await ghRes.json()
        // Check if state is active (not pending) - though usually strictly being in the list is enough
        if (membershipData.state !== 'active') {
            console.log(`User ${github_username} is pending or inactive.`)
            // Optional: Decide if pending members are allowed. For now, strict check? 
            // Let's allow them but log it. Or maybe not.
        }

        // 2. Fetch User Details to get ID/Avatar (The membership endpoint gives user object)
        const userDetails = membershipData.user;

        // 3. Add to Supabase Whitelist
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing Supabase environment variables")
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { error: upsertError } = await supabase.from('users').upsert({
            github_id: userDetails.id,
            username: userDetails.login,
            name: userDetails.name || userDetails.login, // Fallback to handle if name is null
            avatar_url: userDetails.avatar_url,
            role: 'member',     // Default role
            is_active: true,
            last_seen_at: new Date().toISOString()
        }, {
            onConflict: 'github_id'
        })

        if (upsertError) {
            throw upsertError
        }

        return new Response(
            JSON.stringify({ message: `User ${github_username} successfully whitelisted.` }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
