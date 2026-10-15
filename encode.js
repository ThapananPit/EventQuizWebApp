const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'js/data.json');
const dst = path.join(__dirname, 'js/data.b64');

const json = fs.readFileSync(src, 'utf8');
fs.writeFileSync(dst, Buffer.from(json).toString('base64'), 'utf8');
console.log('encoded: data.json → js/data.b64');
