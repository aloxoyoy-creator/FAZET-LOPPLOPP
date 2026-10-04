import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "DELETE") {
     const { data: dbData } = await supabase.from("romantic_gallery").select("storage_path");
     const validPaths = new Set(dbData.map(d => d.storage_path.replace('gallery/', '')));
     
     const { data: storageData } = await supabase.storage.from("my-minee").list("gallery");
     
     const pathsToDelete = storageData
        .filter(s => !validPaths.has(s.name))
        .map(s => `gallery/${s.name}`);
        
     const { data, error } = await supabase.storage.from("my-minee").remove(pathsToDelete);

     return new Response(JSON.stringify({ deletedFiles: pathsToDelete.length, pathsToDelete, error }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response("OK");
});
