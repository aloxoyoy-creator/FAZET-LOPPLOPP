// FAZET AI proxy — API key provider disimpan sebagai secret server, tidak pernah dikirim ke browser.
// Secrets (supabase secrets set ...): GROQ_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY, DEEPSEEK_API_KEY
// Deploy: supabase functions deploy ai-proxy
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const RATE_LIMIT_PER_MINUTE = 12;
const MAX_PROMPT_CHARS = 8000;
const MAX_HISTORY_TURNS = 20;

type Turn = { role: 'user' | 'model'; text: string };
type Workspace = 'fathur' | 'mazet';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

function systemPromptFor(workspace: Workspace) {
  const label = workspace === 'mazet' ? 'Mazet (college workspace)' : 'Fathur (school workspace)';
  return `You are FAZET AI, the personal study and life assistant for ${label}. Be warm, concise, practical, and calm. Reply in the language used by the user (usually Indonesian). Never pretend to know schedule, relationship, or personal details that were not provided.`;
}

function openAiMessages(history: Turn[], prompt: string, workspace: Workspace) {
  return [
    { role: 'system', content: systemPromptFor(workspace) },
    ...history.map((t) => ({ role: t.role === 'model' ? 'assistant' : 'user', content: t.text })),
    { role: 'user', content: prompt },
  ];
}

async function openAiCompatible(url: string, key: string, model: string, messages: unknown[], extra: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extra },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('empty response');
  return String(text);
}

async function gemini(key: string, history: Turn[], prompt: string, workspace: Workspace) {
  const contents = [...history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })), { role: 'user', parts: [{ text: prompt }] }];
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
    body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemPromptFor(workspace) }] } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('empty response');
  return String(text);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);
  const userId = userData.user.id;

  let body: { prompt?: string; history?: Turn[]; workspace?: Workspace };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const prompt = String(body.prompt ?? '').slice(0, MAX_PROMPT_CHARS).trim();
  if (!prompt) return json({ error: 'Prompt kosong' }, 400);
  const workspace: Workspace = body.workspace === 'mazet' ? 'mazet' : 'fathur';
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => t && (t.role === 'user' || t.role === 'model') && typeof t.text === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_PROMPT_CHARS) }));

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await admin.from('ai_usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since);
  if ((count ?? 0) >= RATE_LIMIT_PER_MINUTE) return json({ error: 'Terlalu banyak permintaan, coba lagi sebentar.' }, 429);

  const messages = openAiMessages(history, prompt, workspace);
  // Key dari panel admin (tabel app_secrets) diprioritaskan; secret environment jadi cadangan.
  const { data: dbKeys } = await admin.from('app_secrets').select('name,value').eq('enabled', true);
  const stored = new Map<string, string>((dbKeys ?? []).map((r: { name: string; value: string }) => [r.name, r.value]));
  const env = (k: string) => (stored.get(k) ?? Deno.env.get(k) ?? '').trim();
  const providers: Array<[string, () => Promise<string>]> = [];
  if (env('GROQ_API_KEY')) providers.push(['groq', () => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY'), 'openai/gpt-oss-120b', messages)]);
  if (env('GEMINI_API_KEY')) providers.push(['gemini', () => gemini(env('GEMINI_API_KEY'), history, prompt, workspace)]);
  if (env('OPENROUTER_API_KEY')) providers.push(['openrouter', () => openAiCompatible('https://openrouter.ai/api/v1/chat/completions', env('OPENROUTER_API_KEY'), 'google/gemini-2.5-pro', messages, { 'X-Title': 'FAZET' })]);
  if (env('DEEPSEEK_API_KEY')) providers.push(['deepseek', () => openAiCompatible('https://api.deepseek.com/chat/completions', env('DEEPSEEK_API_KEY'), 'deepseek-flash', messages)]);
  if (!providers.length) return json({ error: 'Provider AI belum dikonfigurasi di server.' }, 503);

  let lastError = 'unknown';
  for (const [name, call] of providers) {
    try {
      const text = await call();
      await admin.from('ai_usage_logs').insert({ user_id: userId, provider: name, workspace_id: workspace, prompt_chars: prompt.length, ok: true });
      return json({ text, provider: name });
    } catch (e) {
      lastError = `${name}: ${e instanceof Error ? e.message : String(e)}`;
      await admin.from('ai_usage_logs').insert({ user_id: userId, provider: name, workspace_id: workspace, prompt_chars: prompt.length, ok: false, error: lastError.slice(0, 300) });
    }
  }
  return json({ error: 'Semua provider AI gagal.', detail: lastError }, 502);
});
