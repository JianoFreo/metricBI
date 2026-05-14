# MetricBI Infrastructure

## Database Layer
MongoDB Atlas

## Cache Layer
Redis Cloud

## AI Layer
Gemini

## File Storage
Cloudinary

## Notification Layer
Firebase

## Hosting
Render


# metricBI Setup Guide

Follow the steps below to set up the complete `metricBI` project.

## Project Structure

The project has the following directory structure:

```text
metricBI/
├── backend/          # Node.js + Express API, all business logic, AI, database
├── admin/            # React + Vite admin dashboard
├── application/      # Expo React Native app, UI only + API calls
├── instructions/     # Step-by-step backend setup guides
├── README.md         # Project overview
└── package.json      # Root package configuration
```

## Ownership Rules

- `backend/` is the single source of truth for business logic, authentication, AI, Redis, MongoDB, and all persistence.
- `application/` must not contain database logic, model definitions, or backend business rules.
- `application/` only consumes backend APIs and renders UI.
- Shared domain rules belong in the backend, not duplicated in the mobile app.
- If a feature needs data access, AI, or tenancy logic, it lives in the backend only.

## Setup Flow

1. **[Step 1: Initialize Root Project](backend/instructions/step-1.md)** - Initialize the root `package.json`
2. **[Step 2: Set up Backend](backend/instructions/step-2.md)** - Install `express`, `dotenv`, `mongoose`, `mongodb`, and `nodemon`
3. **[Step 3: Set up Admin](backend/instructions/step-3.md)** - Initialize the admin app with Vite and React
4. **[Step 4: Set up Application](backend/instructions/step-4.md)** - Initialize the Expo React Native app
5. **[Step 5: Configure Clerk Auth](backend/instructions/step-5.md)** - Add authentication keys and install Clerk packages
6. **[Step 6: Configure Inngest](backend/instructions/step-6.md)** - Add background-job support and signing keys
7. **[Step 7: Configure Cloudinary](backend/instructions/step-7.md)** - Add media upload credentials and backend Cloudinary config

## When to Install Dependencies

### Backend
Install these inside `backend/` when you are working on the API:

```bash
npm install express dotenv
npm install mongoose mongodb
npm install cloudinary
npm install --save-dev nodemon
```

- `express` and `dotenv` are needed for almost every backend setup.
- `mongoose` and `mongodb` are needed when the backend connects to MongoDB.
- `cloudinary` is needed when uploading media files from the backend.
- `nodemon` is for development only.

### Admin
Install admin dependencies inside `admin/` when building the dashboard:

```bash
npm create vite@latest .
npm run build
```

- Run `npm run build` before deployment so the `dist/` folder is generated.
- Add packages such as `axios`, `react-router-dom`, `@clerk/clerk-react`, and `@tanstack/react-query` as the admin features grow.

### Application
Install application dependencies inside `application/` when building the Expo app:

```bash
npx create-expo-app@latest .
```

- Add packages such as `@clerk/clerk-expo`, `axios`, `@tanstack/react-query`, and navigation libraries as features are developed.

## Quick Start

After completing the setup steps, run each service from its folder:

```bash
# Backend
cd backend
npm run dev

# Admin
cd admin
npm run dev

# Application
cd application
npm start
```

## Configuration Files

- **Backend environment**: `backend/.env` - Database, authentication, and external service credentials
- **Admin environment**: `admin/.env` - Frontend API endpoints and Clerk keys
- **Application environment**: `application/.env` - API base URL and Clerk publishable key

## Notes

- Keep all backend secrets in `backend/.env`
- Frontend environment variables should be prefixed with `VITE_` in `admin/.env`
- Expo public variables should be prefixed with `EXPO_PUBLIC_` in `application/.env`
- Keep Cloudinary credentials in `backend/.env` only.
- If you deploy the admin app, build it first so the `dist/` folder exists.