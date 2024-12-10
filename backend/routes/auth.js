const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({ username: req.body.username, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully.');
    } catch (error) {
        res.status(400).send('Error registering user.');
    }
});

// User login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('User not found.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password.');

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.json({ accessToken });
});

// Protected route to get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    res.json(user);
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { username: username }, { new: true });
    res.json(user);
});

// Refresh token route
router.post('/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.sendStatus(204);
});

// Reset Password
router.post('/reset-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.send('Password reset successfully.');
});

module.exports = router;