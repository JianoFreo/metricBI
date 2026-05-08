# Step 3: Set up the Admin

## Overview
This step initializes the admin panel using Vite and React.

## Prerequisites
- Ensure you're in the root `metricBI/` directory
- Node.js and npm are installed

## Steps

### 1. Navigate to admin folder
```bash
cd admin
```

### 2. Create Vite project
```bash
npm create vite@latest .
```

### 3. Select configuration
When prompted, choose:
- **Framework**: React
- **Variant**: JavaScript
- **Install with npm and start now?**: Yes (or choose No and run `npm install` manually)

## What will be installed
The Vite setup will create:
- `package.json` with React and Vite dependencies
- `vite.config.js` for Vite configuration
- React project structure with src/ and public/ folders
- ESLint configuration for code quality

## Verify Setup
After installation, you should have:
```
admin/
├── package.json
├── vite.config.js
├── index.html
├── public/
└── src/
    ├── App.jsx
    ├── main.jsx
    └── style.css
```

## Available Scripts
Once setup is complete:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## What's Next?
Proceed to [Step 4: Set up the Mobile Application](step-4.md) to initialize the Expo mobile app.
