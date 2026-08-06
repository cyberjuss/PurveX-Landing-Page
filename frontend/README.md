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
