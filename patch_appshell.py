import re
import sys

with open('src/components/layout/AppShell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mainMenu and adminMenu
pattern_top = re.compile(r"const mainMenu: MenuItem\[\] = GROUPS\.flatMap\(g => g\.items\)\.map\(i => \(\{ label: i\.label, to: i\.to, Icon: i\.icon, \n?external: false \}\)\);\s*const adminMenu: MenuItem\[\] = \[.*?\];", re.DOTALL)

replacement_top = """const mainMenu: MenuItem[] = GROUPS.filter(g => !g.adminOnly).flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));
const adminMenu: MenuItem[] = GROUPS.filter(g => g.adminOnly).flatMap(g => g.items).map(i => ({ label: i.label, to: i.to, Icon: i.icon, external: false }));"""

content = pattern_top.sub(replacement_top, content)

# Replace mobile sidebar nav rendering
pattern_nav = re.compile(r"\{GROUPS\.map\(\(group\) => \(\s*<div key=\{group\.id\} className=\"mb-4\">\s*<div\s*className=\"mb-2 px-3 text-\[10px\] font-semibold uppercase tracking-\[0\.16em\]\"\s*style=\{\{ color: \"var\(--tf-ink-muted\)\" \}\}\s*>\s*\{group\.label\}\s*</div>\s*\{group\.items\.map\(\(item\) => \{\s*const Icon = item\.icon;\s*const active = location\.pathname === item\.to;\s*return \(\s*<button\s*key=\{item\.to\}\s*type=\"button\"\s*onClick=\{\(\) => go\(item\.to\)\}\s*className=\{cn\(\s*\"tf-nav-item flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium\",\s*active && \"is-active\",\s*\)\}\s*>\s*<Icon size=\{18\} />\s*<span>\{item\.label\}</span>\s*</button>\s*\);\s*\}\)\}\s*</div>\s*\)\)\}\s*\{showAdmin && \(\s*<>\s*<div\s*className=\"my-3 pt-3 text-\[10px\] font-semibold uppercase tracking-\[0\.16em\]\"\s*style=\{\{\s*borderTop: \"1px solid var\(--tf-rule\)\",\s*color: \"var\(--tf-ink-muted\)\",\s*\}\}\s*>\s*Admin Center\s*</div>\s*\{adminMenu\.map\(\(item\) => \{\s*const Icon = item\.Icon;\s*const active = location\.pathname === item\.to;\s*return \(\s*<button\s*key=\{item\.to\}\s*type=\"button\"\s*onClick=\{\(\) => go\(item\.to\)\}\s*className=\{cn\(\s*\"tf-nav-item flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium\",\s*active && \"is-active\",\s*\)\}\s*>\s*<Icon size=\{18\} />\s*<span>\{item\.label\}</span>\s*</button>\s*\);\s*\}\)\}\s*</>\s*\)\}", re.DOTALL)

replacement_nav = """{GROUPS.filter(g => !g.adminOnly || showAdmin).map((group) => (
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
              ))}"""

content = pattern_nav.sub(replacement_nav, content)

with open('src/components/layout/AppShell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Successfully updated AppShell.tsx')
