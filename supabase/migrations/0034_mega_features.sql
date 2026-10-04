-- 1. Tabel untuk Status (Update 24 Jam)
CREATE TABLE IF NOT EXISTS public.chat_statuses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id text NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body text,
    media_path text,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View workspace statuses" ON public.chat_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own status" ON public.chat_statuses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 2. Starred Messages (Pesan Berbintang)
CREATE TABLE IF NOT EXISTS public.starred_messages (
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, message_id)
);
ALTER TABLE public.starred_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own stars" ON public.starred_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Pesan yang di-Pin
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- 4. Channels (Saluran Komunitas Broadcast)
CREATE TABLE IF NOT EXISTS public.channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id text NOT NULL,
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua bisa lihat channel" ON public.channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hanya admin bisa buat channel" ON public.channels FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

