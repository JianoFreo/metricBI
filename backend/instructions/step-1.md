# Step 1: Initialize Root Project

## Overview
This step involves initializing the root-level `package.json` for the `metricBI` project.

## Prerequisites
- Ensure you are in the `metricBI/` root directory
- Node.js and npm are installed
- The `backend/`, `admin/`, and `application/` folders already exist

## Steps

### 1. Initialize root package.json
From the root directory (`metricBI`), run:
```bash
npm init -y
```

This creates a root `package.json` that will manage shared scripts and dependencies across the project.

### 2. Example root package.json structure
After running `npm init -y`, your root `package.json` should look like:
```json
{
  "name": "metricbi",
  "version": "1.0.0",
  "description": "metricBI - A complete analytics platform with backend, admin panel, and mobile application",
  "main": "index.js",
  "scripts": {
    "dev": "npm run dev --prefix backend",
    "start": "npm start --prefix backend",
    "admin": "npm run dev --prefix admin",
    "app": "npm start --prefix application"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### 4. Common Root-Level Dependencies (Optional)

You can add shared tools at the root level:

```bash
# For monorepo management
npm install -D lerna

# For code formatting and linting
npm install -D prettier eslint

# For git hooks
npm install -D husky lint-staged
```

## Dependency Overview

### Backend Dependencies (installed in backend/)
- **express**: Web server framework
- **dotenv**: Environment variables
- **mongoose/mongodb**: Database connection (MongoDB)
- **nodemon**: Development auto-reload (dev dependency)

### Admin Dependencies (installed in admin/)
- **react**: UI library
- **react-dom**: React DOM rendering
- **vite**: Build tool and dev server
- **tailwindcss**: CSS utility framework (optional)

### Mobile Dependencies (installed in mobile/)
- **expo**: Mobile app framework
- **react-native**: Mobile UI library
- **expo-go**: Development client

## Dependency Installation Timeline

| Step | What to Install | Directory | Command |
|------|---|---|---|
| Step 1 (current) | Root package.json | Root | `npm init -y` |
| Step 2 | Express, dotenv, mongoose | `backend/` | `npm install express dotenv mongoose` |
| Step 3 | React, Vite | `admin/` | `npm create vite@latest .` |
| Step 4 | Expo, React Native | `mobile/` | `npx create-expo-app@latest .` |

## What's Next?
After completing Step 1, proceed to [Step 2: Set up the Backend](step-2.md) to install backend dependencies.
