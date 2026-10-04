-- Remote control: konfigurasi aplikasi, feature flag, dan API key yang bisa diubah admin dari aplikasi.

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
drop policy if exists app_config_read on public.app_config;
drop policy if exists app_config_admin on public.app_config;
create policy app_config_read on public.app_config for select to authenticated using (true);
create policy app_config_admin on public.app_config for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.app_config to authenticated;
grant insert, update, delete on public.app_config to authenticated;

-- API key: nilai TIDAK bisa dibaca balik oleh browser. Hanya edge function (service role) yang membaca.
create table if not exists public.app_secrets (
  name text primary key,
  value text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.app_secrets enable row level security;
drop policy if exists app_secrets_admin on public.app_secrets;
create policy app_secrets_admin on public.app_secrets for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.app_secrets from authenticated, anon;
grant insert, update, delete on public.app_secrets to authenticated;

create or replace function public.admin_list_secrets()
returns table(name text, enabled boolean, hint text, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select s.name, s.enabled, '••••' || right(s.value, 4), s.updated_at
  from public.app_secrets s where public.is_admin() order by s.name
$$;
revoke all on function public.admin_list_secrets() from public, anon;
grant execute on function public.admin_list_secrets() to authenticated;

alter publication supabase_realtime add table public.app_config;
