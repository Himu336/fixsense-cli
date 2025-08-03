const { Command } = require('commander');
const { readDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const chalk = require('chalk');
const { discoverCommands } = require('../../utils/commandDiscovery');

const findCmd = new Command('find')
  .description('Find commands by a keyword')
  .argument('<keyword>', 'The keyword to search for in command names')
  .action((keyword) => {
    try {
      const db = readDb();
      const allCommands = discoverCommands(db);

      // Filter the commands to find matches (case-insensitive)
      const matches = allCommands.filter(command => 
        command.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matches.length === 0) {
        logger.info(`No commands found matching '${keyword}'.`);
        return;
      }

      logger.log(chalk.bold(`\nFound ${matches.length} matching command(s) for '${keyword}':`));
      matches.forEach(command => {
        logger.log(`  - ${chalk.yellow(command)}`);
      });

    } catch (error) {
      logger.error(`Failed to find commands: ${error.message}`);
    }
  });

module.exports = findCmd;