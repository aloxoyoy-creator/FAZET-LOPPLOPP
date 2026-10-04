-- FAZET V4: run in BOTH Fathur and Mazet Supabase projects.
-- No service-role key belongs in browser code.

begin;

alter table public.users add column if not exists status text default 'active';
alter table public.users add column if not exists workspace_id text;
alter table public.users add column if not exists updated_at timestamptz default now();

create or replace function public.recover_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.users
     set status = 'active', updated_at = now()
   where id = auth.uid();

  if not found then
    raise exception 'FAZET profile not found for this account';
  end if;
end;
$$;

revoke all on function public.recover_my_account() from public;
grant execute on function public.recover_my_account() to authenticated;

create or replace function public.handle_new_fazet_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  preferred_workspace text := coalesce(new.raw_user_meta_data->>'preferred_workspace', 'fathur');
  display_name text := coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
begin
  if preferred_workspace not in ('fathur','mazet') then preferred_workspace := 'fathur'; end if;
  insert into public.users (id, name, email, role, status, workspace_id, created_at, updated_at)
  values (new.id, display_name, new.email, 'user', 'active', preferred_workspace, now(), now())
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(nullif(public.users.name, ''), excluded.name),
        workspace_id = coalesce(public.users.workspace_id, excluded.workspace_id),
        updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created_fazet' and tgrelid = 'auth.users'::regclass) then
    create trigger on_auth_user_created_fazet
      after insert on auth.users
      for each row execute function public.handle_new_fazet_user();
  end if;
end;
$$;

commit;
