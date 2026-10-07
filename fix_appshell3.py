import re

with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix MenuItem
menu_item_def = """type MenuItem = {
  label: string;
  to: string;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  external?: boolean;
};

const mainMenu: MenuItem[] = GROUPS.flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));
"""

content = content.replace("const adminMenu: MenuItem[] = [", menu_item_def + "\nconst adminMenu: MenuItem[] = [")

# Remove the inside AppShell mainMenu definition
content = content.replace("const mainMenu = GROUPS.flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));\n", "")

# Remove `import { GROUPS, type NavItem as MenuItem } from './Sidebar';` and replace with `import { GROUPS } from './Sidebar';`
content = content.replace("import Sidebar, { GROUPS, type NavItem as MenuItem } from", "import Sidebar, { GROUPS } from")

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
