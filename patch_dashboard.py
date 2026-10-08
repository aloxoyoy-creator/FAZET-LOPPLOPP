import re

file_path = "c:/Users/ASUS/Downloads/FAZET-LOPLOP-V2-TOTAL-REDESIGN/src/pages/Dashboard.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
import_replacement = """import JadwalSholat from '../components/widgets/JadwalSholat';
import CountdownTKA from '../components/widgets/CountdownTKA';"""

new_import = """import JadwalSholat from '../components/widgets/JadwalSholat';
import CountdownTKA from '../components/widgets/CountdownTKA';
import CurrentSubjectAlert from '../components/widgets/CurrentSubjectAlert';
import YoutubeWidget from '../components/widgets/YoutubeWidget';"""

content = content.replace(import_replacement, new_import)

# Add CurrentSubjectAlert
tka_replacement = """          <div className="mb-6"><CountdownTKA /></div>"""
new_tka = """          <div className="mb-6"><CountdownTKA /></div>
          
          {/* Status Pelajaran (Jam/Menit/Detik menuju pelajaran berikutnya) */}
          <CurrentSubjectAlert />"""

content = content.replace(tka_replacement, new_tka)

# Add Youtube Widget
youtube_replacement = """      {/* 3. ROMANTISS (Perjalanan Kita, Ulang Tahun, My Minee) */}"""
new_youtube = """      {/* 3. HIBURAN & FOKUS (YOUTUBE) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--tf-text-secondary)]">Hiburan & Fokus Belajar</h3>
        <div className="grid grid-cols-1 gap-4">
          <YoutubeWidget />
        </div>
      </div>

      {/* 4. ROMANTISS (Perjalanan Kita, Ulang Tahun, My Minee) */}"""

content = content.replace(youtube_replacement, new_youtube)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Dashboard.tsx")
