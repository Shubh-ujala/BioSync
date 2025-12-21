const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/stats', async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });

        const activeDevices = Math.floor(Math.random() * (1000 - 800) + 800);
        const criticalAlerts = Math.floor(Math.random() * 5);

        res.json({
            totalPatients,
            activeDevices,
            criticalAlerts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

router.get('/pending-doctors', async (req, res) => {
    try {
        const pendingDoctors = await User.find({ role: 'doctor', isVerified: false }).select('-password');
        res.json(pendingDoctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/approve-doctor/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isVerified = true;
        await user.save();
        res.json({ msg: 'Doctor verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/reject-doctor/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Doctor application rejected and removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
