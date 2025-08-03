/**
 * Validates that the input is a single, non-empty word (no spaces).
 * @param {string} input - The input string to validate.
 * @returns {boolean|string} - True if valid, otherwise an error message string.
 */
const isValidCommandName = (input) => {
  if (!input) {
    return 'Input cannot be empty.';
  }
  if (/\s/.test(input)) {
    return 'Command name cannot contain spaces.';
  }
  return true;
};

module.exports = { isValidCommandName };