-- FAZET 0030 — AI usage log (dipakai edge function `ai-proxy` untuk rate-limit & audit).
-- Aman dijalankan ulang. Jalankan di KEDUA project Supabase.

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  workspace_id text,
  prompt_chars integer not null default 0,
  ok boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_user_created_idx
  on public.ai_usage_logs (user_id, created_at desc);

alter table public.ai_usage_logs enable row level security;

-- Pengguna hanya boleh melihat pemakaian miliknya; penulisan hanya lewat service role (edge function).
drop policy if exists "ai_usage_select_own" on public.ai_usage_logs;
create policy "ai_usage_select_own" on public.ai_usage_logs
  for select to authenticated using (user_id = auth.uid());

-- Retensi 30 hari agar tabel tidak membengkak.
create or replace function public.cleanup_ai_usage_logs()
returns void language sql security definer set search_path = public as $$
  delete from public.ai_usage_logs where created_at < now() - interval '30 days';
$$;
revoke all on function public.cleanup_ai_usage_logs() from public, anon, authenticated;
