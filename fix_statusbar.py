import re

with open('src/components/layout/LiveStatusBar.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace corrupted characters like '?' or '?' or '?"'
text = re.sub(r'[?]+"', '-', text)
text = re.sub(r'\?', '•', text)
text = text.replace('?', '•')

# Fix specifically the corrupted strings in labels:
# e.g., 'Hari libur • akhir pekan'
text = text.replace("'Hari libur • akhir pekan'", "'Hari libur • akhir pekan'")
text = text.replace("`Hari libur • ${holiday.summary}`", "`Hari libur • ${holiday.summary}`")
text = text.replace("`${current.subject} • ${current.startTime}•\"${current.endTime}`", "`${current.subject} • ${current.startTime} - ${current.endTime}`")
text = text.replace("`${current.subject} • ${current.startTime}-${current.endTime}`", "`${current.subject} • ${current.startTime} - ${current.endTime}`")

# And the label span:
# <span className="hidden md:inline text-slate-400">• {label}</span>
text = re.sub(
    r'<span className="hidden md:inline text-slate-400">.*?\{label\}</span>',
    r'<span className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none ml-1 sm:ml-2"> • {label}</span>',
    text
)

# Wait, the original corrupted span was:
# <span className="hidden md:inline text-slate-400">? {label}</span>
text = re.sub(
    r'<span className="hidden md:inline text-slate-400">[^<]*?\{label\}</span>',
    r'<span className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none ml-1 sm:ml-2"> • {label}</span>',
    text
)


with open('src/components/layout/LiveStatusBar.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("LiveStatusBar.tsx fixed!")
