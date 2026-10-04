# FAZET LOP-LOP Supabase Configuration

FAZET uses two separate Supabase projects:

- Fathur: configured by `VITE_FATHUR_SUPABASE_URL`, `VITE_FATHUR_SUPABASE_PUBLISHABLE_KEY`, and `VITE_FATHUR_SUPABASE_JWKS_URL`.
- Mazet: configured by `VITE_MAZET_SUPABASE_URL`, `VITE_MAZET_SUPABASE_PUBLISHABLE_KEY`, and `VITE_MAZET_SUPABASE_JWKS_URL`.

The browser-safe values are present in both `.env` (Vite development) and `.env.production` (production build). The publishable keys are intended for browser use. Do not add Supabase secret/service-role keys to `.env` files that are shipped to the frontend.
