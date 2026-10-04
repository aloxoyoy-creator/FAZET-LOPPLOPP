const fs = require('fs');
let c = fs.readFileSync('src/components/tasks/TaskCard.tsx', 'utf8');

if (!c.includes('canvas-confetti')) {
  c = c.replace(
    /import \{ useToast \} from '\.\.\/ui\/Toast';/,
    "import { useToast } from '../ui/Toast';\nimport confetti from 'canvas-confetti';"
  );
  
  c = c.replace(
    /message: 'Status tersinkron ke Supabase.',\n      \}\);/,
    "message: 'Status tersinkron ke Supabase.',\n      });\n      if (status === 'completed') {\n        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#4f46e5', '#ec4899', '#10b981', '#f59e0b'] });\n      }"
  );

  fs.writeFileSync('src/components/tasks/TaskCard.tsx', c, 'utf8');
}
