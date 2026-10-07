import re
with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { GROUPS, type NavItem } from './Sidebar';", "import { GROUPS, type NavItem as MenuItem } from './Sidebar';")
content = content.replace("import Sidebar, { GROUPS } from", "import Sidebar, { GROUPS, type NavItem as MenuItem } from")
content = content.replace("const visibleMainMenu = useMemo(() => mainMenu, []);", "const mainMenu = GROUPS.flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));\n  const visibleMainMenu = useMemo(() => mainMenu, []);")

nav_code = """<nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {GROUPS.map((group) => (
                <div key={group.id} className="mb-4">
                  <div
                    className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "var(--tf-ink-muted)" }}
                  >
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.to;
                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => go(item.to)}
                        className={cn(
                          "tf-nav-item flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium",
                          active && "is-active",
                        )}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {showAdmin && ("""

content = re.sub(
    r'<nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">[\s\S]*?\{showAdmin && \(',
    nav_code,
    content
)

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
