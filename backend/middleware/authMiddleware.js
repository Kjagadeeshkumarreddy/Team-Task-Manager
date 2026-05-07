const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Check header first, then cookie
  let token = req.header('Authorization');
  if (token) {
    token = token.replace('Bearer ', '');
  } else {
    token = req.cookies.refreshToken;
  }

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied, Admin only' });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
