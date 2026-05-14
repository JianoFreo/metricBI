# Authentication System - Quick Reference

## 📝 Common Tasks

### Client Implementation Examples

#### 1. Register User
```javascript
// JavaScript/React
const registerUser = async (companyId, email, password, firstName, lastName) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId,
      email,
      password,      // Min 8 chars, uppercase, lowercase, number
      firstName,     // Min 2 chars
      lastName       // Min 2 chars
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};
```

#### 2. Login User
```javascript
// JavaScript/React
const loginUser = async (companyId, email, password) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, email, password })
  });

  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};
```

#### 3. Make Protected Request
```javascript
// JavaScript/React
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/v1/auth/me', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.status === 401) {
    // Token expired, refresh it
    await refreshAccessToken();
    // Retry with new token
    return getProfile();
  }

  return await response.json();
};
```

#### 4. Refresh Access Token
```javascript
// JavaScript/React
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:5000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  } else {
    // Refresh failed, must login again
    logout();
  }
};
```

#### 5. Logout
```javascript
// JavaScript/React
const logout = async () => {
  const token = localStorage.getItem('accessToken');
  
  await fetch('http://localhost:5000/api/v1/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login page
};
```

#### 6. Change Password
```javascript
// JavaScript/React
const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/v1/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });

  if (response.ok) {
    console.log('Password changed successfully');
    // Force re-login (refresh token was invalidated)
    logout();
  } else {
    const data = await response.json();
    throw new Error(data.error.message);
  }
};
```

### Axios Wrapper Example
```javascript
// React with Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          { refreshToken }
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(error.config);
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Using in Components
```javascript
// Usage in React component
import api from './api';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return <div>{user?.email}</div>;
}
```

---

## 🧪 Testing with curl

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "650abcd1234567890123456",
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "650abcd1234567890123456",
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

### Change Password
```bash
curl -X POST http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePassword123",
    "newPassword": "NewSecurePassword456"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🛡️ Using Auth in Protected Routes

### Backend - Protecting Routes
```typescript
// In your feature routes
import { Router } from 'express';
import { protect, verifyTenant, requireRole } from '@features/auth/middleware/auth.middleware.js';

const router = Router();

// Public route
router.post('/public-action', (req, res) => {
  res.json({ message: 'No auth required' });
});

// Protected route (any authenticated user)
router.get('/protected-resource', protect, verifyTenant, (req, res) => {
  // req.user is populated with {userId, email, companyId, role}
  // req.companyId is set (same as user's companyId)
  res.json({ 
    message: 'Only authenticated users can access',
    user: req.user 
  });
});

// Admin-only route
router.post('/admin-action', 
  protect, 
  verifyTenant, 
  requireRole('admin', 'super_admin'),
  (req, res) => {
    res.json({ message: 'Admin only' });
  }
);

// Multi-role route
router.get('/manager-view',
  protect,
  verifyTenant,
  requireRole('manager', 'admin', 'super_admin'),
  (req, res) => {
    res.json({ message: 'Manager and above only' });
  }
);

export default router;
```

### Using req.companyId in Queries
```typescript
// All queries automatically scoped to user's company
import { User } from '@features/auth/models/User.js';

// In controller
export const listUsers = async (req: Request, res: Response) => {
  // req.companyId is automatically set from JWT
  const users = await User.find({ companyId: req.companyId });
  res.json(users);
};

// In service
export class UserService {
  async getCompanyUsers(companyId: string) {
    // Query is scoped to company
    return User.find({ companyId }).select('-password');
  }
}
```

---

## 📊 Token Structure

### Access Token (JWT)
```javascript
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "650xyz123...",
  "email": "user@example.com",
  "companyId": "650abcd123...",
  "role": "manager",
  "firstName": "John",
  "lastName": "Doe",
  "iat": 1705313400,
  "exp": 1705314300  // 15 minutes from now
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_ACCESS_SECRET
)
```

### Refresh Token (JWT)
```javascript
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "650xyz123...",
  "email": "user@example.com",
  "companyId": "650abcd123...",
  "role": "manager",
  "firstName": "John",
  "lastName": "Doe",
  "iat": 1705313400,
  "exp": 1706177400  // 7 days from now
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_REFRESH_SECRET
)
```

---

## ⚙️ Configuration Reference

### Environment Variables
```env
# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_ACCESS_SECRET=abcdef1234567890abcdef1234567890...  # ≥32 chars
JWT_REFRESH_SECRET=xyz9876543210xyz9876543210xyz98765...  # ≥32 chars

# JWT Expiry
JWT_ACCESS_EXPIRY=15m      # Access token lifetime
JWT_REFRESH_EXPIRY=7d      # Refresh token lifetime

# Cookie Settings
AUTH_USE_COOKIES=false          # true to use HttpOnly cookies
AUTH_COOKIE_NAME=metricbi_refresh_token
AUTH_COOKIE_DOMAIN=.example.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Other
NODE_ENV=production
PORT=5000
```

---

## 🔍 Debugging

### Token Decode
```bash
# You can decode JWT at jwt.io without verification to inspect payload
# NEVER use plaintext tokens in production

# Or in Node.js:
node -e "console.log(JSON.parse(Buffer.from('eyJhbGciOi...', 'base64').toString()))"
```

### Check Token Expiry
```javascript
const decoded = jwt.decode(token);
const expiresAt = new Date(decoded.exp * 1000);
console.log('Token expires:', expiresAt);
```

### Monitor Auth Logs
```bash
# Watch logs for auth events
tail -f logs/application.log | grep -i auth
```

### Rate Limit Testing
```bash
# Try 6 rapid login attempts (limit is 5/15min)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"companyId":"xxx","email":"test@example.com","password":"test"}'
done
# 6th attempt should return 429 Too Many Requests
```

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid token"
**Solution:**
- Verify token hasn't expired (access tokens expire in 15 minutes)
- Check Authorization header format: `Bearer <token>`
- Verify correct secret is used for verification
- Try refreshing token

### Issue: "User not found"
**Solution:**
- Verify companyId in login request
- Check email spelling
- Ensure user is registered before login

### Issue: "Too many login attempts"
**Solution:**
- Rate limit is 5 attempts per 15 minutes
- Wait 15 minutes or check environment's rate limiter config
- Check for automated login attempts

### Issue: Token works in some requests, fails in others
**Solution:**
- Check if Bearer token is included in Authorization header
- Verify token hasn't expired (15 min lifetime)
- Ensure same JWT_ACCESS_SECRET is used on server

### Issue: Refresh token not working
**Solution:**
- Refresh token may have been rotated
- Check if refresh token hash is in database
- Verify JWT_REFRESH_SECRET on server
- Try refreshing with new token from login

### Issue: Can't access other company's data
**Solution:**
- That's correct! Tenant isolation prevents cross-company access
- Only super_admin can access other companies
- All queries are automatically scoped to user's companyId

---

## 🔐 Security Best Practices

### Client-Side
- ✅ Always use HTTPS (never HTTP)
- ✅ Never include tokens in URL
- ✅ Store access token in memory (don't localStorage)
- ✅ Store refresh token in HttpOnly cookie (let server manage)
- ✅ Clear tokens on logout
- ✅ Implement token refresh logic before expiry

### Server-Side
- ✅ Use strong random JWT secrets (≥32 chars)
- ✅ Rotate JWT secrets periodically
- ✅ Never log tokens or passwords
- ✅ Use HTTPS in production
- ✅ Enforce rate limiting
- ✅ Monitor auth failures
- ✅ Implement logging/audit trail

### Passwords
- ✅ Never transmit in URL
- ✅ Always send over HTTPS
- ✅ Hash with bcrypt (10+ rounds)
- ✅ Never store plaintext
- ✅ Enforce strength requirements
- ✅ Support password reset (email verification)

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT structure, tools, libraries
- [Auth0 Blog](https://auth0.com/blog/) - Auth best practices
- [OWASP Authentication](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing) - Auth testing guide
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Zod Docs](https://zod.dev/) - Input validation

---

**Happy authenticating! 🔐**
