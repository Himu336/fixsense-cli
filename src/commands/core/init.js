const { Command } = require('commander');
const { ensureDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');

const init = new Command('init')
  .description('Initialize the FixSense environment')
  .action(() => {
    try {
      ensureDb();
      logger.success('FixSense environment initialized!');
    } catch (error) {
      logger.error('Failed to initialize:', error.message);
    }
  });

module.exports = init;