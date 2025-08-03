const fs = require('fs');
const { FIXSENSE_DIR, DB_PATH } = require('../config/config');

const ensureDb = () => {
  if (!fs.existsSync(FIXSENSE_DIR)) {
    fs.mkdirSync(FIXSENSE_DIR);
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
};

const readDb = () => {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = { readDb, writeDb, ensureDb };