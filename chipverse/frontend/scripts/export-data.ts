// Run this once to generate JSON files:
// npx ts-node scripts/export-data.ts

import { RESEARCH_SUB_LEVELS, RTL_SUB_LEVELS } from '../src/lib/data';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(__dirname, '../public/data');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'research-sublevels.json'),
  JSON.stringify(RESEARCH_SUB_LEVELS, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'rtl-sublevels.json'),
  JSON.stringify(RTL_SUB_LEVELS, null, 2)
);

console.log('✅ research-sublevels.json written');
console.log('✅ rtl-sublevels.json written');