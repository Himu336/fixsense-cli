const { Command } = require('commander');
const vm = require('vm');
const { readDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const chalk = require('chalk');
const { execSync } = require('child_process'); // Import execSync to run shell commands

/**
 * Recursively builds nested commands from the database object.
 * @param {import('commander').Command} parentCommand The commander object to attach new commands to.
 * @param {object} commandObject The current level of the database object being processed.
 */
function buildCommands(parentCommand, commandObject) {
  for (const [key, value] of Object.entries(commandObject)) {
    if (key === '_action') continue;

    const subCommand = parentCommand.command(key);

    if (value && value._action) {
      subCommand
        .description(value._action.description)
        .action(() => {
          const action = value._action;

          // --- THIS IS THE NEW LOGIC ---
          // Check the type of the fix and execute accordingly.
          if (action.type === 'shell') {
            logger.info(`Executing shell command sequence for '${chalk.cyan(key)}'...`);
            try {
              for (const step of action.steps) {
                logger.log(`> ${chalk.yellow(step)}`);
                // Execute the shell command and show its output directly.
                execSync(step, { stdio: 'inherit' });
              }
              logger.success('Sequence finished successfully.');
            } catch (e) {
              // The error from the failed command will be displayed automatically.
              logger.error('Shell sequence failed at the step above.');
            }
          } else { // Default to 'js' for older commands
            try {
              const sandbox = { console };
              vm.createContext(sandbox);
              vm.runInContext(action.code, sandbox);
            } catch (e) {
              logger.error(`Error running JavaScript fix: ${e.message}`);
            }
          }
        });
    }

    if (typeof value === 'object' && value !== null) {
      buildCommands(subCommand, value);
    }
  }
}

function loadUserCommands(program) {
  try {
    const db = readDb();
    buildCommands(program, db);
  } catch (error) {
    // Silently fail if the database doesn't exist or is empty.
  }
}

module.exports = loadUserCommands;