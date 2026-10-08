with open('src/pages/Calendar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the corrupted time separator
content = content.replace('{item.startTime} ?" {item.endTime}', '{item.startTime} - {item.endTime}')
content = content.replace('{item.startTime} ?"', '{item.startTime} -')

# Make chips visible on mobile (hidden md:flex -> flex)
content = content.replace('className="hidden md:flex flex-col gap-1.5 mt-3 overflow-y-auto max-h-[70px] hide-scrollbar \nw-full"', 
                          'className="flex flex-col gap-1 mt-1 md:gap-1.5 md:mt-3 overflow-y-auto max-h-[120px] hide-scrollbar w-full"')
content = content.replace('className="hidden md:flex flex-col gap-1.5 mt-3 overflow-y-auto max-h-[70px] hide-scrollbar w-full"', 
                          'className="flex flex-col gap-1 mt-1 md:gap-1.5 md:mt-3 overflow-y-auto max-h-[120px] hide-scrollbar w-full"')

# Remove truncate and add wrapping
content = content.replace('truncate w-full', 'whitespace-normal break-words leading-tight w-full')

with open('src/pages/Calendar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Calendar.tsx patched successfully!")
