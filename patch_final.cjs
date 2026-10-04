const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminHub.tsx', 'utf8');

c = c.replace(
  "const { disabled, dashboard, branding, save } = useAppConfig();",
  "const { disabled, dashboard, branding, ai, save } = useAppConfig();"
);

c = c.replace(
  "const [br, setBr] = useState<BrandingConfig>({ ...DEFAULT_BRANDING, ...branding });\n  useEffect(() => { setBr({ ...DEFAULT_BRANDING, ...branding }); }, [branding]);",
  "const [br, setBr] = useState<BrandingConfig>({ ...DEFAULT_BRANDING, ...branding });\n  useEffect(() => { setBr({ ...DEFAULT_BRANDING, ...branding }); }, [branding]);\n\n  // ---------- AI ----------\n  const [aiCfg, setAiCfg] = useState(ai);\n  useEffect(() => { setAiCfg(ai); }, [ai]);"
);

c = c.replace(/showToast/g, "flash");

fs.writeFileSync('src/pages/admin/AdminHub.tsx', c, 'utf8');
