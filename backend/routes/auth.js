const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getMe, logoutUser } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);

module.exports = router;
