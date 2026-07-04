/**
 * Supabase client utility for Express
 * ---------------------------------------------------------------
 * Mirrors the @supabase/server `withSupabase` API but adapted for
 * Express/Node.js (CommonJS), since @supabase/server only targets
 * the Fetch API / Supabase Edge Functions runtime.
 *
 * Usage:
 *   const { withSupabase } = require('../config/supabase');
 *
 *   router.get('/example', withSupabase({ auth: 'user' }), async (req, res) => {
 *     const { data } = await req.supabase.from('posts').select();
 *     res.json(data);
 *   });
 *
 * Auth modes:
 *   "user"        — requires a valid Supabase JWT in Authorization header.
 *                   Attaches an RLS-scoped client as req.supabase.
 *   "publishable" — uses SUPABASE_PUBLISHABLE_KEY (anon). No auth check.
 *   "secret"      — uses SUPABASE_SECRET_KEY (service role). Bypasses RLS.
 *   "none"        — unauthenticated client with no key.
 *
 * Both req.supabase (user-scoped / anon) and req.supabaseAdmin (service role)
 * are always attached for convenience, matching the ctx object from @supabase/server.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const AppError = require('../utils/AppError');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SECRET_KEY) {
    console.warn(
        '[supabase] Warning: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, or SUPABASE_SECRET_KEY is missing from .env'
    );
}

/**
 * Admin client — bypasses Row Level Security (service role key).
 * Equivalent to ctx.supabaseAdmin in @supabase/server.
 */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * withSupabase({ auth }) — Express middleware factory
 *
 * @param {{ auth: 'user' | 'publishable' | 'secret' | 'none' }} options
 * @returns {import('express').RequestHandler}
 */
function withSupabase({ auth = 'publishable' } = {}) {
    return async function supabaseMiddleware(req, res, next) {
        // Always attach the admin client for convenience
        req.supabaseAdmin = supabaseAdmin;

        if (auth === 'secret') {
            // Service-role client — full access, bypasses RLS
            req.supabase = supabaseAdmin;
            return next();
        }

        if (auth === 'none') {
            // Unauthenticated client
            req.supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
            return next();
        }

        if (auth === 'publishable') {
            // Anon client — respects RLS, no user context
            req.supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
            return next();
        }

        if (auth === 'user') {
            // Extract the Bearer JWT from the Authorization header
            const authHeader = req.headers.authorization || '';
            if (!authHeader.startsWith('Bearer ')) {
                return next(new AppError('You are not logged in! Please provide a Bearer token.', 401));
            }

            const token = authHeader.split(' ')[1];

            // Verify the token via Supabase and get the user (validates against JWKS internally)
            const anonClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            });

            const { data: { user }, error } = await anonClient.auth.getUser(token);

            if (error || !user) {
                return next(new AppError('Invalid or expired token. Please log in again.', 401));
            }

            // Create an RLS-scoped client by forwarding the user's JWT
            req.supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                global: {
                    headers: { Authorization: `Bearer ${token}` }
                },
                auth: { autoRefreshToken: false, persistSession: false }
            });

            // Attach the verified user for downstream handlers
            req.supabaseUser = user;

            return next();
        }

        return next(new AppError(`Unknown withSupabase auth mode: "${auth}"`, 500));
    };
}

module.exports = { withSupabase, supabaseAdmin };
