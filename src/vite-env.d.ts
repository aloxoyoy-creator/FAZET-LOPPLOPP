/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FATHUR_SUPABASE_URL?: string;
  readonly VITE_FATHUR_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_FATHUR_SUPABASE_JWKS_URL?: string;
  readonly VITE_MAZET_SUPABASE_URL?: string;
  readonly VITE_MAZET_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_MAZET_SUPABASE_JWKS_URL?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_GOOGLE_CALENDAR_API_KEY?: string;
  readonly VITE_GOOGLE_HOLIDAY_CALENDAR_ID?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_DATABASE_URL?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
