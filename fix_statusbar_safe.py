with open('src/components/layout/LiveStatusBar.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'Hari libur' in line and ('?' in line or '?' in line):
        # Only replace corrupted separators, NOT the ternary operators!
        # wait, the ternary operator might be on the previous line or same line.
        # usually it's `? 'Hari libur`
        # Let's just do a string replace of the known corrupted strings:
        pass # Handle below
        
    if "'Hari libur" in line:
        line = "    ? 'Hari libur - akhir pekan'\n"
    if "`Hari libur" in line:
        line = "      ? `Hari libur - ${holiday.summary}`\n"
    if '${current.subject}' in line:
        line = "        ? `${current.subject} - ${current.startTime} - ${current.endTime}`\n"
        
    if '<span className="hidden md:inline text-slate-400">' in line and '{label}</span>' in line:
        line = '        <span className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none ml-1 sm:ml-2"> - {label}</span>\n'

    new_lines.append(line)

with open('src/components/layout/LiveStatusBar.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Safe patched")
