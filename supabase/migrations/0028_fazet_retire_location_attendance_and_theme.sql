-- FAZET LOPP LOPP — migration 0028
-- 1) Membuang seluruh sistem lokasi & absensi dari database lama (aman dijalankan ulang).
-- 2) Memperbaiki constraint tema: kode memakai redpen/ledger/ochre/forest, constraint lama hanya blue/violet/cyan/emerald,
--    sehingga penyimpanan aksen gagal. Constraint diperluas ke seluruh palet FAZET.

-- ---------- 1. Retire lokasi & absensi ----------
drop function if exists public.check_in_attendance cascade;
drop function if exists public.check_in_with_card cascade;
drop function if exists public.finalize_attendance_session cascade;
drop function if exists public.get_all_attendance_cards cascade;
drop function if exists public.get_attendance_admin_roster cascade;
drop function if exists public.get_my_attendance_cards cascade;
drop function if exists public.get_open_attendance_sessions cascade;
drop function if exists public.register_attendance_card cascade;
drop function if exists public.revoke_attendance_card cascade;
drop function if exists public.rotate_attendance_qr cascade;
drop function if exists public.set_attendance_permission cascade;
drop function if exists public.record_location_attendance cascade;
drop function if exists public.cleanup_location_operational_history cascade;
drop function if exists public.attendance_touch_updated_at cascade;
drop function if exists public.location_upgrade_touch_updated_at cascade;

drop table if exists public.attendance_attempts cascade;
drop table if exists public.attendance_logs cascade;
drop table if exists public.attendance_cards cascade;
drop table if exists public.attendance_sessions cascade;
drop table if exists public.attendance_locations cascade;
drop table if exists public.location_events cascade;
drop table if exists public.location_history cascade;
drop table if exists public.location_journeys cascade;
drop table if exists public.location_routes cascade;
drop table if exists public.location_tracking_preferences cascade;
drop table if exists public.location_tracking_sessions cascade;
drop table if exists public.routine_patterns cascade;
drop table if exists public.user_routines cascade;
drop table if exists public.locations cascade;

-- ---------- 2. Tema ----------
alter table public.settings add column if not exists theme_radius text not null default 'soft';
alter table public.settings add column if not exists font_scale text not null default 'normal';
alter table public.settings add column if not exists ambience text not null default 'none';

alter table public.settings drop constraint if exists settings_accent_color_check;
alter table public.settings add constraint settings_accent_color_check check (accent_color in (
  'blue','violet','cyan','emerald',
  'redpen','ledger','ochre','forest',
  'fathur','mazet','lopp','sakura','ocean','sunset','midnight','matcha','lavender','mono'
));
alter table public.settings drop constraint if exists settings_theme_radius_check;
alter table public.settings add constraint settings_theme_radius_check check (theme_radius in ('sharp','soft','round'));
alter table public.settings drop constraint if exists settings_font_scale_check;
alter table public.settings add constraint settings_font_scale_check check (font_scale in ('small','normal','large'));
alter table public.settings drop constraint if exists settings_ambience_check;
alter table public.settings add constraint settings_ambience_check check (ambience in ('none','aurora','grain','stars'));
