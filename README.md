# FixSense CLI 🛠️

**Your intelligent command-line assistant. Never forget a fix again.**

FixSense is a powerful CLI tool designed for developers who are tired of solving the same problem twice. It helps you save, find, and reuse your most valuable code snippets and shell command sequences directly from your terminal, turning your hard-won solutions into an instant, executable knowledge base.

[![NPM Version](https://img.shields.io/npm/v/fixsense-cli.svg)](https://www.npmjs.com/package/fixsense-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## The Problem FixSense Solves

You spend hours debugging a tricky database connection issue, a complex Docker command, or a specific API call. You finally solve it, but three months later, the details are fuzzy. You find yourself searching Google all over again, wasting valuable time.

FixSense solves this by providing:
- **An Instant, Executable Memory Bank:** Store your solutions as runnable commands.
- **An Automated Session Recorder:** Automatically capture the exact shell commands you used to fix a problem.
- **An Organized Command Structure:** Build a clean, nested CLI for yourself, just like professional tools (`db:migrate:undo`).

---

## Key Features

- **Interactive Command Builder:** A guided menu to create deeply nested commands (`category:sub-category:action`).
- **Two Fix Types:** Save both runnable **JavaScript snippets** and step-by-step **Shell Command sequences**.
- **Automated Session Recording:** Start a monitored session, solve your problem, and FixSense will automatically record every command you typed.
- **Interactive Explorer:** A drill-down menu (`fixsense list`) to visually explore your command hierarchy.
- **Quick Search:** Instantly find any command with `fixsense find <keyword>`.
- **Safe Deletion:** Confirmation prompts to prevent accidentally deleting a valuable fix.

---

## Installation

```bash
npm install -g fixsense-cli
```
After installation, you must initialize the tool to set up its configuration directory.
```bash
fixsense init
```

---

## Usage & Commands

### 1. `make:cli` (or `add`)
Interactively build a new runnable **JavaScript** command.

This command guides you through creating a nested command, allowing you to select existing categories or create new ones at each step.

**Example:**
```bash
fixsense make:cli
```
? Current path: ''. Select or create where to save the action: >> Create a new entry
? Enter the name for the new entry: user
? Current path: 'user'. Select or create where to save the action: >> Create a new entry
? Enter the name for the new entry: create
? Current path: 'user:create'. Select or create where to save the action: >> Finish path here
? Enter a short description: Creates a new user in the database.
? Enter the JavaScript code for the fix: [Editor Opens]
```

### 2. `record <session-name>`
Start a monitored shell session to automatically record a sequence of **shell commands**.

**Example:**
```bash
# Start the recording
fixsense record fix-docker-cache

# You are now in a monitored shell. Run your commands.
(fixsense) $ docker system prune -a
(fixsense) $ docker builder prune
(fixsense) $ exit

# After exiting, FixSense will ask you to save the recorded commands.
? Do you want to save these commands as a fix? Yes
? Current path: ''. Select or create where to save the action: docker
...
```

### 3. `list`
Interactively explore your saved commands in a drill-down menu. This is the best way to see the structure of your custom CLI.

**Example:**
```bash
fixsense list
```
? Explore commands inside 'root':
> db (Category & Action)
  docker (Category)
  Exit
```

### 4. `find <keyword>`
Quickly search for any command by a keyword.

**Example:**
```bash
fixsense find docker
```
Found 1 matching command(s) for 'docker':
  - docker:fix-docker-cache
```

### 5. `show <commandName>`
Display the details (description, code, or steps) for a specific command without running it.

**Example:**
```bash
fixsense show docker:fix-docker-cache
```
--- Details for docker:fix-docker-cache ---
Description: Clears all docker cache.
Type: Shell Commands
Steps:
  1. docker system prune -a
  2. docker builder prune
```

### 6. `edit <commandName>`
Edit the description or code/steps of an existing command. The prompts will be pre-filled with the current data.

**Example:**
```bash
fixsense edit user:create
```

### 7. `delete <commandName>`
Permanently delete a command. It will ask for confirmation first to prevent accidents.

**Example:**
```bash
fixsense delete user:create
```
? Are you sure you want to permanently delete the command 'user:create'? (y/N)
```

---

## License

This project is licensed under the MIT License.
