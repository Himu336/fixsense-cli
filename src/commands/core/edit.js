const { Command } = require('commander');
const { readDb, writeDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const inquirer = require('inquirer');
const os = require('os');

const editCmd = new Command('edit')
  .description('Edit an existing command')
  .argument('<commandName>', 'The full name of the command to edit (e.g., db:migrate)')
  .action(async (commandName) => {
    try {
      const db = readDb();
      const parts = commandName.split(':');
      let currentLevel = db;

      // Traverse the path to find the command object.
      for (const part of parts) {
        if (!currentLevel || !currentLevel[part]) {
          logger.error(`Command '${commandName}' not found.`);
          return;
        }
        currentLevel = currentLevel[part];
      }

      // Check if the command is runnable and has details to edit.
      if (currentLevel && currentLevel._action) {
        const existingAction = currentLevel._action;
        
        logger.info(`Editing command: ${commandName}`);

        const newDetails = await inquirer.prompt([
          {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: existingAction.description, // Pre-fill with existing data
          },
          {
            type: 'editor',
            name: 'content',
            message: 'Code or Steps:',
            // Pre-fill the editor with the existing content
            default: existingAction.type === 'shell' 
              ? existingAction.steps.join(os.EOL) 
              : existingAction.code,
          },
        ]);

        // Update the action object with the new details
        existingAction.description = newDetails.description;
        if (existingAction.type === 'shell') {
          existingAction.steps = newDetails.content.split(os.EOL).filter(line => line.trim() !== '');
        } else {
          existingAction.code = newDetails.content;
        }

        writeDb(db);
        logger.success(`Successfully updated command: ${commandName}`);

      } else {
        logger.error(`'${commandName}' is a category, not a runnable command.`);
      }
    } catch (error) {
      logger.error(`Failed to edit command: ${error.message}`);
    }
  });

module.exports = editCmd;