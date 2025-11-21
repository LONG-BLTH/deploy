# Day 3: Authentication & Authorization with JWT

## Learning Objectives
- Understand JWT (JSON Web Tokens) authentication
- Implement user registration and login
- Protect routes with authentication middleware
- Handle password hashing and security best practices

---

## Exercise 1: User Registration & Password Hashing

### Branch: `day3-ex1-question`

**Goal:** Implement user registration with password hashing

**Starting Files:**

#### `models/User.js`
```javascript
const users = [];
let nextId = 1;

const User = {
  create: (userData) => {
    // TODO: Implement user creation
    // 1. Hash the password using bcrypt
    // 2. Create user object with hashed password
    // 3. Add to users array
    // 4. Return user without password
  },

  findByEmail: (email) => {
    // TODO: Find user by email
  },

  findById: (id) => {
    // TODO: Find user by id
  }
};

module.exports = User;
```

#### `controllers/authController.js`
```javascript
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    // TODO: Implement registration logic
    // 1. Validate input (email, password, name)
    // 2. Check if user already exists
    // 3. Create new user
    // 4. Return success response
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};
```

#### `routes/auth.js`
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// TODO: Add registration route
// POST /api/auth/register

module.exports = router;
```

**Requirements:**
- Install and use `bcrypt` for password hashing
- Validate email format and password strength (min 6 characters)
- Check for duplicate email addresses
- Never store plain text passwords
- Return user data without password field

**Test Cases:**
```bash
# Success case
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
# Expected: 201 status, user object without password

# Duplicate email
POST /api/auth/register (same email again)
# Expected: 400 status, error message

# Invalid input
POST /api/auth/register
{
  "email": "invalid-email",
  "password": "123"
}
# Expected: 400 status, validation errors
```

---

### Branch: `day3-ex1-answer`

**Complete Implementation:**

#### `package.json` (add dependencies)
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

#### `models/User.js`
```javascript
const bcrypt = require('bcrypt');

const users = [];
let nextId = 1;

const User = {
  create: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  findByEmail: (email) => {
    return users.find(user => user.email === email);
  },

  findById: (id) => {
    const user = users.find(user => user.id === parseInt(id));
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;
```

#### `controllers/authController.js`
```javascript
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Simple email validation
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};
```

#### `routes/auth.js`
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

module.exports = router;
```

#### `app.js` (add auth routes)
```javascript
const authRoutes = require('./routes/auth');

// Mount routes
app.use('/api/auth', authRoutes);
```

---

## Exercise 2: User Login & JWT Token Generation

### Branch: `day3-ex2-question`

**Goal:** Implement login functionality with JWT token generation

**Starting Files:**

#### `config/jwt.js`
```javascript
module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: '24h'
};
```

#### `controllers/authController.js` (add to existing)
```javascript
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

exports.login = async (req, res) => {
  try {
    // TODO: Implement login logic
    // 1. Validate input (email, password)
    // 2. Find user by email
    // 3. Compare password with hashed password
    // 4. Generate JWT token
    // 5. Return token and user data
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};
```

#### `routes/auth.js` (add to existing)
```javascript
// TODO: Add login route
// POST /api/auth/login
```

**Requirements:**
- Validate email and password are provided
- Return 401 for invalid credentials
- Generate JWT token with user id and email in payload
- Token should expire in 24 hours
- Return both token and user data (without password)

**Test Cases:**
```bash
# Success case
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
# Expected: 200 status, token and user object

# Invalid email
POST /api/auth/login
{
  "email": "wrong@example.com",
  "password": "password123"
}
# Expected: 401 status, "Invalid credentials"

# Wrong password
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "wrongpassword"
}
# Expected: 401 status, "Invalid credentials"

# Missing fields
POST /api/auth/login
{
  "email": "john@example.com"
}
# Expected: 400 status, validation error
```

---

### Branch: `day3-ex2-answer`

**Complete Implementation:**

#### `config/jwt.js`
```javascript
module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: '24h'
};
```

#### `controllers/authController.js` (add to existing)
```javascript
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};
```

#### `routes/auth.js` (complete file)
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
```

---

## Summary

**Day 3 Progress:**
-  Exercise 1: User registration with bcrypt password hashing
-  Exercise 2: User login with JWT token generation
- = Exercise 3: Authentication middleware (protect routes)
- = Exercise 4: User profile & protected endpoints

**Key Concepts Covered:**
- Password hashing with bcrypt
- JWT token generation and structure
- Input validation
- Security best practices
- MVC pattern for authentication

**Dependencies Added:**
```bash
npm install bcrypt jsonwebtoken
```

**Next Steps:**
Day 3 will continue with Exercise 3 (authentication middleware) and Exercise 4 (protected routes and user profile).
