const fs = require('fs');
const path = require('path');

const pathsDir = path.join(__dirname, 'js/paths');
const files = fs.readdirSync(pathsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const src = path.join(pathsDir, file);
  const dst = path.join(pathsDir, file.replace('.json', '.b64'));
  fs.writeFileSync(dst, Buffer.from(fs.readFileSync(src, 'utf8')).toString('base64'), 'utf8');
  console.log(`encoded: ${file} → ${file.replace('.json', '.b64')}`);
});
