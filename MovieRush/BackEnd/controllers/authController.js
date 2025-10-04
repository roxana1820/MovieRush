const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    req.session.userId = newUser._id;

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.login = async (req, res) => {
  
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id;

    res.status(200).json({
      message: 'Login successful!',
       user: { id: user._id, username: user.username, favorites: user.favorites }
    });
  }catch(err){
    res.status(500).json({message: 'Something went wrong'});
  }
};

//logout
exports.logout = (req,res) => {
  req.session.destroy(err => {
    if(err) return res.status(500).json({message: 'Logout failed'});
    res.clearCookie('connect.sid');
    res.json({message: 'Logged out successfully!'});
  });
};
