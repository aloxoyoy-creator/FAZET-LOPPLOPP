import re
import sys

with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r"\{\s*id:\s*'admin',\s*label:\s*'Admin',\s*adminOnly:\s*true,\s*items:\s*\[.*?\],\s*\},?", re.DOTALL)

replacement = """{
      id: 'admin-management', label: 'Admin: Manajemen', adminOnly: true, items: [
        { to: '/admin', label: 'Operations Center', icon: KeyRound, end: true },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/digital-cards', label: 'Kartu Digital', icon: IdCard },
        { to: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
        { to: '/admin/task-workspace', label: 'Task Workspace', icon: ListChecks },
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        { to: '/admin/broadcast', label: 'Broadcast Center', icon: Megaphone },
        { to: '/admin/data', label: 'Data Workspace', icon: Table2 },
      ],
    },
    {
      id: 'admin-academic', label: 'Admin: Akademik', adminOnly: true, items: [
        { to: '/admin/schedule', label: 'Schedule', icon: Clock3 },
        { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
        { to: '/admin/teachers', label: 'Teachers', icon: UserRound },
        { to: '/admin/focus-sessions', label: 'Focus Sessions', icon: Clock3 },
      ],
    },
    {
      id: 'admin-system', label: 'Admin: Sistem', adminOnly: true, items: [
        { to: '/admin/notifications', label: 'Notifications', icon: Bell },
        { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
        { to: '/admin/sessions', label: 'Sessions & Devices', icon: MonitorPlay },
        { to: '/admin/storage', label: 'Storage Manager', icon: FolderOpen },
        { to: '/admin/health', label: 'System Health', icon: Activity },
        { to: '/admin/control', label: 'Kontrol Aplikasi', icon: KeyRound },
        { to: '/admin/settings', label: 'System Settings', icon: Settings },
      ],
    },"""

new_content = pattern.sub(replacement, content)

if new_content == content:
    print('Failed to replace in Sidebar.tsx')
    sys.exit(1)

with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Successfully updated Sidebar.tsx')
