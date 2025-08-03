const { Command } = require('commander');
const { readDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * Handles the menu for a runnable action (view, execute, back).
 * @param {string} commandName The full name of the command.
 * @param {object} actionObject The action object containing description and code.
 */
async function handleAction(commandName, actionObject) {
  while (true) {
    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: `Action for '${chalk.yellow(commandName)}':`,
      choices: [
        { name: '👁️  View Details', value: 'view' },
        { name: '▶️  Execute Command', value: 'execute' },
        new inquirer.Separator(),
        { name: '↩️  Go Back', value: 'back' },
      ]
    }]);

    if (choice === 'view') {
      logger.info(`\n--- Details for ${chalk.yellow(commandName)} ---`);
      logger.log(chalk.bold('Description:'), actionObject.description);
      if (actionObject.type === 'shell') {
        logger.log(chalk.bold('Steps:'));
        actionObject.steps.forEach((step, i) => logger.log(chalk.gray(`  ${i + 1}. ${step}`)));
      } else {
        logger.log(chalk.bold('Code:\n') + chalk.gray(actionObject.code));
      }
      await inquirer.prompt([{ name: 'continue', message: 'Press Enter to continue...', type: 'input' }]);
    } 
    else if (choice === 'execute') {
      const runCommand = `fixsense ${commandName.replace(/:/g, ' ')}`;
      logger.info(`Executing: ${chalk.yellow(runCommand)}\n`);
      try {
        // Execute the command and show its output directly in the console
        execSync(runCommand, { stdio: 'inherit' });
      } catch (error) {
        logger.error('Command execution failed.');
      }
      await inquirer.prompt([{ name: 'continue', message: '\nExecution finished. Press Enter to continue...', type: 'input' }]);
    } 
    else if (choice === 'back') {
      return; // Exit this sub-menu and go back to the list
    }
  }
}

const list = new Command('list')
  .description('Interactively explore and run your saved commands')
  .action(async () => {
    try {
      const db = readDb();
      if (Object.keys(db).length === 0) {
        logger.info('No commands found. Use `fixsense make:cli` to add one.');
        return;
      }

      let currentLevel = db;
      const pathStack = [];

      while (true) {
        const currentPath = pathStack.map(p => p.name).join(':');
        const keys = Object.keys(currentLevel).filter(key => key !== '_action');
        
        const choices = keys.map(key => {
          const value = currentLevel[key];
          const isCategory = Object.keys(value).some(k => k !== '_action');
          const isRunnable = !!value._action;
          
          let displayName = key;
          if (isRunnable && isCategory) displayName += ` ${chalk.blue('(Category & Action)')}`;
          else if (isRunnable) displayName += ` ${chalk.green('(Action)')}`;
          else if (isCategory) displayName += ` ${chalk.gray('(Category)')}`;

          return { name: displayName, value: key };
        });

        if (pathStack.length > 0) {
          choices.push(new inquirer.Separator(), { name: '.. Go Back', value: '__back__' });
        }
        choices.push({ name: 'Exit', value: '__exit__' });

        const { choice } = await inquirer.prompt([{
          type: 'list',
          name: 'choice',
          message: `Explore commands inside '${currentPath || 'root'}':`,
          choices: choices,
          pageSize: 15
        }]);

        if (choice === '__exit__') break;
        
        if (choice === '__back__') {
          pathStack.pop();
          let newLevel = db;
          for (const part of pathStack) { newLevel = newLevel[part.name]; }
          currentLevel = newLevel;
          continue;
        }

        const selectedObject = currentLevel[choice];
        
        // If the selected item is runnable, go to the action sub-menu
        if (selectedObject._action) {
          const fullCommandName = currentPath ? `${currentPath}:${choice}` : choice;
          await handleAction(fullCommandName, selectedObject._action);
        } else {
          // Otherwise, just drill down into the category
          pathStack.push({ name: choice });
          currentLevel = selectedObject;
        }
      }
    } catch (error) {
      logger.error(`Failed to list commands: ${error.message}`);
    }
  });

module.exports = list;