/**
 * Recursively traverses the database object to find all full command paths.
 * @param {object} commandObject The current level of the database object.
 * @param {string} prefix The path built from previous levels (e.g., 'db:migrate').
 * @returns {string[]} An array of full, runnable command names.
 */
function discoverCommands(commandObject, prefix = '') {
  let commandList = [];

  // If the current object level represents a runnable command, add its path to the list.
  if (commandObject._action) {
    commandList.push(prefix);
  }

  // Recurse into sub-categories to find their actions.
  for (const [key, value] of Object.entries(commandObject)) {
    if (key === '_action') continue;

    const currentPath = prefix ? `${prefix}:${key}` : key;
    if (typeof value === 'object' && value !== null) {
      commandList = commandList.concat(discoverCommands(value, currentPath));
    }
  }
  return commandList;
}

module.exports = { discoverCommands };