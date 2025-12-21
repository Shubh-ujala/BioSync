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
    const [doctors, setDoctors] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const phone = localStorage.getItem('phone');

        if (!token || !username) {
            console.log('Missing data, forcing logout');
            localStorage.clear();
            navigate('/login');
            return;
        }

        const role = localStorage.getItem('role');
        if (role === 'doctor') {
            navigate('/doctor-dashboard');
            return;
        } else if (role === 'admin') {
            navigate('/admin-dashboard');
            return;
        }

        fetch('http://localhost:5001/api/auth/user', {
            headers: { 'x-auth-token': token }
        }).catch(err => console.log(err));

        const storedAssignedDoc = localStorage.getItem('assignedDoctor');

        setUser({ username, phone });

        socketRef.current = io('http://127.0.0.1:5001', { transports: ['websocket'] });

        const joinSession = () => {
            if (username && username !== 'Patient') {
                socketRef.current.emit('join_session', {
                    username: username,
                    phone: phone || 'N/A',
                    role: 'patient',
                    patientId: 'P-' + Math.floor(Math.random() * 10000),
                    assignedDoctor: storedAssignedDoc
                });
            } else {
                localStorage.clear();
                navigate('/login');
            }
        };

        socketRef.current.on('connect', joinSession);

        if (socketRef.current.connected) joinSession();

        fetchData();
        fetchDoctors();
        const interval = setInterval(fetchData, 5000);

        return () => {
            clearInterval(interval);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [navigate]);

    const fetchDoctors = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/users/doctors');
            if (res.ok) {
                const data = await res.json();
                setDoctors(data);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const handleAssign = async (doctorId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5001/api/users/assign-doctor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, token })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('assignedDoctor', data.assignedDoctor);
                alert('Connected with Doctor successfully!');
                window.location.reload();
            } else {
                alert('Failed to connect');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchData = async () => {
        const newHR = Math.floor(60 + Math.random() * 40);
        const newSpO2 = Math.floor(95 + Math.random() * 5);
        const newBP = Math.floor(110 + Math.random() * 20);

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

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

            if (socketRef.current) {
                socketRef.current.emit('vital_update', {
                    heartRate: newHR,
                    spO2: newSpO2,
                    pressure: newBP
                });

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
                message: `${type}: ${value}`,
                patientName: user.username,
                patientPhone: user.phone || 'N/A',
                level,
                timestamp: new Date().toISOString()
            });
        }
    };

    const simulateDataConfig = async () => {
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
                <div className="flex gap-4">
                    <button
                        onClick={() => emitAlert('Emergency Distress', 'Manual Trigger', 'critical')}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                    >
                        SOS Alert
                    </button>
                    <button onClick={simulateDataConfig} className="btn-primary animate-pulse">
                        Sync to Cloud
                    </button>
                </div>
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
            {/* Doctors Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Available Doctors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.length > 0 ? (
                        doctors.map((doc) => (
                            <div key={doc._id} className="glass p-6 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    DR
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Dr. {doc.username}</h3>
                                    <p className="text-xs text-text-muted">General Practitioner</p>
                                    <button
                                        onClick={() => handleAssign(doc._id)}
                                        className="mt-2 text-xs bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 px-3 py-1 rounded transition-colors"
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-muted col-span-full">No doctors currently registered.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
