# Step 1
initilize the package.json on the root file
```bash
npm init -y
```
# step 2 build the dependency for the backend admin and mobile
---
## set up the backend
```bash
cd backend
```
```bash
npm init -y
```
```bash
npm install express dotenv
```

for the nodemon synchronization for dev environment
```bash
npm install --save-dev nodemon
```
---
## set up the admin
```bash
cd admin
```
```bash
npm create vite@latest .
```
---
## set up the mobile application
```bash 
cd application
```
```bash
npx create-expo-app@latest .
```