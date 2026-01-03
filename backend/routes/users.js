const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', isVerified: true }).select('-password');
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/assign-doctor', async (req, res) => {
    const { doctorId, token } = req.body;


    const jwt = require('jsonwebtoken');
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
    } catch (e) {
        return res.status(401).json({ msg: 'Invalid token' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.assignedDoctor = doctorId;
        await user.save();
        res.json({ msg: 'Doctor assigned successfully', assignedDoctor: doctorId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
