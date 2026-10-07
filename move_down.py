import re

# 1. Update FloatingActionMenu.tsx
with open('src/components/ui/FloatingActionMenu.tsx', 'r', encoding='utf-8') as f:
    fab_content = f.read()
fab_content = fab_content.replace('bottom-24 right-6', 'bottom-20 right-5')
with open('src/components/ui/FloatingActionMenu.tsx', 'w', encoding='utf-8') as f:
    f.write(fab_content)

# 2. Update compat.css for MobileNav
with open('src/styles/fazet-studio/compat.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Change from 1.5rem to 0.5rem for MobileNav
css_content = css_content.replace('bottom: calc(1.5rem + env(safe-area-inset-bottom))', 'bottom: calc(0.5rem + env(safe-area-inset-bottom))')
css_content = css_content.replace('left: 1.5rem !important;', 'left: 0.5rem !important;')
css_content = css_content.replace('right: 1.5rem !important;', 'right: 0.5rem !important;')
css_content = css_content.replace('width: calc(100% - 3rem) !important;', 'width: calc(100% - 1rem) !important;')

with open('src/styles/fazet-studio/compat.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

# 3. Update index.css for LiveStatusBar
with open('src/index.css', 'r', encoding='utf-8') as f:
    index_css = f.read()

# We look for where `.app-shell .live-statusbar` is defined
# and change `bottom: calc(var(--tf-mobile-nav-h) + env(safe-area-inset-bottom));`
# to `bottom: calc(4.5rem + env(safe-area-inset-bottom));`
index_css = index_css.replace('bottom: calc(var(--tf-mobile-nav-h) + env(safe-area-inset-bottom));', 'bottom: calc(4.25rem + env(safe-area-inset-bottom));')

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(index_css)

