import re

# Remove from Dashboard.tsx
with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

dashboard_content = re.sub(r"import FloatingActionMenu from '../components/ui/FloatingActionMenu';\n", "", dashboard_content)
dashboard_content = re.sub(r"<FloatingActionMenu onAddTask=\{\(\) => setTaskOpen\(true\)\} />\n      ", "", dashboard_content)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard_content)

# Add to AppShell.tsx
with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    appshell_content = f.read()

if "import FloatingActionMenu" not in appshell_content:
    appshell_content = appshell_content.replace("import Sidebar", "import FloatingActionMenu from '../ui/FloatingActionMenu';\nimport TaskForm from '../dashboard/TaskForm';\nimport Sidebar")

# Add state if not exists
if "const [taskOpen, setTaskOpen] = useState(false);" not in appshell_content:
    appshell_content = re.sub(r"(const \[mobileOpen, setMobileOpen\] = useState\(false\);)", r"\1\n  const [taskOpen, setTaskOpen] = useState(false);", appshell_content)

# Inject FloatingActionMenu and TaskForm at the end of AppShell
# Look for:
#       <SearchPalette open={searchOpen} setOpen={setSearchOpen} />
#     </div>
#   );
if "<FloatingActionMenu" not in appshell_content:
    insertion = """
      <FloatingActionMenu onAddTask={() => setTaskOpen(true)} />
      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
      <SearchPalette open={searchOpen} setOpen={setSearchOpen} />"""
    appshell_content = appshell_content.replace("<SearchPalette open={searchOpen} setOpen={setSearchOpen} />", insertion)

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(appshell_content)
