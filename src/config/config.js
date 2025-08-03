const path = require('path');
const os = require('os');

const FIXSENSE_DIR = path.join(os.homedir(), '.fixsense');
const DB_PATH = path.join(FIXSENSE_DIR, 'fixes.json');

module.exports = { FIXSENSE_DIR, DB_PATH };