import re

with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "import MobileNav" not in content:
    content = content.replace("import Sidebar from \"./Sidebar\";", "import Sidebar from \"./Sidebar\";\nimport MobileNav from \"./MobileNav\";")

if "<MobileNav />" not in content:
    content = content.replace("      <FloatingActionMenu", "      <MobileNav />\n      <FloatingActionMenu")

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
