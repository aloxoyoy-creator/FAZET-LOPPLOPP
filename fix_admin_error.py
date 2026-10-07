import re

# 1. Fix AppConfigContext.tsx (hide the error if table doesn't exist)
with open('src/context/AppConfigContext.tsx', 'r', encoding='utf-8') as f:
    config_content = f.read()

# Replace the throw Error line
config_content = config_content.replace('if (error) throw new Error(error.message);', 'if (error) { console.error(error); return; }')

with open('src/context/AppConfigContext.tsx', 'w', encoding='utf-8') as f:
    f.write(config_content)

# 2. Fix Sidebar.tsx admin menu
with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

# Replace the admin group items
admin_regex = re.compile(r"\{\s*id:\s*'admin',\s*label:\s*'Admin',\s*adminOnly:\s*true,\s*items:\s*\[.*?\]\s*\},", re.DOTALL)
new_admin_group = """  {
    id: 'admin', label: 'Admin', adminOnly: true, items: [
      { to: '/admin', label: 'Admin Hub', icon: KeyRound },
    ],
  },"""
sidebar_content = admin_regex.sub(new_admin_group, sidebar_content)

with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_content)
