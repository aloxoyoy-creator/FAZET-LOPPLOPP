import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_FATHUR_SUPABASE_URL, process.env.VITE_FATHUR_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      attachment_path,
      attachment_name,
      attachment_type,
      users(name),
      message_reads(user_id)
    `)
    .limit(1);

  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

test();
