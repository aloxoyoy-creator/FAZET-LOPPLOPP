with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import TaskForm from '../dashboard/TaskForm';", "import TaskForm from '../tasks/TaskForm';")

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
