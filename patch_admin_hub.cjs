const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminHub.tsx', 'utf8');

if (!c.includes('canvas-confetti')) {
  c = c.replace(
    /import \{ Link \} from 'react-router-dom';/,
    "import { Link } from 'react-router-dom';\nimport confetti from 'canvas-confetti';"
  );
  
  c = c.replace(
    /const flash = \(ok: boolean, msg: string\) => \{ setToast\(\{ ok, msg \}\); window\.setTimeout\(\(\) => setToast\(null\), 2600\); \};/,
    "const flash = (ok: boolean, msg: string) => { setToast({ ok, msg }); if (ok) confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } }); window.setTimeout(() => setToast(null), 2600); };"
  );

  fs.writeFileSync('src/pages/admin/AdminHub.tsx', c, 'utf8');
}
