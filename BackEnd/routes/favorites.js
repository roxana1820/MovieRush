const express = require('express');
const router = express.Router();
const User = require('../models/User');


function requireAuth(req,res,next) {
    if(!req.session.userId) {
        return res.status(401).json({message: 'Not authenticated'});
    }
    next();
}

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if(!user) return res.status(404).json({message: 'User not found'});

  res.json({favorites: user.favorites});

});

//add a movie
router.post('/add', requireAuth, async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.favorites.includes(movieId)) {
    user.favorites.push(movieId);
    await user.save();
  }

  res.json({ favorites: user.favorites });

});

//remove a movie
router.post('/remove', requireAuth, async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.favorites = user.favorites.filter(id => id !== movieId);
  await user.save();

  res.json({ favorites: user.favorites });
});

module.exports = router;