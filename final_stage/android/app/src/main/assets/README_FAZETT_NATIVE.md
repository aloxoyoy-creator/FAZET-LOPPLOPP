# FAZETT LOPP LOPP native web assets

The previous generated web bundle was archived under `legacy_preserved/original_android_public_assets/` because it belonged to the retired single-workspace app and could contain stale client configuration.

After installing dependencies, regenerate native web assets with:

```bash
npm ci
npm run build
npx cap sync android
```

The active `capacitor.config.ts` uses `dist` as the web directory, so a fresh Capacitor sync copies the current FAZETT LOPP LOPP build into Android.
