import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createRunLogger, describeError } from '../_shared/logger.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GITHUB_USERNAME_REGEX =
    /^(?!-)(?!.*-$)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

const isValidGitHubUsername = (
    value: unknown
): value is string => {
    if (typeof value !== 'string') {
        return false
    }

    const username = value.trim()

    return (
        username.length >= 1 &&
        username.length <= 39 &&
        GITHUB_USERNAME_REGEX.test(username)
    )
}

const getGitHubUsernameFromAuthUser = (
    user: any
): string | null => {
    const metadata = user?.user_metadata ?? {}

    const identityData =
        user?.identities?.find(
            (identity: any) =>
                identity?.provider === 'github'
        )?.identity_data ?? {}

    const username =
        metadata.preferred_username ||
        metadata.user_name ||
        identityData.login ||
        identityData.user_name

    if (!isValidGitHubUsername(username)) {
        return null
    }

    return username.trim()
}

Deno.serve(async (req) => {
    const run = createRunLogger('github-lookup-user')

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        })
    }

    try {
        /*
         * --------------------------------------------------------------------
         * 1. AUTHENTICATE THE CALLER
         * --------------------------------------------------------------------
         *
         * This function must never be usable anonymously.
         */

        const authorization =
            req.headers.get('Authorization')

        if (
            !authorization ||
            !authorization.toLowerCase().startsWith('bearer ')
        ) {
            return new Response(
                JSON.stringify({
                    error: 'Authentication required'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    status: 401
                }
            )
        }

        const accessToken =
            authorization
                .replace(/^Bearer\s+/i, '')
                .trim()

        if (!accessToken) {
            return new Response(
                JSON.stringify({
                    error: 'Authentication required'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    status: 401
                }
            )
        }

        /*
         * --------------------------------------------------------------------
         * 2. CREATE SERVER-SIDE SUPABASE CLIENT
         * --------------------------------------------------------------------
         */

        const SUPABASE_URL =
            Deno.env.get('SUPABASE_URL')

        const SUPABASE_SERVICE_ROLE_KEY =
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (
            !SUPABASE_URL ||
            !SUPABASE_SERVICE_ROLE_KEY
        ) {
            throw new Error(
                'Missing Supabase environment variables'
            )
        }

        const supabase = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        )

        /*
         * --------------------------------------------------------------------
         * 3. VERIFY THE SUPABASE ACCESS TOKEN
         * --------------------------------------------------------------------
         */

        const {
            data: {
                user: authUser
            },
            error: authError
        } = await supabase.auth.getUser(
            accessToken
        )

        if (
            authError ||
            !authUser
        ) {
            run.warn(
                'authorization.invalid_token'
            )

            return new Response(
                JSON.stringify({
                    error: 'Invalid or expired authentication token'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    status: 401
                }
            )
        }

        /*
         * --------------------------------------------------------------------
         * 4. READ REQUESTED GITHUB USERNAME
         * --------------------------------------------------------------------
         */

        const {
            github_username:
                rawGithubUsername
        } = await req.json()

        if (
            !isValidGitHubUsername(
                rawGithubUsername
            )
        ) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid GitHub username'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    status: 400
                }
            )
        }

        const github_username =
            rawGithubUsername.trim()

        /*
         * --------------------------------------------------------------------
         * 5. DETERMINE WHO IS MAKING THE REQUEST
         * --------------------------------------------------------------------
         */

        const callerGithubUsername =
            getGitHubUsernameFromAuthUser(
                authUser
            )

        /*
         * Look up the caller's current member record.
         *
         * auth_user_id is the strongest match.
         *
         * The username fallback is needed for users who were previously
         * whitelisted before their auth_user_id was linked.
         */

        let callerRecord: {
            id: string
            username: string
            role: string | null
        } | null = null

        const {
            data: authMatchedUser,
            error: authMatchedUserError
        } = await supabase
            .from('users')
            .select('id, username, role')
            .eq(
                'auth_user_id',
                authUser.id
            )
            .maybeSingle()

        if (authMatchedUserError) {
            throw authMatchedUserError
        }

        callerRecord =
            authMatchedUser

        if (
            !callerRecord &&
            callerGithubUsername
        ) {
            const {
                data: usernameMatchedUser,
                error:
                    usernameMatchedUserError
            } = await supabase
                .from('users')
                .select('id, username, role')
                .ilike(
                    'username',
                    callerGithubUsername
                )
                .maybeSingle()

            if (
                usernameMatchedUserError
            ) {
                throw usernameMatchedUserError
            }

            callerRecord =
                usernameMatchedUser
        }

        const callerIsAdmin =
            String(
                callerRecord?.role ?? ''
            ).toLowerCase() === 'admin'

        const isSelfRequest =
            !!callerGithubUsername &&
            callerGithubUsername.toLowerCase() ===
                github_username.toLowerCase()

        /*
         * --------------------------------------------------------------------
         * 6. AUTHORIZE THE WHITELIST OPERATION
         * --------------------------------------------------------------------
         *
         * ADMIN:
         *   Can whitelist another GitHub user.
         *
         * NORMAL AUTHENTICATED MEMBER:
         *   Can only trigger lookup for their own GitHub account.
         *
         * UNAUTHENTICATED:
         *   Already rejected above.
         */

        if (
            !callerIsAdmin &&
            !isSelfRequest
        ) {
            run.warn(
                'authorization.target_mismatch',
                {
                    caller_auth_user_id:
                        authUser.id,
                    caller_github_username:
                        callerGithubUsername,
                    requested_github_username:
                        github_username
                }
            )

            return new Response(
                JSON.stringify({
                    error:
                        'You are only allowed to verify your own GitHub account'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    status: 403
                }
            )
        }

        run.info(
            'lookup.authorized',
            {
                caller_auth_user_id:
                    authUser.id,
                caller_github_username:
                    callerGithubUsername,
                requested_github_username:
                    github_username,
                caller_is_admin:
                    callerIsAdmin,
                self_request:
                    isSelfRequest
            }
        )

        /*
         * --------------------------------------------------------------------
         * 7. VERIFY GITHUB ORGANIZATION MEMBERSHIP
         * --------------------------------------------------------------------
         */

        const GH_PAT =
            Deno.env.get('github_pat')

        if (!GH_PAT) {
            throw new Error(
                "Missing 'github_pat' environment variable"
            )
        }

        const ghRes = await fetch(
            `https://api.github.com/orgs/init-club/memberships/${encodeURIComponent(github_username)}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${GH_PAT}`,
                    Accept:
                        'application/vnd.github+json'
                }
            }
        )

        if (!ghRes.ok) {
            run.count(
                'membership_rejected'
            )

            run.warn(
                'membership.not_found',
                {
                    github_username,
                    status: ghRes.status,
                    rate_limit_remaining:
                        ghRes.headers.get(
                            'x-ratelimit-remaining'
                        )
                }
            )

            const summary =
                run.finish(
                    'ok',
                    {
                        result:
                            'not_in_org'
                    }
                )

            return new Response(
                JSON.stringify({
                    error:
                        'User not in organization',
                    ...summary
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type':
                            'application/json'
                    },
                    status: 403
                }
            )
        }

        const membershipData =
            await ghRes.json()

        /*
         * Only ACTIVE membership is accepted.
         */

        if (
            membershipData?.state !==
            'active'
        ) {
            run.count(
                'membership_rejected'
            )

            run.warn(
                'membership.not_active',
                {
                    github_username,
                    state:
                        membershipData?.state
                }
            )

            return new Response(
                JSON.stringify({
                    error:
                        'GitHub organization membership is not active'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type':
                            'application/json'
                    },
                    status: 403
                }
            )
        }

        /*
         * --------------------------------------------------------------------
         * 8. VERIFY THE GITHUB RESPONSE IDENTITY
         * --------------------------------------------------------------------
         */

        const userDetails =
            membershipData?.user

        if (
            !userDetails ||
            !isValidGitHubUsername(
                userDetails.login
            )
        ) {
            throw new Error(
                'GitHub returned an invalid user identity'
            )
        }

        const canonicalGithubUsername =
            userDetails.login

        if (
            !callerIsAdmin &&
            callerGithubUsername?.toLowerCase() !==
                canonicalGithubUsername.toLowerCase()
        ) {
            return new Response(
                JSON.stringify({
                    error:
                        'GitHub identity verification failed'
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type':
                            'application/json'
                    },
                    status: 403
                }
            )
        }

        /*
         * --------------------------------------------------------------------
         * 9. UPSERT THE VERIFIED MEMBER
         * --------------------------------------------------------------------
         */

        const {
            data: existingUser,
            error: existingUserError
        } = await supabase
            .from('users')
            .select(
                'role, auth_user_id'
            )
            .eq(
                'github_id',
                userDetails.id
            )
            .maybeSingle()

        if (existingUserError) {
            throw existingUserError
        }

        /*
         * For a self-request, link the Supabase auth account immediately.
         *
         * For an admin manually whitelisting someone else, leave the existing
         * auth_user_id unchanged.
         */

        const authUserId =
            existingUser?.auth_user_id ||
            (
                isSelfRequest
                    ? authUser.id
                    : null
            )

        const {
            error: upsertError
        } = await supabase
            .from('users')
            .upsert(
                {
                    github_id:
                        userDetails.id,

                    username:
                        canonicalGithubUsername,

                    name:
                        userDetails.name ||
                        canonicalGithubUsername,

                    avatar_url:
                        userDetails.avatar_url,

                    /*
                     * NEVER accept a role from the request body.
                     *
                     * Existing roles are preserved.
                     * New users always start as members.
                     */
                    role:
                        existingUser?.role ||
                        'member',

                    auth_user_id:
                        authUserId,

                    is_active:
                        true,

                    last_seen_at:
                        new Date().toISOString()
                },
                {
                    onConflict:
                        'github_id'
                }
            )

        if (upsertError) {
            run.count(
                'upsert_errors'
            )

            throw upsertError
        }

        run.count(
            existingUser
                ? 'users_updated'
                : 'users_created'
        )

        const summary =
            run.finish(
                'ok',
                {
                    github_username:
                        canonicalGithubUsername,

                    preserved_role:
                        existingUser?.role ??
                        'member',

                    caller_is_admin:
                        callerIsAdmin,

                    self_request:
                        isSelfRequest
                }
            )

        return new Response(
            JSON.stringify({
                message:
                    `User ${canonicalGithubUsername} successfully verified.`,
                ...summary
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type':
                        'application/json'
                },
                status: 200
            }
        )

    } catch (error) {
        run.error(
            'lookup.failed',
            describeError(error)
        )

        const summary =
            run.finish('error')

        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                ...summary
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type':
                        'application/json'
                },
                status: 500
            }
        )
    }
})