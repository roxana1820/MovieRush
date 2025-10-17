const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const session = require('express-session');

dotenv.config();
const app = express();

app.use(express.json());


// CORS configuration - works for both development and production
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://movie-rush-qxcb.onrender.com', 
  'https://movierush-0dl7.onrender.com' // Your production frontend URL
  // Add any other production URLs here
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost/127.0.0.1
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Session configuration - works for both development and production
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: isProduction,  // true in production (HTTPS), false in development
    sameSite: isProduction ? 'none' : 'lax',  // 'none' for cross-origin in production, 'lax' for localhost
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
    // Don't set domain - let it default to the request domain
  },
  name: 'connect.sid',
  proxy: isProduction  // Trust proxy in production (Render uses proxies)
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running\nv1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Movies routes
const moviesRoutes = require('./routes/moviesRoutes');
app.use('/api/movies', moviesRoutes);

//Favorites routes
const favoritesRoutes = require('./routes/favorites');
app.use('/api/favorites', favoritesRoutes);

// DB + Server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Connection failed:', err);
});
