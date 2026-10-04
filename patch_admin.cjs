const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminHub.tsx', 'utf8');
c = c.replace(/import \{ Link \} from 'react-router-dom';/, "import { Link } from 'react-router-dom';\nimport Button from '../../components/ui/Button';");
c = c.replace(/const \[br, setBr\] = useState<BrandingConfig>\(branding\);/, "const [br, setBr] = useState<BrandingConfig>(branding);\n  const [aiCfg, setAiCfg] = useState(ai);");
c = c.replace(/useEffect\(\(\) => \{ setBr\(branding\); \}, \[branding\]\);/, "useEffect(() => { setBr(branding); }, [branding]);\n  useEffect(() => { setAiCfg(ai); }, [ai]);");
c = c.replace(/showToast\('Chat lama dihapus', true\);/g, "setToast({ msg: 'Chat lama dihapus', ok: true }); setTimeout(() => setToast(null), 3000);");
fs.writeFileSync('src/pages/admin/AdminHub.tsx', c, 'utf8');
