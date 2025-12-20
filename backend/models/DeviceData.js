const mongoose = require('mongoose');

const DeviceDataSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceType: { type: String, required: true }, // e.g., 'heartRate', 'bloodPressure', 'spO2'
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' }
});

module.exports = mongoose.model('DeviceData', DeviceDataSchema);
