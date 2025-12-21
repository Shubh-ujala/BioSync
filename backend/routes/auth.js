const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mult = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Images/PDFs Only!'));
    }
});

router.post('/register', upload.single('verificationDocument'), async (req, res) => {
    const { username, email, password, role, phone } = req.body;
    const verificationDocument = req.file ? req.file.path : null;
    console.log('Register Request:', { username, email, role, phone, verificationDocument });

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        if (role === 'doctor' && !verificationDocument) {
            return res.status(400).json({ msg: 'Doctors must provide verification document' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: role || 'patient',
            verificationDocument,
            isVerified: role === 'doctor' ? false : true
        });

        await user.save();
        console.log('User saved successfully:', user._id);

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                throw err;
            }
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).send('Server error: ' + err.message);
    }
});

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

        if (user.role === 'doctor' && !user.isVerified) {
            return res.status(403).json({ msg: 'Account pending verification' });
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
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    phone: user.phone,
                    assignedDoctor: user.assignedDoctor
                }
            });
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server error: ' + err.message);
    }
});

module.exports = router;
