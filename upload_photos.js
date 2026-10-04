const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_FATHUR_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_FATHUR_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function uploadDir(dirName) {
  const dirPath = path.join('C:\\Users\\ASUS\\Downloads', dirName);
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  
  let i = 0;
  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp|gif|mp4)$/i)) continue;
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath);
    const ext = path.extname(file);
    const storagePath = gallery/ + Date.now() + '_' + i + ext;
    const fileType = mime.lookup(filePath) || 'application/octet-stream';
    
    console.log(Uploading ...);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('my-minee')
      .upload(storagePath, content, { contentType: fileType });
      
    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      continue;
    }
    
    const { error: dbError } = await supabase.from('romantic_gallery').insert({
      title: file,
      original_name: file,
      storage_path: storagePath,
      file_type: fileType,
      size_bytes: content.length,
      sort_order: i
    });
    
    if (dbError) {
      console.error('DB Insert failed:', dbError.message);
    } else {
      console.log(Successfully added  to gallery.);
    }
    i++;
  }
}

async function run() {
  await uploadDir('my minee');
  await uploadDir('foto pacarku');
  console.log('Done uploading all photos!');
}

run();
