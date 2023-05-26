const express = require('express');
const jwt  = require ('jsonwebtoken');
const mongoose = require('./conn');
const secretKey = 'secretkey';
const refreshKey = 'refreshkey';
const User = require('./db')

const app= express();
app.use(express.json());

  // API endpoints
  app.get('/api/users', (req, res) => {
    User.find()
      .then(users => {
        res.json(users);
      })
      .catch(error => {
        res.status(500).json({ error: 'Error retrieving users' });
      });
  });
  
  app.post('/api/users', (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
  
    user.save()
      .then(savedUser => {
        res.json(savedUser);
      })
      .catch(error => {
        res.status(500).json({ error: 'Error creating user' });
      });
  });

//Generate an access token
// Generate a refresh token

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1hr' });
}

function generateRefreshToken(user) {
    return jwt.sign({ userId: user._id }, refreshKey, { expiresIn: '7d' });
  }
  
  // Login endpoint
  app.post('/api/login', (req, res) => {
    // Check if the username and password match
    User.findOne({ username: req.body.username, password: req.body.password })
      .then(user => {
        if (!user) {
          res.status(401).json({ error: 'Invalid credentials' });
        } else {
          // Generate an access token and refresh token
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);
  
          // Store the refresh token in the database (associate it with the user)
  
          res.json({ accessToken, refreshToken });
        }
      })
      .catch(error => {
        res.status(500).json({ error: 'Error logging in' });
      });
  });
  
  // Refresh token endpoint
  app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
  
    // Verify the refresh token
    jwt.verify(refreshToken, 'refreshSecret', (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Invalid refresh token' });
      } else {
        // Generate a new access token and send it back
        const newAccessToken = generateAccessToken(decoded.userId);
        res.json({ accessToken: newAccessToken });
      }
    });
  });

  // Middleware to authenticate access token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Access token not provided' });
    }
  
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid access token' });
      }
  
      // The token is valid
      req.userId = decoded.userId;
      next();
    });
  }
  
  // Example API endpoint that requires authentication
  app.get('/api/profile', authenticateToken, (req, res) => {
    User.findById(req.userId)
      .then(user => {
        if (!user) {
          res.status(404).json({ error: 'User not found' });
        } else {
          res.json(user);
        }
      })
      .catch(error => {
        res.status(500).json({ error: 'Error retrieving user' });
      });
  });
  
  // Middleware to authenticate API key
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['Aspire@123'];
  
    if (!apiKey) {
      return res.status(401).json({ error: 'API key not provided' });
    }
    if (apiKey !== 'Aspire@123') {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    next();
  }
  
  // Example API endpoint that requires authentication using API key or access token
  app.get('/api/data', [authenticateApiKey, authenticateToken], (req, res) => {
    // Either the API key or access token is valid, continue with the API logic
    // You can access the userId using req.userId if the access token is used
    // You can also access the API key using req.headers['Aspire@123']
    
    // Example API logic
    res.json({ message: 'Authenticated successfully' });
  });
  
  
  //creating server
app.listen(3000, () => {
    console.log('Server is running on 3000')
})


