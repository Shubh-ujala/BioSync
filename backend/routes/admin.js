const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET api/admin/stats
// @desc    Get system statistics
// @access  Public (Protected by frontend role check, ideally should be middleware protected)
router.get('/stats', async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });

        // Mock data for devices and alerts until we have real collections
        const activeDevices = Math.floor(Math.random() * (1000 - 800) + 800); // Mock fluctuating active devices
        const criticalAlerts = Math.floor(Math.random() * 5); // Mock random critical alerts

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
