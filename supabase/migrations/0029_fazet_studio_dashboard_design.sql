-- FAZET Studio 0029
-- Design-driven dashboard preferences from FAZET LOPP LOPP V2 (design file).
-- Login is intentionally not touched by this migration.

alter table public.settings
  add column if not exists dashboard_theme text not null default 'paper-ink',
  add column if not exists dashboard_layout text not null default 'focus',
  add column if not exists sidebar_mode text not null default 'full',
  add column if not exists handedness text not null default 'right',
  add column if not exists mobile_nav_mode text not null default 'drawer',
  add column if not exists card_order jsonb not null default '["clock","agenda","tasks","streak","schedule","chat","minee","ai","stats","shortcuts"]'::jsonb,
  add column if not exists hidden_cards jsonb not null default '[]'::jsonb;

alter table public.settings drop constraint if exists settings_dashboard_theme_check;
alter table public.settings add constraint settings_dashboard_theme_check check (
  dashboard_theme in ('paper-ink','midnight-study','sakura-diary','lopp-duo','matcha-focus','mono-minimal')
);

alter table public.settings drop constraint if exists settings_dashboard_layout_check;
alter table public.settings add constraint settings_dashboard_layout_check check (
  dashboard_layout in ('focus','bento','timeline','duo')
);

alter table public.settings drop constraint if exists settings_sidebar_mode_check;
alter table public.settings add constraint settings_sidebar_mode_check check (
  sidebar_mode in ('full','collapsed','hidden')
);

alter table public.settings drop constraint if exists settings_handedness_check;
alter table public.settings add constraint settings_handedness_check check (
  handedness in ('left','right')
);

alter table public.settings drop constraint if exists settings_mobile_nav_mode_check;
alter table public.settings add constraint settings_mobile_nav_mode_check check (
  mobile_nav_mode in ('drawer','bottom')
);
