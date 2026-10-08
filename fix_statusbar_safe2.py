with open('src/components/layout/LiveStatusBar.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Instead of blindly replacing all '?' which breaks TS ternary operators,
# I will only replace the text inside the strings.
# 'Hari libur ? akhir pekan' -> 'Hari libur - akhir pekan'
# Wait, I don't know the exact corrupted character since PowerShell might have mangled it in the previous output.
# I will use regex to find strings and replace them.

import re
text = re.sub(r"'Hari libur [^a-zA-Z0-9]+ akhir pekan'", "'Hari libur - akhir pekan'", text)
text = re.sub(r"`Hari libur [^a-zA-Z0-9\$\{]+ \$\{holiday\.summary\}`", "`Hari libur - ${holiday.summary}`", text)
text = re.sub(r"`\$\{current\.subject\} [^a-zA-Z0-9\$\{]+ \$\{current\.startTime\}[^a-zA-Z0-9\$\{]+\$\{current\.endTime\}`", "`${current.subject} - ${current.startTime} - ${current.endTime}`", text)

# Replace the hidden label
text = re.sub(
    r'<span className="hidden md:inline text-slate-400">[^a-zA-Z0-9]*?\{label\}</span>',
    r'<span className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none ml-1 sm:ml-2"> - {label}</span>',
    text
)

with open('src/components/layout/LiveStatusBar.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
