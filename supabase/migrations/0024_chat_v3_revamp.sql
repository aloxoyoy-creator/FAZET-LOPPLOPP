-- Fathur SchoolHub V7.3 Chat V3 Revamp
-- This migration ensures the backend logic for chat is robust, fully usable, and bug-free.

-- 1. Safely recreate the conversation creation function without workspace restrictions
CREATE OR REPLACE FUNCTION public.create_conversation_with_members(
  p_workspace_id text,
  p_kind text,
  p_title text,
  p_member_ids uuid[]
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Create conversation
  INSERT INTO public.conversations(
    workspace_id,
    kind,
    title,
    is_group,
    created_by
  )
  VALUES (
    p_workspace_id,
    p_kind,
    NULLIF(TRIM(p_title), ''),
    p_kind <> 'direct',
    auth.uid()
  )
  RETURNING id INTO v_id;

  -- Insert all selected members + creator
  INSERT INTO public.conversation_members(conversation_id, user_id)
  SELECT v_id, u.id
  FROM public.users u
  WHERE u.id = ANY(array_append(COALESCE(p_member_ids, '{}'::uuid[]), auth.uid()))
    AND u.status = 'active'
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_conversation_with_members(text, text, text, uuid[]) TO authenticated;

-- 2. Ensure RLS on messages is completely robust
DROP POLICY IF EXISTS messages_select ON public.messages;
CREATE POLICY messages_select ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = messages.conversation_id 
    AND cm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = messages.conversation_id 
    AND cm.user_id = auth.uid()
  )
);

-- 3. Ensure RLS on conversations and members
DROP POLICY IF EXISTS conversations_select ON public.conversations;
CREATE POLICY conversations_select ON public.conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = conversations.id 
    AND cm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS conversation_members_select ON public.conversation_members;
CREATE POLICY conversation_members_select ON public.conversation_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = conversation_members.conversation_id 
    AND cm.user_id = auth.uid()
  )
);

-- 4. Enable Realtime explicitly for chat tables
DO $$
BEGIN
  -- Try to add to publication, ignore if already added
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN OTHERS THEN END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN OTHERS THEN END;
END $$;
