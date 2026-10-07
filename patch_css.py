with open('src/styles/fazet-studio/compat.css', 'r', encoding='utf-8') as f:
    content = f.read()

import re

new_css = """  .app-shell .mobile-nav {
    display: flex;
    background: color-mix(in srgb, var(--tf-bg-surface) 85%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--tf-border) 50%, transparent) !important;
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 32px color-mix(in srgb, var(--tf-text-primary) 15%, transparent), 0 0 0 1px color-mix(in srgb, var(--tf-text-primary) 5%, transparent) !important;
    
    /* Floating Taskbar */
    bottom: calc(1.5rem + env(safe-area-inset-bottom)) !important;
    left: 1.5rem !important;
    right: 1.5rem !important;
    width: calc(100% - 3rem) !important;
    border-radius: 9999px !important;
    padding: 0.5rem 0.5rem !important;
    z-index: 50 !important;
    
    /* Animation */
    animation: float-nav 4s ease-in-out infinite alternate !important;
  }
  
  @keyframes float-nav {
    0% { transform: translateY(0); }
    100% { transform: translateY(-4px); }
  }"""

content = re.sub(r'\.app-shell \.mobile-nav\s*\{[^}]+\}', new_css, content, count=1)

with open('src/styles/fazet-studio/compat.css', 'w', encoding='utf-8') as f:
    f.write(content)
