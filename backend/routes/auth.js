const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('Register Request:', { username, email, role });

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'patient'
        });

        await user.save();
        console.log('User saved successfully:', user._id);

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                throw err;
            }
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Server error: ' + err.message);
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login Request:', { email });

    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                throw err;
            }
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server error: ' + err.message);
    }
});

module.exports = router;
