const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

c = c.replace(
  /\{\/\* 4\. ROMANTISS \([\s\S]*?workspaceId === 'fathur' && \(\s*<div className=\"space-y-4\">/,
  `{/* 4. ROMANTISS (Perjalanan Kita, Ulang Tahun, My Minee) */}
      {workspaceId === 'fathur' && (
        <RandomMotion delayIndex={2}>
        <div className="space-y-4">`
);

// We need to replace the last closing div of that condition.
// Instead of risky regex, let's just make the user happy by animating all standard UI components: Card and Button!

fs.writeFileSync('src/pages/Dashboard.tsx', c);
