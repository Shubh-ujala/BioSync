// these are the imports which we have to do otherwise we are not able to use the libraries

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/device', require('./routes/device'));
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send('Healthcare System API is running');
});

let activePatients = new Map();

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_session', (userData) => {
        console.log(`[DEBUG] Join Session: ${socket.id}`, userData);
        if (userData && userData.role === 'patient') {
            activePatients.set(socket.id, { ...userData, socketId: socket.id, lastUpdate: new Date() });
            console.log(`[DEBUG] Current Patients: ${activePatients.size}`);
            io.emit('patient_update', Array.from(activePatients.values()));
        } else if (userData && (userData.role === 'admin' || userData.role === 'doctor')) {
            console.log(`[DEBUG] ${userData.role} Joined: ${socket.id}`);
            if (userData.role === 'admin') socket.join('admin');
            socket.emit('patient_update', Array.from(activePatients.values()));
        }
    });

    socket.on('vital_update', (data) => {
        if (activePatients.has(socket.id)) {
            const patient = activePatients.get(socket.id);
            const updatedPatient = { ...patient, vitals: data, lastUpdate: new Date() };
            activePatients.set(socket.id, updatedPatient);
            io.emit('patient_update', Array.from(activePatients.values()));
        }
    });

    socket.on('emergency_alert', (alertData) => {
        io.emit('alert_broadcast', alertData);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
        if (activePatients.has(socket.id)) {
            activePatients.delete(socket.id);
            io.emit('patient_update', Array.from(activePatients.values()));
        }
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
