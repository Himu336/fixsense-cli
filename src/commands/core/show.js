const { Command } = require('commander');
const { readDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const chalk = require('chalk');

const showCmd = new Command('show')
  .description('Show the details of a specific command')
  .argument('<commandName>', 'The full name of the command to show (e.g., db:migrate)')
  .action((commandName) => {
    try {
      const db = readDb();
      // This logic for finding the command remains the same
      const parts = commandName.split(':');
      let currentLevel = db;
      for (const part of parts) {
        if (!currentLevel || !currentLevel[part]) {
          logger.error(`Command '${commandName}' not found.`);
          return;
        }
        currentLevel = currentLevel[part];
      }

      if (currentLevel && currentLevel._action) {
        const action = currentLevel._action;
        logger.info(`\n--- Details for ${chalk.yellow(commandName)} ---`);
        logger.log(chalk.bold('Description:'), action.description);

        // --- NEW: Handle different fix types ---
        if (action.type === 'shell') {
          logger.log(chalk.bold('Type:'), 'Shell Commands');
          logger.log(chalk.bold('Steps:'));
          action.steps.forEach((step, index) => {
            logger.log(chalk.gray(`  ${index + 1}. ${step}`));
          });
        } else { // Default to JavaScript
          logger.log(chalk.bold('Type:'), 'JavaScript');
          logger.log(chalk.bold('Code:\n') + chalk.gray(action.code));
        }
      } else {
        logger.error(`'${commandName}' is a category, not a runnable command.`);
      }
    } catch (error) {
      logger.error(`Failed to show command: ${error.message}`);
    }
  });

module.exports = showCmd;