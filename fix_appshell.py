import re

with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace MenuItem and mainMenu with imports from Sidebar
import_stmt = "import { GROUPS, type NavItem } from './Sidebar';\n"
if "import { GROUPS" not in content:
    content = content.replace('import Sidebar from "./Sidebar";', 'import Sidebar, { GROUPS } from "./Sidebar";')

content = re.sub(
    r'type MenuItem = \{.*?external\?: boolean;\n\};',
    '',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'const mainMenu:.*?\];',
    'const mainMenu = GROUPS.flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));',
    content,
    flags=re.DOTALL
)

nav_code = """<nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {GROUPS.map((group) => {
                // filter items by enabledModules
                const visibleItems = group.items.filter(item => {
                  const id = item.to.replace("/", "") || "home";
                  return enabledModules.includes(id);
                });
                
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.id} className="mb-4">
                    <div
                      className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: "var(--tf-ink-muted)" }}
                    >
                      {group.label}
                    </div>
                    {visibleItems.map((item) => {
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
                );
              })}

              {showAdmin && ("""

content = re.sub(
    r'<nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">[\s\S]*?\{showAdmin && \(',
    nav_code,
    content
)

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AppShell.tsx")
