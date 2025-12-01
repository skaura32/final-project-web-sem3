const fs = require('fs');
const path = require('path');

function loadJSON(relPath) {
  const file = path.join(__dirname, '..', 'data', relPath);
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || 'null');
  } catch (e) {
    console.error('loadJSON error', file, e.message);
    return null;
  }
}

function saveJSON(relPath, data) {
  const dir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, relPath);
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('saveJSON error', file, e.message);
    return false;
  }
}

module.exports = { loadJSON, saveJSON };
