const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (user) => {
  const payload = { user: { id: user.id, role: user.role } };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, {
    ...commonOptions,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    ...commonOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setCookies(res, accessToken, refreshToken);

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    setCookies(res, accessToken, refreshToken);

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Refresh tokens on check
    const { accessToken, refreshToken } = generateTokens(user);
    setCookies(res, accessToken, refreshToken);
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutUser = (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
  res.json({ message: 'Logged out successfully' });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, getUsers, getMe, logoutUser };
