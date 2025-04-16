# BotBonnie Interview Project

This repository contains an Express.js backend application for the BotBonnie interview process.

## Environment Setup (Linux/macOS)

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Step 1: Install Node.js and npm

**macOS (using Homebrew):**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
# Update package lists
sudo apt update

# Install Node.js and npm
sudo apt install -y nodejs npm

# Alternatively, for more recent versions:
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Clone and Setup the Project

```bash
# Clone the repository
git clone https://github.com/appier/botbonnie-interview.git
cd botbonnie-interview

# Install dependencies
cd express-backend
npm install
```

## Running Tests

```bash
npm test
```

## Finish accessment

```bash
npm run finish
```

## License

This project is part of the BotBonnie interview process and is not licensed for public use.
