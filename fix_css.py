import re

with open('src/styles/fazet-studio/compat.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make Mobile Nav sit above Live Status Bar
css = re.sub(r"bottom: calc\(0\.5rem \+ env\(safe-area-inset-bottom\)\) !important;", r"bottom: calc(3.5rem + env(safe-area-inset-bottom)) !important;", css)

with open('src/styles/fazet-studio/compat.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('src/index.css', 'r', encoding='utf-8') as f:
    index_css = f.read()

# Make Live Status Bar sit at the very bottom
index_css = re.sub(r"bottom: calc\(4\.25rem \+ env\(safe-area-inset-bottom\)\);", r"bottom: calc(0.25rem + env(safe-area-inset-bottom));", index_css)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(index_css)

# Move FloatingActionMenu up so it's above MobileNav
with open('src/components/ui/FloatingActionMenu.tsx', 'r', encoding='utf-8') as f:
    fab_content = f.read()

fab_content = fab_content.replace('bottom-20 right-5 lg:bottom-10 lg:right-10', 'bottom-32 right-5 lg:bottom-10 lg:right-10')
# and ensure it's not hidden
with open('src/components/ui/FloatingActionMenu.tsx', 'w', encoding='utf-8') as f:
    f.write(fab_content)

print("CSS and FAB fixed")
