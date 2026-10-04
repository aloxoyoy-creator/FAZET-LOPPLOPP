import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const name = formData.get("name");
    const sortOrder = parseInt(formData.get("sortOrder") || "0");
    if (!file || !name) return new Response("Missing file or name", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = name.split(".").pop().toLowerCase();
    const storagePath = `gallery/${Date.now()}_${sortOrder}.${fileExt}`;
    
    let contentType = "application/octet-stream";
    if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';
    if (fileExt === 'png') contentType = 'image/png';
    if (fileExt === 'webp') contentType = 'image/webp';
    if (fileExt === 'gif') contentType = 'image/gif';

    const { error: uploadError } = await supabase.storage.from("my-minee").upload(storagePath, arrayBuffer, { contentType });
    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase.from("romantic_gallery").insert({
      title: name,
      original_name: name,
      storage_path: storagePath,
      file_type: contentType,
      file_size: arrayBuffer.byteLength,
      sort_order: sortOrder
    });
    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, name }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
