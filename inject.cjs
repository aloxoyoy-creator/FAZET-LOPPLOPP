const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

c = c.replace(/import \{ Fragment, useEffect/g, "import ContinuousMotion from '../components/ui/ContinuousMotion';\nimport { Fragment, useEffect");
c = c.replace(/<Sparkles size=\{13\} \/>/g, '<ContinuousMotion intensity="high" className="inline-block"><Sparkles size={13} /></ContinuousMotion>');
c = c.replace(/<Layers3 size=\{16\} \/>/g, '<ContinuousMotion intensity="medium" className="inline-block"><Layers3 size={16} /></ContinuousMotion>');
c = c.replace(/<Clock3 size=\{12\}\/>/g, '<ContinuousMotion intensity="low" className="inline-block"><Clock3 size={12} /></ContinuousMotion>');
c = c.replace(/<Heart size=\{13\} \/>/g, '<ContinuousMotion intensity="high" className="inline-block"><Heart size={13} /></ContinuousMotion>');
c = c.replace(/<Images size=\{13\} \/>/g, '<ContinuousMotion intensity="low" className="inline-block"><Images size={13} /></ContinuousMotion>');

fs.writeFileSync('src/pages/Dashboard.tsx', c);
