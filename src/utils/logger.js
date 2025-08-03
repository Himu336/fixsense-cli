const chalk = require('chalk');

module.exports = {
  log: (message) => console.log(message),
  success: (message) => console.log(chalk.green(`✅ ${message}`)),
  error: (message) => console.log(chalk.red(`❌ ${message}`)),
  info: (message) => console.log(chalk.blue(`ℹ️ ${message}`)),
  warn: (message) => console.log(chalk.yellow(`⚠️ ${message}`)), // 👈 Add this line
};