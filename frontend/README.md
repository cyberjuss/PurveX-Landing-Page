## PurveX Landing Page Frontend

Next.js marketing site + customer portal (signup, pricing, checkout, docs,
license retrieval). No separate backend -- auth and the portal account
system run on Supabase directly (`src/lib/portal-auth.ts`), billing is
Stripe Payment Links plus `src/app/api/stripe-webhook/route.ts`.

### Development

```powershell
npm run dev
```

Starts Next.js on `http://localhost:3000`.

See `.env.local.example` for the environment variables this needs
(Supabase project URL/keys, Stripe keys, Resend API key).

Academy students unlock the course with the class passcode, then sign in
with a Supabase account (same project as the portal). Run
`frontend/supabase/academy.sql` so mission results and daily coach usage
are saved per account, and add `<site>/academy` to Supabase Auth's
allowed redirect URLs for Google sign-in and email confirmation.

PurveX Coach needs `ANTHROPIC_API_KEY` on the server only. Students never
see that key. Optional `ACADEMY_COACH_DAILY_LIMIT` (default 20).

When a signed-in student clicks "Download Build-Environment.ps1", the
portal serves a copy with a personal `pvx_` key filled in. At the end of
each run the script quietly uploads a read-only lab snapshot, so PurveX
Coach can see their lab. Students never handle a key. Downloading again
replaces the old key.

The same coach tools are also served as an MCP server at
`/api/academy/mcp` (Streamable HTTP, read-only, `Authorization: Bearer
pvx_...`). There is no student UI for it; it is there for instructor
testing with Claude Desktop or Claude Code. Keys need
`SUPABASE_SERVICE_ROLE_KEY` and `academy.sql` to survive restarts.
