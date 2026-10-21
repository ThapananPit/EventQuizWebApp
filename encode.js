const fs = require('fs');
const path = require('path');

const langs = ['th', 'en'];

langs.forEach(lang => {
  const dir = path.join(__dirname, 'js/paths', lang);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(file => {
    const src = path.join(dir, file);
    const dst = path.join(dir, file.replace('.json', '.b64'));
    fs.writeFileSync(dst, Buffer.from(fs.readFileSync(src, 'utf8')).toString('base64'), 'utf8');
    console.log(`encoded: ${lang}/${file} → ${lang}/${file.replace('.json', '.b64')}`);
  });
});
