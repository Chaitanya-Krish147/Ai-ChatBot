const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });

// Log function
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(logMessage);
};

log('Server starting...');

// In-memory "database"
const users = [];

// Log all requests with more details
app.use((req, res, next) => {
  log(`[${req.method}] ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    log(`Request body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  log(`Error: ${err.message}`);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  log('Health check');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    usersCount: users.length
  });
});

// Helper function to generate JWT token
const generateToken = (user) => {
  // In a real app, you would use jsonwebtoken or similar
  return `mock-jwt-token-for-${user.email}`;
};

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Signup endpoint
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // In a real app, you would hash the password here
    const newUser = { 
      id: Date.now().toString(),
      email,
      password, // In production, NEVER store plain text passwords
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Generate token
    const token = generateToken(newUser);
    
    // Return success response without sensitive data
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        token
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    
    // In a real app, you would verify the hashed password
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});


