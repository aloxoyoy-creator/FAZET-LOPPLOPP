# FAZET V3 — Login Vite Asset Fix

The login runtime module is still preserved at `public/assets/fazet-login-9.js`, but source code must not import from `/public` because Vite serves public files as-is.

This patch:
- keeps the original public asset untouched;
- mirrors the same ES module into `src/vendor/fazet-login-9.js` so Vite can transform/bundle it;
- adds `src/vendor/fazet-login-9.d.ts` for strict TypeScript typing;
- changes `src/pages/Login.tsx` to use a normal source import;
- removes the `/assets/fazet-login-9.js` dynamic import that caused Vite `Failed to load url`.
