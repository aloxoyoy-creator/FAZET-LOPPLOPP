# FAZET Home Minimal V5

## Active dashboard
The home dashboard intentionally exposes only:
1. Welcome / next class
2. Perjalanan Kita × Hubungan Kita
3. Jadwal Les
4. Pelajaran Besok
5. Academic Timeline
6. AI Companion (supporting layer)

Location and attendance are retired from the active navigation and active routes. Their source files remain in the project archive to honor the requirement not to delete old files.

## Sidebar
The desktop sidebar is rebuilt without a logo and uses a full-height rail. The menu is workspace-aware, longer, and grouped into Ruang Utama / Akun / Admin.

## AI
Groq is the first AI provider, configured with `VITE_GROQ_API_KEY`. The current Groq API uses the OpenAI-compatible chat-completions endpoint. The implementation uses `openai/gpt-oss-120b` as the primary model, with Gemini, OpenRouter, and DeepSeek retained as fallbacks.

## Supabase
Fathur and Mazet remain separate Supabase clients. No School Hub database is substituted into FAZET.
