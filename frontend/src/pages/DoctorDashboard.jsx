import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Bell } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activePatients, setActivePatients] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const socketRef = useRef(null);



    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'doctor') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        socketRef.current = io('http://localhost:5001', { transports: ['websocket'] });

        const joinSession = () => {
            if (user) {
                socketRef.current.emit('join_session', { username: user.username, role: 'doctor' });
            }
        };

        if (socketRef.current.connected) {
            joinSession();
        } else {
            socketRef.current.on('connect', joinSession);
        }

        socketRef.current.on('patient_update', (patients) => {
            if (user && user.id) {
                console.log('Doctor ID:', user.id);
                console.log('Incoming Patients:', patients);
                const myPatients = patients.filter(p => p.assignedDoctor && String(p.assignedDoctor) === String(user.id));
                setActivePatients(myPatients);
            }
        });

        socketRef.current.on('alert_broadcast', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 5));
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [user]);

    return (
        <div className="min-h-screen bg-background text-white">
            <Navbar />
            <div className="page-container mt-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
                    <p className="text-text-muted">Monitor your patients' real-time status</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm uppercase tracking-wider">Active Patients</p>
                            <h3 className="text-3xl font-bold mt-1">{activePatients.length}</h3>
                            <span className="text-primary text-sm">Currently Monitoring</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Activity className="text-primary" /> Live Patient Vitals
                        </h2>
                        {activePatients.length === 0 ? (
                            <div className="glass p-8 rounded-2xl text-center text-text-muted">
                                No patients are currently online.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {activePatients.map((patient) => (
                                    <div key={patient.socketId} className="glass p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-primary">
                                        <div>
                                            <h3 className="font-bold text-lg">{patient.username}</h3>
                                            <p className="text-text-muted text-sm">ID: {patient.socketId.substr(0, 6)}</p>
                                            <p className="text-primary text-xs mt-1">📞 {patient.phone || 'N/A'}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 text-center">
                                            <div>
                                                <p className="text-xs text-text-muted">Heart Rate</p>
                                                <p className="font-mono text-lg text-primary">{patient.vitals?.heartRate || '--'} bpm</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted">BP</p>
                                                <p className="font-mono text-lg text-accent">{patient.vitals?.pressure || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted">O2</p>
                                                <p className="font-mono text-lg text-secondary">{patient.vitals?.spO2 || '--'}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>



                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Bell className="text-danger" /> Recent Alerts
                        </h2>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="glass p-6 rounded-xl text-center text-text-muted text-sm">
                                    No critical alerts.
                                </div>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className="glass p-4 rounded-xl border border-danger/20 bg-danger/5">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-danger text-sm">CRITICAL</span>
                                            <span className="text-xs text-text-muted">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-medium">{alert.message}</p>
                                        <p className="text-xs text-text-muted mt-1">Patient: {alert.patientName}</p>
                                        <p className="text-xs text-primary mt-0.5">Contact: {alert.patientPhone}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DoctorDashboard;
