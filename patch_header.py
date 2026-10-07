# -*- coding: utf-8 -*-
import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_header = r'<div className="studio-eyebrow mb-4"><Clock3 size=\{12\}\/> Jadwal Sekolah<\/div>'
new_header = r'<div className="studio-eyebrow mb-4"><Clock3 size={12}/> {now.getHours() >= 18 ? "Jadwal Sekolah Besok" : "Jadwal Sekolah"}</div>'

text = re.sub(old_header, new_header, text)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Header patched.")
