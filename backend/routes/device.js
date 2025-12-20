const express = require('express');
const router = express.Router();
const DeviceData = require('../models/DeviceData');
const User = require('../models/User');

// Middleware to verify token (simplified)
const auth = (req, res, next) => {
    // In a real app, verify JWT here
    next();
};

// Post Device Data
router.post('/', async (req, res) => {
    const { patientId, deviceType, value, unit } = req.body;
    try {
        // Determine status based on thresholds (mock logic)
        let status = 'normal';
        if (deviceType === 'heartRate' && (value > 100 || value < 60)) status = 'warning';
        if (deviceType === 'spO2' && value < 95) status = 'warning';
        if (deviceType === 'bloodPressure' && value > 140) status = 'critical';

        const newData = new DeviceData({
            patientId,
            deviceType,
            value,
            unit,
            status
        });

        await newData.save();
        res.json(newData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Device Data for a Patient
router.get('/:patientId', async (req, res) => {
    try {
        const data = await DeviceData.find({ patientId: req.params.patientId }).sort({ timestamp: -1 }).limit(10);
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
