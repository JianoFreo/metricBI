# Step 2: Set up the Backend

## Overview
This step installs and configures the backend application with Express, dotenv, and nodemon for development.

## Prerequisites
- Ensure you're in the `backend/` directory
- Node.js and npm are installed

## Steps

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Initialize package.json
```bash
npm init -y
```

This creates a `package.json` file for the backend project.

### 3. Install production dependencies
```bash
npm install express dotenv
```

- **express**: Web framework for the Node.js backend
- **dotenv**: Load environment variables from `.env` file

### 4. Install development dependencies
```bash
npm install --save-dev nodemon
```

- **nodemon**: Automatically restarts the server when files change (for development only)

## Verify Setup
After installation, your `backend/package.json` should include:
```json
{
  "dependencies": {
    "express": "^5.2.1",
    "dotenv": "^17.4.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

## What's Next?
Proceed to [Step 3: Set up the Admin](step-3.md) to initialize the admin panel.
