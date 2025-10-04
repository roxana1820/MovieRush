const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', async (req, res) => {
  try {
    console.log('=== /me called ==='); 
    console.log('Session userId:', req.session.userId);  

    if (!req.session.userId) {
      console.log('No userId – not logged in');
      return res.json({ loggedIn: false });
    }

  
    const User = require('../models/User');  
    const user = await User.findById(req.session.userId).select('-password');  

    if (!user) {
      console.log('User not found in DB');
      return res.json({ loggedIn: false });
    }

    console.log('User found:', user.username);  
    res.json({ 
      loggedIn: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        favorites: user.favorites 
      } 
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ loggedIn: false, error: 'Internal server error' });
  }
});

module.exports = router;
