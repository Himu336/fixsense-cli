const { Command } = require('commander');
const { version } = require('../package.json');
const { printCustomHelp } = require('./commands/core/help');

// --- Import all other commands ---
const initCommand = require('./commands/core/init');
const makeCliCommand = require('./commands/core/makeCli');
const listCommand = require('./commands/core/list');
const deleteCommand = require('./commands/core/delete');
const findCommand = require('./commands/core/find');
const showCommand = require('./commands/core/show');
const recordCommand = require('./commands/core/record');
const editCommand = require('./commands/core/edit');

const loadUserCommands = require('./commands/user/dynamicLoader');

const program = new Command();

program
  .name('fixsense')
  .version(version)
  .description('A powerful assistant to save, find, and run your code snippets and command recipes.');

// --- THIS IS THE SECTION TO CHECK ---
// It defines the 'help' variable and overrides the default behavior.
program.helpOption(false); // Disable the default --help flag
program.on('--help', () => {
  printCustomHelp();
  process.exit(0);
});

// We create a custom 'help' command that also uses our function
const help = new Command('help')
  .description('Display help for command')
  .action(printCustomHelp);
// ------------------------------------

// Register all commands
program.addCommand(initCommand);
program.addCommand(makeCliCommand);
program.addCommand(listCommand);
program.addCommand(deleteCommand);
program.addCommand(findCommand);
program.addCommand(showCommand);
program.addCommand(recordCommand);
program.addCommand(editCommand);
program.addCommand(help); // Now the 'help' variable exists

loadUserCommands(program);

program.parse(process.argv);