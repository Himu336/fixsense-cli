const inquirer = require('inquirer');
const logger = require('./logger');
const { isValidCommandName } = require('./validator');

const CREATE_NEW = { name: '>> Create a new entry', value: '__new__' };
const FINISH_PATH = { name: '>> Finish path here', value: '__stop__' };

async function buildPath(db) {
  const parts = [];
  let currentLevel = db;

  while (true) {
    if (parts.length >= 3) break;

    const existingKeys = Object.keys(currentLevel).filter(key => key !== '_action');
    const currentPath = parts.join(':');

    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: `Current path: '${currentPath}'. Select or create where to save the action:`,
      choices: [ ...existingKeys, new inquirer.Separator(), CREATE_NEW, FINISH_PATH ],
    }]);

    if (choice === '__stop__') {
      if (parts.length === 0) {
        logger.error('Cannot create an empty command. Operation cancelled.');
        return null; // Return null to indicate cancellation
      }
      break;
    }

    let nextPart;
    if (choice === '__new__') {
      const { newPartName } = await inquirer.prompt([{
        type: 'input',
        name: 'newPartName',
        message: 'Enter the name for the new entry:',
        validate: isValidCommandName,
      }]);
      nextPart = newPartName;
    } else {
      nextPart = choice;
    }
    
    parts.push(nextPart);
    if (!currentLevel[nextPart]) {
      currentLevel[nextPart] = {};
    }
    currentLevel = currentLevel[nextPart];
  }

  return { parts, finalLevel: currentLevel };
}

module.exports = { buildPath };