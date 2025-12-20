import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Droplet, Thermometer } from 'lucide-react';
import io from 'socket.io-client';
import VitalCard from '../components/VitalCard';
import HealthChart from '../components/HealthChart';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [vitals, setVitals] = useState({
        heartRate: { value: 0, status: 'normal', history: [] },
        spO2: { value: 0, status: 'normal', history: [] },
        pressure: { value: 0, status: 'normal', history: [] }
    });
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username'); // Get username
        if (!token) {
            navigate('/login');
            return;
        }
        setUser({ username: username || 'Patient' });

        // Socket Connection
        socketRef.current = io('http://127.0.0.1:5001', { transports: ['websocket'] });

        const joinSession = () => {
            socketRef.current.emit('join_session', {
                username: username || 'Patient',
                role: 'patient',
                patientId: 'P-' + Math.floor(Math.random() * 10000) // Mock ID
            });
        };

        socketRef.current.on('connect', joinSession);

        // Also call immediately in case it's already connected (race condition)
        if (socketRef.current.connected) joinSession();

        fetchData();
        const interval = setInterval(fetchData, 5000);

        return () => {
            clearInterval(interval);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [navigate]);

    const fetchData = async () => {
        const newHR = Math.floor(60 + Math.random() * 40);
        const newSpO2 = Math.floor(95 + Math.random() * 5);
        const newBP = Math.floor(110 + Math.random() * 20);

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Update local state
        setVitals(prev => {
            const updateHistory = (list, val) => [...list.slice(-10), { time: timestamp, value: val }];
            const newState = {
                heartRate: {
                    value: newHR,
                    status: newHR > 90 ? 'warning' : 'normal',
                    history: updateHistory(prev.heartRate.history, newHR)
                },
                spO2: {
                    value: newSpO2,
                    status: newSpO2 < 95 ? 'warning' : 'normal',
                    history: updateHistory(prev.spO2.history, newSpO2)
                },
                pressure: {
                    value: newBP,
                    status: newBP > 135 ? 'critical' : 'normal',
                    history: updateHistory(prev.pressure.history, newBP)
                }
            };

            // Emit to socket
            if (socketRef.current) {
                socketRef.current.emit('vital_update', {
                    heartRate: newHR,
                    spO2: newSpO2,
                    pressure: newBP
                });

                // Check and Emit Alerts
                if (newHR > 120) emitAlert('Critical Heart Rate', `${newHR} bpm`, 'danger');
                if (newSpO2 < 90) emitAlert('Low Oxygen Saturation', `${newSpO2}%`, 'danger');
                if (newBP > 160) emitAlert('High Blood Pressure', `${newBP} mmHg`, 'danger');
            }

            return newState;
        });
    };

    const emitAlert = (type, value, level) => {
        if (socketRef.current) {
            socketRef.current.emit('emergency_alert', {
                type,
                value,
                level,
                timestamp: new Date().toISOString()
            });
        }
    };

    const simulateDataConfig = async () => {
        // ... existing sync logic ...
        alert('Data synced to cloud!');
    };

    if (!user) return <div className="text-white pt-24 text-center">Loading...</div>;

    return (
        <div className="page-container">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Vitals</h1>
                    <p className="text-text-muted">Live monitoring session active</p>
                </div>
                <button onClick={simulateDataConfig} className="btn-primary animate-pulse">
                    Sync to Cloud
                </button>
            </header>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mb-16">
                <VitalCard
                    title="Heart Rate"
                    value={vitals.heartRate.value}
                    unit="bpm"
                    status={vitals.heartRate.status}
                    icon={<Heart className="text-danger w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />}
                />
                <VitalCard
                    title="Blood Oxygen"
                    value={vitals.spO2.value}
                    unit="%"
                    status={vitals.spO2.status}
                    icon={<Activity className="text-primary w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />}
                />
                <VitalCard
                    title="Blood Pressure"
                    value={vitals.pressure.value}
                    unit="mmHg"
                    status={vitals.pressure.status}
                    icon={<Droplet className="text-accent w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />}
                />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-5">
                <HealthChart data={vitals.heartRate.history} dataKey="value" color="#f87171" />
                <HealthChart data={vitals.spO2.history} dataKey="value" color="#c084fc" />
            </div>
        </div>
    );
};

export default Dashboard;
