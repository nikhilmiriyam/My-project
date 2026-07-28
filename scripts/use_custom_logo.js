const fs = require('fs');
const path = require('path');

const root = process.cwd();
const clientDir = path.join(root, 'client');
const candidates = fs.readdirSync(clientDir).filter(f => /Use AI Image/i.test(f));
if(candidates.length === 0){
  console.error('No candidate file found in client/ matching "Use AI Image"');
  process.exit(1);
}
const src = path.join(clientDir, candidates[0]);
const dest = path.join(clientDir, 'logo_custom.png');
if(fs.existsSync(dest)) fs.unlinkSync(dest);
fs.copyFileSync(src, dest);
console.log('Copied', src, '=>', dest);
