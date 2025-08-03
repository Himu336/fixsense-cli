const { Command } = require('commander');
const { readDb, writeDb } = require('../../services/fileManager');
const logger = require('../../utils/logger');
const inquirer = require('inquirer');

const deleteCmd = new Command('delete')
  .description('Delete a saved command using its full name (e.g., db:migrate)')
  .argument('<commandName>', 'The full name of the command to delete')
  .action(async (commandName) => { // Make the action async
    try {
      const db = readDb();
      const parts = commandName.split(':');
      let currentLevel = db;
      let parent = null;
      let lastPart = null;

      // Traverse to the object that contains the action to be deleted.
      for (const part of parts) {
        if (!currentLevel || !currentLevel[part]) {
          logger.error(`Command '${commandName}' not found.`);
          return;
        }
        parent = currentLevel;
        currentLevel = currentLevel[part];
        lastPart = part;
      }

      // Check if the command to delete actually exists and is runnable.
      if (currentLevel && currentLevel._action) {
        // --- NEW: Ask for confirmation ---
        const { confirmed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Are you sure you want to permanently delete the command '${commandName}'?`,
            default: false, // Safer to default to 'no'
          },
        ]);

        if (confirmed) {
          delete currentLevel._action;

          // Clean up: if the object is now empty, remove it from its parent.
          if (Object.keys(currentLevel).length === 0) {
            delete parent[lastPart];
          }

          writeDb(db);
          logger.success(`Successfully deleted command: ${commandName}`);
        } else {
          logger.info('Deletion cancelled.');
        }
      } else {
        logger.error(`Command '${commandName}' is a category, not a runnable action, or does not exist.`);
      }
    } catch (error) {
      logger.error(`Failed to delete command: ${error.message}`);
    }
  });

module.exports = deleteCmd;