-- Migration 0025: Chat Token System
-- Creates a rotating 5-minute token for each user to prevent unauthorized direct messaging.

-- 1. Add secret to users for generating TOTP-like tokens
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS chat_token_secret uuid DEFAULT gen_random_uuid();

-- 2. Function to compute the current 6-character alphanumeric token
CREATE OR REPLACE FUNCTION public.get_current_chat_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret uuid;
  v_window bigint;
  v_hash text;
BEGIN
  SELECT chat_token_secret INTO v_secret 
  FROM public.users 
  WHERE id = p_user_id;

  IF v_secret IS NULL THEN
    RETURN NULL;
  END IF;

  -- 5-minute windows = 300 seconds
  v_window := floor(extract(epoch from now()) / 300);
  
  -- Generate MD5 hash, which produces a hex string (0-9, a-f)
  v_hash := md5(v_secret::text || v_window::text);
  
  -- Return the first 6 characters, uppercase
  RETURN upper(substring(v_hash from 1 for 6));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_chat_token(uuid) TO authenticated;

-- 3. Function to create a secure direct chat requiring the correct token
CREATE OR REPLACE FUNCTION public.create_secure_direct_chat(
  p_workspace_id text,
  p_target_user_id uuid,
  p_token text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_correct_token text;
  v_conv_id uuid;
  v_target_name text;
BEGIN
  -- Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Get target user's current token
  v_correct_token := public.get_current_chat_token(p_target_user_id);
  
  IF v_correct_token IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  -- Check if token matches
  IF upper(p_token) <> v_correct_token THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  -- Get target user's name for conversation title
  SELECT name INTO v_target_name FROM public.users WHERE id = p_target_user_id;

  -- Create conversation using the existing safe function
  -- We pass array[p_target_user_id] because create_conversation_with_members adds auth.uid() automatically
  v_conv_id := public.create_conversation_with_members(
    p_workspace_id,
    'direct',
    v_target_name,
    ARRAY[p_target_user_id]
  );

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_secure_direct_chat(text, uuid, text) TO authenticated;
