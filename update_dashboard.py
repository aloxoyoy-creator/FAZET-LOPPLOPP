import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Import the component
if "FloatingActionMenu" not in content:
    content = content.replace("import { useAppConfig }", "import FloatingActionMenu from '../components/ui/FloatingActionMenu';\nimport { useAppConfig }")

# Insert before TaskForm
if "<FloatingActionMenu" not in content:
    content = content.replace("<TaskForm open={taskOpen}", "<FloatingActionMenu onAddTask={() => setTaskOpen(true)} />\n      <TaskForm open={taskOpen}")

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
