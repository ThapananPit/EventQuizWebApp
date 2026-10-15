const fs = require('fs');
const path = require('path');

const pathsDir = path.join(__dirname, 'js/paths');

function encodeFile(file) {
  const src = path.join(pathsDir, file);
  const dst = path.join(pathsDir, file.replace('.json', '.b64'));
  fs.writeFileSync(dst, Buffer.from(fs.readFileSync(src, 'utf8')).toString('base64'), 'utf8');
  console.log(`[watch] encoded: ${file} → ${file.replace('.json', '.b64')}`);
}

const files = fs.readdirSync(pathsDir).filter(f => f.endsWith('.json'));
files.forEach(encodeFile);

fs.watch(pathsDir, (event, filename) => {
  if (filename && filename.endsWith('.json')) encodeFile(filename);
});

console.log('[watch] watching js/paths/*.json for changes...');
