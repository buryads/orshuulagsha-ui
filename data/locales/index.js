import fs from 'fs';
import path from 'path';

const localesDir = `${path.dirname(__filename)}/i18n`;
const files = fs.readdirSync(localesDir);

const modules = {};
for (let i = 0; i < files.length; i++) {
  const filename = files[i];
  const file = `${localesDir}/${filename}`;
  modules[filename.replace('.js', '')] = require(file).default;
}
export default modules;
