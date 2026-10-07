import re

with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add taskOpen state if not exists
if "const [taskOpen, setTaskOpen]" not in content:
    content = re.sub(
        r"(const \[mobileOpen, setMobileOpen\] = useState\(false\);)", 
        r"\1\n  const [taskOpen, setTaskOpen] = useState(false);", 
        content
    )

insertion = """
      <FloatingActionMenu onAddTask={() => setTaskOpen(true)} />
      <TaskForm open={taskOpen} initial={null} onClose={() => setTaskOpen(false)} onSaved={() => setTaskOpen(false)} />
    </div>
  );
}
"""

if "<FloatingActionMenu" not in content:
    # We replace the last "    </div>\n  );\n}"
    content = re.sub(r"    </div>\n\s*\);\n\}", insertion, content)

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
