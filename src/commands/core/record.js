const { Command } = require('commander');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const logger = require('../../utils/logger');
const { readDb, writeDb } = require('../../services/fileManager');
const { FIXSENSE_DIR } = require('../../config/config');
const { buildPath } = require('../../utils/interactivePathBuilder');

const recordCmd = new Command('record')
  .description('Start a monitored session to record the steps to a fix')
  .argument('<session-name>', 'A name for the fix you are trying to solve')
  .action((sessionName) => {
    logger.info(`Starting recording session: '${sessionName}'`);
    logger.warn("You are in a monitored shell. Type 'exit' to finish.");

    const sessionsDir = path.join(FIXSENSE_DIR, 'sessions');
    if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
    
    const historyFilePath = path.join(sessionsDir, `${sessionName}.history`);
    
    const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');
    let spawnArgs = [];

    if (shell.endsWith('powershell.exe')) {
      const escapedHistoryPath = `'${historyFilePath.replace(/\\/g, '\\\\')}'`;
      const psCommand = `
        $global:firstPrompt = $true;
        function prompt {
          if (-not $global:firstPrompt) {
            if (Get-History -Count 1) { Get-History -Count 1 | Select-Object -ExpandProperty CommandLine | Add-Content -Path ${escapedHistoryPath}; }
          }
          $global:firstPrompt = $false;
          'PS ' + (Get-Location) + '> ';
        }`;
      spawnArgs = ['-NoExit', '-Command', psCommand];
    } else {
      const escapedHistoryPath = historyFilePath.replace(/ /g, '\\ ');
      spawnArgs = ['-i'];
      process.env.HISTFILE = escapedHistoryPath;
      process.env.PROMPT_COMMAND = `history -a;`;
    }

    const child = spawn(shell, spawnArgs, { stdio: 'inherit', env: { ...process.env } });

    // --- THIS IS THE FIX: The exit handler must be async ---
    child.on('exit', async () => {
      logger.success(`\n✅ Session '${sessionName}' finished.`);
      
      try {
        if (fs.existsSync(historyFilePath)) {
          const history = fs.readFileSync(historyFilePath, 'utf-8');
          const commands = history.split(os.EOL).filter(line => {
              const trimmed = line.trim();
              return trimmed !== '' && trimmed !== 'exit' && !trimmed.startsWith('history');
          });

          if (commands.length > 0) {
            logger.info('\n--- Recorded Commands ---');
            console.log(commands.join('\n'));

            const { save } = await inquirer.prompt([{
                type: 'confirm', name: 'save',
                message: `\nDo you want to save these commands as a fix?`,
                default: true
            }]);

            if (save) {
                const db = readDb();
                const result = await buildPath(db);

                if (!result) return; // User cancelled the path builder
                const { parts, finalLevel } = result;
                const commandName = parts.join(':');

                const { description } = await inquirer.prompt([{
                    type: 'input', name: 'description',
                    message: `Enter a short description for '${commandName}':`
                }]);
                
                finalLevel['_action'] = { description, type: 'shell', steps: commands };
                writeDb(db);
                logger.success(`Successfully saved recording as: ${commandName}`);
            }
          }
          fs.unlinkSync(historyFilePath);
        }
      } catch (e) {
        logger.error('Could not process session history.', e);
      }
    });

    child.on('error', (err) => logger.error('Failed to start shell session:', err));
  });

module.exports = recordCmd;