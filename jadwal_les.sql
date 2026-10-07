
CREATE TABLE IF NOT EXISTS fathur_tutoring_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL,
    class_name TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    schedule_date TEXT NOT NULL,
    day_status TEXT NOT NULL,
    start_time_label TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    activity_type TEXT NOT NULL
);

DELETE FROM fathur_tutoring_schedule WHERE workspace_id = 'fathur';

INSERT INTO fathur_tutoring_schedule (workspace_id, class_name, week_number, day_name, schedule_date, day_status, start_time_label, subject_code, subject_name, activity_type) VALUES
('fathur', '12B', 1, 'Senin', '2026-10-05', 'KBM Aktif', '16.30', 'INT TKA GEO', 'Intensif TKA GEO', 'Intensif'),
('fathur', '12B', 1, 'Senin', '2026-10-05', 'KBM Aktif', '18.30', 'INT TKA BIN', 'Intensif TKA BIN', 'Intensif'),
('fathur', '12B', 1, 'Selasa', '2026-10-06', 'KBM Aktif', '16.30', 'INT TKA KIM', 'Intensif TKA KIM', 'Intensif'),
('fathur', '12B', 1, 'Selasa', '2026-10-06', 'KBM Aktif', '18.30', 'INT TKA SOS', 'Intensif TKA SOS', 'Intensif'),
('fathur', '12B', 1, 'Rabu', '2026-10-07', 'KBM Aktif', '18.30', 'INT TKA BIG', 'Intensif TKA BIG', 'Intensif'),
('fathur', '12B', 1, 'Kamis', '2026-10-08', 'KBM Aktif', '16.30', 'INT TKA FIS', 'Intensif TKA FIS', 'Intensif'),
('fathur', '12B', 1, 'Kamis', '2026-10-08', 'KBM Aktif', '18.30', 'INT TKA EKO', 'Intensif TKA EKO', 'Intensif'),
('fathur', '12B', 1, 'Jumat', '2026-10-09', 'KBM Aktif', '18.30', 'INT TKA MAT', 'Intensif TKA MAT', 'Intensif'),
('fathur', '12B', 1, 'Sabtu', '2026-10-10', 'KBM Aktif', '09.00', 'INT TKA MAT L', 'Intensif TKA MAT L', 'Intensif'),
('fathur', '12B', 1, 'Sabtu', '2026-10-10', 'KBM Aktif', '12.00', 'INT TKA BIG L', 'Intensif TKA BIG L', 'Intensif'),
('fathur', '12B', 1, 'Minggu', '2026-10-11', 'Try Out', '09.00', 'TO NAS TKA', 'TO NAS TKA', 'Try Out'),
('fathur', '12B', 2, 'Senin', '2026-10-12', 'KBM Aktif', '16.30', 'INT TKA GEO', 'Intensif TKA GEO', 'Intensif'),
('fathur', '12B', 2, 'Selasa', '2026-10-13', 'KBM Aktif', '16.30', 'INT TKA BIO', 'Intensif TKA BIO', 'Intensif'),
('fathur', '12B', 2, 'Selasa', '2026-10-13', 'KBM Aktif', '18.30', 'INT TKA BIN', 'Intensif TKA BIN', 'Intensif'),
('fathur', '12B', 2, 'Kamis', '2026-10-15', 'KBM Aktif', '16.30', 'INT TKA SOS', 'Intensif TKA SOS', 'Intensif'),
('fathur', '12B', 2, 'Kamis', '2026-10-15', 'KBM Aktif', '18.30', 'INT TKA BIG', 'Intensif TKA BIG', 'Intensif'),
('fathur', '12B', 2, 'Jumat', '2026-10-16', 'KBM Aktif', '18.30', 'INT TKA MAT', 'Intensif TKA MAT', 'Intensif'),
('fathur', '12B', 2, 'Sabtu', '2026-10-17', 'KBM Aktif', '09.00', 'INT TKA MAT L', 'Intensif TKA MAT L', 'Intensif'),
('fathur', '12B', 2, 'Sabtu', '2026-10-17', 'KBM Aktif', '12.00', 'INT TKA FIS', 'Intensif TKA FIS', 'Intensif'),
('fathur', '12B', 3, 'Senin', '2026-10-19', 'KBM Aktif', '16.30', 'INT TKA GEO', 'Intensif TKA GEO', 'Intensif'),
('fathur', '12B', 3, 'Senin', '2026-10-19', 'KBM Aktif', '18.30', 'INT TKA BIN', 'Intensif TKA BIN', 'Intensif'),
('fathur', '12B', 3, 'Selasa', '2026-10-20', 'KBM Aktif', '16.30', 'INT TKA BIG L', 'Intensif TKA BIG L', 'Intensif'),
('fathur', '12B', 3, 'Rabu', '2026-10-21', 'KBM Aktif', '16.30', 'INT TKA MAT', 'Intensif TKA MAT', 'Intensif'),
('fathur', '12B', 3, 'Kamis', '2026-10-22', 'KBM Aktif', '16.30', 'INT TKA FIS', 'Intensif TKA FIS', 'Intensif'),
('fathur', '12B', 3, 'Kamis', '2026-10-22', 'KBM Aktif', '18.30', 'INT TKA EKO', 'Intensif TKA EKO', 'Intensif'),
('fathur', '12B', 3, 'Sabtu', '2026-10-24', 'Try Out', '09.00', 'TO NAS TKA', 'TO NAS TKA', 'Try Out'),
('fathur', '12B', 4, 'Senin', '2026-10-26', 'KBM Aktif', '18.30', 'INT TKA BIO', 'Intensif TKA BIO', 'Intensif'),
('fathur', '12B', 4, 'Selasa', '2026-10-27', 'KBM Aktif', '16.30', 'INT TKA KIM', 'Intensif TKA KIM', 'Intensif'),
('fathur', '12B', 4, 'Selasa', '2026-10-27', 'KBM Aktif', '18.30', 'INT TKA SOS', 'Intensif TKA SOS', 'Intensif'),
('fathur', '12B', 4, 'Rabu', '2026-10-28', 'KBM Aktif', '16.30', 'INT TKA BIG L', 'Intensif TKA BIG L', 'Intensif'),
('fathur', '12B', 4, 'Rabu', '2026-10-28', 'KBM Aktif', '18.30', 'INT TKA MAT L', 'Intensif TKA MAT L', 'Intensif');
