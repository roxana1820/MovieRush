const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

dotenv.config();
const app = express();

app.use(express.json());

// CORS configuration - must allow credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and 127.0.0.1 on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: false,
    sameSite: 'lax',  // lax works when both are on same domain (127.0.0.1)
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    domain: '127.0.0.1'  // Explicitly set domain
  },
  name: 'connect.sid'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
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
