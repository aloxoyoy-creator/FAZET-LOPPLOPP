-- Fix infinite recursion in chat RLS policies
-- By using a SECURITY DEFINER function, we bypass RLS during the membership check,
-- breaking the recursive evaluation loop between conversations and conversation_members.

CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = p_conversation_id 
    AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid) TO authenticated;

-- 1. Fix conversations policies
DROP POLICY IF EXISTS conversations_select ON public.conversations;
CREATE POLICY conversations_select ON public.conversations
FOR SELECT TO authenticated
USING (public.is_conversation_member(id));

-- 2. Fix conversation_members policies
DROP POLICY IF EXISTS conversation_members_select ON public.conversation_members;
CREATE POLICY conversation_members_select ON public.conversation_members
FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id));

-- 3. Fix messages policies
DROP POLICY IF EXISTS messages_select ON public.messages;
CREATE POLICY messages_select ON public.messages
FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() 
  AND public.is_conversation_member(conversation_id)
);
