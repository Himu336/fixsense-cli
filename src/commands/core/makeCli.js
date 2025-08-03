const { Command } = require('commander');
const inquirer = require('inquirer');
const { readDb, writeDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const { buildPath } = require('../../utils/interactivePathBuilder');

const makeCli = new Command('make:cli')
  .alias('add')
  .description('Interactively build a new JavaScript command')
  .action(async () => {
    try {
      const db = readDb();
      const result = await buildPath(db);

      if (!result) return; // User cancelled
      const { parts, finalLevel } = result;
      const commandName = parts.join(':');
      
      logger.info(`Building action for command: ${commandName}`);
      const { description, code } = await inquirer.prompt([
        { name: 'description', message: 'Enter a short description:' },
        { type: 'editor', name: 'code', message: 'Enter the JavaScript code for the fix:' },
      ]);

      finalLevel['_action'] = { description, code, type: 'js' };
      writeDb(db);

      logger.success(`Successfully created command: ${commandName}`);
      const runCommand = commandName.replace(/:/g, ' ');
      logger.info(`Run it with: fixsense ${runCommand}`);
    } catch (error) {
      logger.error(`Failed to create command: ${error.message || 'Operation cancelled.'}`);
    }
  });

module.exports = makeCli;