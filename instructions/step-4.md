# Step 4: Set up the Mobile Application

## Overview
This step initializes the mobile application using Expo.

## Prerequisites
- Ensure you're in the root `metricBI/` directory
- Node.js and npm are installed
- Expo Go app installed on your mobile device (available on iOS App Store and Google Play Store)

## Steps

### 1. Navigate to application folder
```bash
cd application
```

### 2. Create Expo project
```bash
npx create-expo-app@latest .
```

## What will be installed
The Expo setup will create:
- `package.json` with Expo and React Native dependencies
- `app.json` for Expo configuration
- Project structure with app/ folder
- Development environment for mobile

## Verify Setup
After installation, you should have:
```
application/
├── package.json
├── app.json
├── .gitignore
└── app/
    ├── index.tsx
    ├── _layout.tsx
    └── modal.tsx
```

## Available Scripts
Once setup is complete:
```bash
npm start        # Start Expo development server
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run web      # Run in web browser
```

## Running on Physical Device
1. Install Expo Go app on your mobile device
2. Run `npm start` and scan the QR code with your device
3. The app will load in Expo Go

## What's Next?
Your project structure is now complete! You can now:
- Develop the backend in `backend/`
- Build the admin panel in `admin/`
- Create the mobile app in `application/`

For detailed development instructions for each part, see the respective README files in each folder.
