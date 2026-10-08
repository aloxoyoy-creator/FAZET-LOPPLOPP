const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

c = c.replace(
  /\{\/\* 4\. ROMANTISS[^\n]*\n\s*\{workspaceId === 'fathur' && \(\s*/,
  `{/* 4. ROMANTISS */}
      `
);

// We must carefully replace the specific closing tag block
const lines = c.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes(')}')) {
    // Check if it's right after closing the ROMANTISS card block
    if (lines[i-1] && lines[i-1].includes('</div>') && lines[i-2] && lines[i-2].includes('</div>')) {
      // Actually let's just do it cleanly via index
      break;
    }
  }
}
// wait, simpler: find `</Card>` then `</div>` then `</div>` then `)}`
c = c.replace(/<\/Card>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/main>/, `</Card>\n          </div>\n        </div>\n      </main>`);

fs.writeFileSync('src/pages/Dashboard.tsx', c);
