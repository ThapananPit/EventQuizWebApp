const fs = require('fs');
const path = require('path');

const langs = ['th', 'en'];

function encodeFile(lang, file) {
  const dir = path.join(__dirname, 'js/paths', lang);
  const src = path.join(dir, file);
  const dst = path.join(dir, file.replace('.json', '.b64'));
  fs.writeFileSync(dst, Buffer.from(fs.readFileSync(src, 'utf8')).toString('base64'), 'utf8');
  console.log(`[watch] encoded: ${lang}/${file} → ${lang}/${file.replace('.json', '.b64')}`);
}

langs.forEach(lang => {
  const dir = path.join(__dirname, 'js/paths', lang);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => encodeFile(lang, f));
  fs.watch(dir, (event, filename) => {
    if (filename && filename.endsWith('.json')) encodeFile(lang, filename);
  });
  console.log(`[watch] watching js/paths/${lang}/*.json`);
});
