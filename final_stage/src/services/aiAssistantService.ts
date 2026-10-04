// FAZET AI — direct client-side calls. The Groq key is intentionally supplied
// through VITE_GROQ_API_KEY for this private build. Any browser-shipped API key
// can be extracted from the resulting bundle, so rotate it if the app is shared.
const GROQ_API_KEY = String(import.meta.env.VITE_GROQ_API_KEY || '').trim();
const GEMINI_API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim() || 'AQ.Ab8RN6LNo359g21E7BcCuYlHfpSE6d49MzmNScgRzZ4XyoX96Q';
const OPENROUTER_API_KEY = String(import.meta.env.VITE_OPENROUTER_API_KEY || '').trim() || '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';
const DEEPSEEK_API_KEY = String(import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim() || 'sk-9c29abfbeec34ae59429dcefbce6a920';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const GEMINI_MODEL = 'gemini-flash-latest';
const OPENROUTER_MODEL = 'google/gemini-2.5-pro';
const DEEPSEEK_MODEL = 'deepseek-flash';

export interface AiChatTurn { role: 'user' | 'model'; text: string; }
type Workspace = 'fathur' | 'mazet';

function systemPromptFor(workspace: Workspace) {
  const workspaceLabel = workspace === 'mazet' ? 'Mazet (college workspace)' : 'Fathur (school workspace)';
  return `You are FAZET AI, the personal study and life assistant for ${workspaceLabel}. Be warm, concise, practical, and calm. Reply in the language used by the user (usually Indonesian). Never pretend to know schedule, relationship, or personal details that were not provided. When given structured schedule context, turn it into clear priorities, realistic study steps, or summaries.`;
}

function toOpenAiMessages(history: AiChatTurn[], prompt: string, workspace: Workspace) {
  return [
    { role: 'system' as const, content: systemPromptFor(workspace) },
    ...history.map((turn) => ({ role: (turn.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user', content: turn.text })),
    { role: 'user' as const, content: prompt },
  ];
}

async function callGroq(history: AiChatTurn[], prompt: string, workspace: Workspace): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('Groq API key belum tersedia');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: toOpenAiMessages(history, prompt, workspace),
      temperature: 0.45,
      max_completion_tokens: 900,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response');
  return String(text);
}

async function callGemini(history: AiChatTurn[], prompt: string, workspace: Workspace): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key belum tersedia');
  const contents = [
    ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    { role: 'user' as const, parts: [{ text: prompt }] },
  ];
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemPromptFor(workspace) }] } }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('Gemini returned an empty response');
  return String(text);
}

async function callOpenRouter(history: AiChatTurn[], prompt: string, workspace: Workspace): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key belum tersedia');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://pelajaranfathur.vercel.app',
      'X-Title': 'FAZET',
    },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages: toOpenAiMessages(history, prompt, workspace) }),
  });
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned an empty response');
  return String(text);
}

async function callDeepSeek(history: AiChatTurn[], prompt: string, workspace: Workspace): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek API key belum tersedia');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages: toOpenAiMessages(history, prompt, workspace) }),
  });
  if (!res.ok) {
    if (res.status === 402) throw new Error('DeepSeek sedang dilewati karena saldo API tidak mencukupi (402). FAZET AI akan memakai provider berikutnya.');
    if (res.status === 401) throw new Error('DeepSeek API key ditolak (401). FAZET AI akan memakai provider berikutnya.');
    throw new Error(`DeepSeek error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned an empty response');
  return String(text);
}

export async function askAiAssistant(args: { prompt: string; history?: AiChatTurn[]; workspace: Workspace }): Promise<string> {
  const history = args.history ?? [];
  const providers: Array<[string, () => Promise<string>]> = [
    ['Groq', () => callGroq(history, args.prompt, args.workspace)],
    ['Gemini', () => callGemini(history, args.prompt, args.workspace)],
    ['OpenRouter', () => callOpenRouter(history, args.prompt, args.workspace)],
    ['DeepSeek', () => callDeepSeek(history, args.prompt, args.workspace)],
  ];

  let lastError: unknown = null;
  for (const [label, call] of providers) {
    try {
      return await call();
    } catch (error) {
      lastError = error;
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`[FAZET AI] ${label} unavailable: ${detail}`);
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'AI sedang tidak bisa dihubungi.');
}
