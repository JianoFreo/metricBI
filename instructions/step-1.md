# Step 1: Set up the folders and initialize the package.json from the root

## Overview
This step involves creating the necessary folder structure for the metricBI project and initializing the root-level `package.json`.

## Steps

### 1. Create the project structure
Ensure you have the following folder structure:
```
metricBI/
├── backend/
├── admin/
└── application/
```

### 2. Initialize root package.json
From the root directory (`metricBI`), run:
```bash
npm init -y
```

This creates a root `package.json` that can manage the monorepo structure.

### 3. Optional: Configure root package.json for monorepo
If you want to manage all dependencies from the root, you can add workspace configuration:
```json
{
  "workspaces": [
    "backend",
    "admin",
    "application"
  ]
}
```

### What's Next?
After completing Step 1, proceed to [Step 2](step-2.md) to set up dependencies for backend, admin, and mobile applications.
