# MetricBI Backend - Setup & Deployment Guide

## ⚙️ Initial Setup

### 1. Prerequisites
```bash
# Required
Node.js 18+
npm 9+
Git

# Services
MongoDB Atlas (cloud) or local MongoDB
Redis (optional, for caching)
```

### 2. Clone & Install
```bash
# Install dependencies (737 packages)
npm install

# Should complete in ~1-2 minutes
```

### 3. Environment Configuration

#### Development
```bash
# Copy template
cp .env.example .env.development

# Edit with local values
# KEY VARIABLES:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=metricbi
JWT_ACCESS_SECRET=long_random_string_min_32_characters_here_dev_only
JWT_REFRESH_SECRET=long_random_string_min_32_characters_here_dev_only
REDIS_URL=redis://localhost:6379 (optional)
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

#### Production
```bash
# Copy template
cp .env.example .env.production

# Use strong secrets + environment-specific values
# IMPORTANT: Git-ignore .env.production in CI/CD, use secrets manager
```

### 4. MongoDB Setup (Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free tier account

2. **Create Cluster**
   - Free tier M0 (good for dev/testing)
   - Choose region close to users
   - Create database user
   - Set IP whitelist (0.0.0.0/0 for dev, specific IPs for prod)

3. **Get Connection String**
   - Click "Connect" button
   - Copy connection string
   - Replace `<password>` and `<username>`

### 5. Redis Setup (Optional)

#### Local Development
```bash
# macOS (Homebrew)
brew install redis
redis-server

# Ubuntu/Debian
sudo apt-get install redis-server
redis-server

# Windows (Docker recommended)
docker run -d -p 6379:6379 redis:latest
```

#### Production
- Use AWS ElastiCache, Google Cloud Memorystore, or similar
- Connection string format: `redis://user:password@host:port`

---

## 🚀 Development Workflow

### Start Development Server
```bash
# Hot reload with tsx watch
npm run dev

# Output should show:
# ✓ Server running on http://localhost:5000
# ✓ MongoDB connected successfully
# ✓ Redis connected successfully (if configured)
```

### File Changes Auto-Reload
- TypeScript compiles automatically
- Server restarts automatically
- No manual build needed

### Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# API root
curl http://localhost:5000/api/v1

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## 🏗️ Building for Production

### 1. Build
```bash
# Compile TypeScript to JavaScript
npm run build

# Output: dist/ folder with compiled code
```

### 2. Install Production Dependencies
```bash
npm ci --only=production

# Or manually:
npm prune --production
```

### 3. Verify Build
```bash
# Check dist/ folder
ls -la dist/

# Should contain:
# dist/server.js
# dist/app.js
# dist/config/
# dist/features/auth/
# etc.
```

---

## 🌐 Deployment Options

### Option 1: Render.com (Recommended for beginners)

1. **Connect Repository**
   - Push code to GitHub
   - Create service on render.com
   - Connect GitHub repo

2. **Configure**
   ```
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   - Add all .env.production variables in Render dashboard
   - Never commit .env.production to git

### Option 2: Railway.app

1. **Connect GitHub**
   - Create project
   - Connect repository

2. **Configure**
   - Same build/start commands
   - Add environment variables
   - Auto-deploys on git push

### Option 3: AWS (Advanced)

1. **Create EC2 Instance**
   - Ubuntu 22.04 LTS recommended
   - t3.micro for free tier

2. **Setup Node**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Setup MongoDB & Redis**
   - Use AWS RDS for MongoDB
   - Use AWS ElastiCache for Redis

4. **Deploy Application**
   ```bash
   git clone repo
   cd backend
   npm install --production
   npm run build
   npm start
   ```

5. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js
   pm2 startup
   pm2 save
   ```

### Option 4: Docker (All Platforms)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist ./dist
   EXPOSE 5000
   CMD ["node", "dist/server.js"]
   ```

2. **Create .dockerignore**
   ```
   node_modules
   npm-debug.log
   .env.*
   logs
   dist
   ```

3. **Build Image**
   ```bash
   docker build -t metricbi-backend:latest .
   ```

4. **Run Container**
   ```bash
   docker run -p 5000:5000 \
     -e MONGODB_URI="mongodb://..." \
     -e JWT_ACCESS_SECRET="..." \
     metricbi-backend:latest
   ```

---

## 🔒 Production Checklist

### Security
- [ ] JWT secrets are strong (32+ random chars)
- [ ] Environment variables are NOT in git
- [ ] HTTPS enabled on server
- [ ] CORS_ORIGIN restricted to frontend domain
- [ ] MongoDB whitelist set to specific IPs only
- [ ] Rate limiting adjusted for production
- [ ] Helmet middleware active
- [ ] No console.logs in production code
- [ ] Error messages don't leak sensitive info

### Performance
- [ ] Database indexes created
- [ ] Redis enabled for caching
- [ ] Node_modules pruned (no dev dependencies)
- [ ] TypeScript compiled to JavaScript
- [ ] Logging level set to 'info' (not debug)
- [ ] Response caching implemented where appropriate

### Monitoring
- [ ] Health check endpoint working
- [ ] Logging to file enabled
- [ ] Error tracking service (e.g., Sentry) integrated
- [ ] Database backups scheduled
- [ ] Uptime monitoring active

### Deployment
- [ ] Graceful shutdown working
- [ ] Process manager active (PM2, systemd, etc.)
- [ ] Auto-restart on crash configured
- [ ] CI/CD pipeline setup
- [ ] Rollback strategy documented

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database

# Verify credentials
# Ensure special chars are URL-encoded

# Test connection
# Use MongoDB Compass (GUI) to verify
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001

# Or kill process
lsof -i :5000
kill -9 <PID>
```

### Redis Connection Failed
```bash
# Redis is optional, can run without it
# Check REDIS_URL format
REDIS_URL=redis://localhost:6379

# Verify Redis service
redis-cli ping
# Should return: PONG
```

### High Memory Usage
```bash
# Check for memory leaks
# Monitor with: node --max-old-space-size=4096 dist/server.js

# Review logs
tail -f logs/error.log
```

### Slow Query Performance
```bash
# Verify indexes created
db.products.getIndexes()

# Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })

# Check query plans
db.products.find({...}).explain("executionStats")
```

---

## 📊 Monitoring & Logging

### Log Files (Production)
```
logs/
├── error.log    # Only errors
└── combined.log # All logs
```

### View Logs
```bash
# Real-time
tail -f logs/combined.log

# Search for errors
grep "ERROR" logs/combined.log

# Watch specific time range
grep "2024-01-01" logs/combined.log | head -100
```

### Log Levels
```
ERROR   - Critical failures
WARN    - Non-critical issues
INFO    - Important events
DEBUG   - Detailed information (dev only)
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Tests
        run: npm test
      
      - name: Deploy
        run: |
          npm run build
          # Your deploy command here
```

---

## 📈 Scaling Strategy

### Phase 1: Single Server (Current)
- Express on single node
- MongoDB Atlas
- Redis cache optional

### Phase 2: Multi-Instance (Load Balancing)
```
Load Balancer (nginx)
    ├── Instance 1 (Express app)
    ├── Instance 2 (Express app)
    └── Instance 3 (Express app)
         ↓
    MongoDB (shared)
    Redis (shared)
```

### Phase 3: Microservices
```
API Gateway
    ├── Auth Service
    ├── Analytics Service
    ├── Integrations Service
    └── AI Service
         ↓
    MongoDB (per service DB)
    Redis (shared)
    Message Queue (BullMQ)
```

### Phase 4: Distributed System
- Service discovery (Consul, Eureka)
- API mesh (istio)
- Distributed tracing (Jaeger)
- Distributed logging (ELK)

---

## 🎯 Next Deployment Steps

1. **Setup CI/CD**
   - GitHub Actions
   - Automatic testing on push
   - Automatic deployment on main branch

2. **Setup Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring (New Relic, DataDog)
   - Uptime monitoring (Pingdom, StatusPage)

3. **Setup Alerts**
   - Error rate > 1%
   - Response time > 500ms
   - Disk space < 10%
   - Memory > 80%

4. **Backup Strategy**
   - MongoDB daily backups
   - Point-in-time recovery
   - Test restore procedure

5. **Documentation**
   - Runbook for common issues
   - Disaster recovery plan
   - Onboarding guide for new developers

---

**Infrastructure Setup Complete ✅**
