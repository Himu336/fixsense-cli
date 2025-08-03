const { Command } = require('commander');
const chalk = require('chalk');
const { readDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');

// We define our core commands here so we can separate them from user commands.
const coreCommands = [
    { name: 'init', desc: 'Initialize the FixSense environment.' },
  { name: 'make:cli', desc: 'Interactively build a new fix command.' },
  { name: 'record <session-name>', desc: 'Start a session to record a command sequence.' },
  { name: 'edit <commandName>', desc: 'Edit an existing command.' },
  { name: 'list', desc: 'Interactively explore your saved commands.' },
  { name: 'find <keyword>', desc: 'Search for commands by a keyword.' },
  { name: 'show <commandName>', desc: 'Show the details for a specific command.' },
  { name: 'delete <commandName>', desc: 'Delete a specific command.' },
];

/**
 * This function builds and prints the custom help text.
 */
function printCustomHelp() {
  console.log(chalk.bold.yellow('\nFixSense CLI 🛠️'));
  console.log('A powerful assistant to save, find, and run your code snippets and command recipes.');

  console.log(chalk.bold('\nUsage:'));
  console.log('  fixsense <command> [options]');

  console.log(chalk.bold('\nCore Commands:'));
  // Simple padding to align descriptions
  const longestName = coreCommands.reduce((max, cmd) => Math.max(max, cmd.name.length), 0);
  coreCommands.forEach(cmd => {
    console.log(`  ${chalk.green(cmd.name.padEnd(longestName + 4))} ${cmd.desc}`);
  });
  
  try {
    const db = readDb();
    const userCommands = Object.keys(db);
    if (userCommands.length > 0) {
      console.log(chalk.bold('\nUser-Defined Commands:'));
      console.log(chalk.dim('Your custom command categories. Run \'fixsense list\' to explore.'));
      // We only show top-level categories for brevity.
      userCommands.forEach(cmd => {
        console.log(`  - ${chalk.cyan(cmd)}`);
      });
    }
  } catch (e) {
    // Silently ignore if db doesn't exist, e.g., before 'init'.
  }
  
  console.log(chalk.dim("\nRun 'fixsense <command> --help' for more information on a specific command."));
}

// Export the function so index.js can use it.
module.exports = { printCustomHelp };