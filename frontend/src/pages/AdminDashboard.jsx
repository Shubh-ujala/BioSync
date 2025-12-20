
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, AlertTriangle, X } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Stats State
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeDevices: 0,
        criticalAlerts: 0
    });
    const [activeSessions, setActiveSessions] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const socketRef = useRef(null);

    // Auth Check
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Initialize Settings from LocalStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Socket & Data Logic
    useEffect(() => {
        // Initial HTTP fetch for DB stats
        const fetchDbStats = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/admin/stats');
                const data = await res.json();
                setStats(prev => ({ ...prev, totalPatients: data.totalPatients }));
            } catch (err) {
                console.error('Error fetching admin stats:', err);
            }
        };

        fetchDbStats();

        // Socket Connection
        socketRef.current = io('http://127.0.0.1:5001', { transports: ['websocket'] });

        const joinAdminSession = () => {
            socketRef.current.emit('join_session', { username: user?.username || 'Admin', role: 'admin' });
        };

        socketRef.current.on('connect', joinAdminSession);
        if (socketRef.current.connected) joinAdminSession();

        // Listeners
        socketRef.current.on('patient_update', (patients) => {
            setActiveSessions(patients);
            setStats(prev => ({ ...prev, activeDevices: patients.length }));
        });

        socketRef.current.on('alert_broadcast', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10
            setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));

            // Notification logic if enabled
            const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
            if (currentSettings.notifications !== false) {
                // Could add a toast here, for now relying on UI list
                console.log('ALERT RECEIVED:', alert);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const statCards = [
        { title: 'Total Patients', value: stats.totalPatients, icon: <Users className="text-primary" />, change: '+Live' },
        { title: 'Active Devices', value: stats.activeDevices, icon: <Activity className="text-accent" />, change: 'Online' },
        { title: 'Critical Alerts', value: stats.criticalAlerts, icon: <AlertTriangle className="text-danger" />, change: 'Action Req' },
    ];

    return (
        <div className="page-container relative">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
                    <p className="text-text-muted">System Overview & Management</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="glass p-6 border border-white/10 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl flex items-center justify-center bg-white/5 border border-white/5">{stat.icon}</div>
                            <span className={`text - sm font - semibold ${stat.title === 'Critical Alerts' && stat.value > 0 ? 'text-danger' : 'text-success'} `}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold my-2">{stat.value}</h3>
                        <p className="text-text-muted text-sm">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Patients List */}
                <div className="glass p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="text-success w-5 h-5" /> Live Patients ({activeSessions.length})
                    </h2>
                    {activeSessions.length === 0 ? (
                        <p className="text-text-muted italic">No active sessions.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activeSessions.map((session) => (
                                <div key={session.socketId} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        <div>
                                            <p className="font-medium mb-0.5">{session.username}</p>
                                            <p className="text-xs text-text-muted">{session.patientId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {session.vitals ? (
                                            <>
                                                <div className="text-sm font-bold text-accent">{session.vitals.heartRate} BPM</div>
                                                <div className="text-xs text-text-muted">SpO2: {session.vitals.spO2}%</div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-text-muted">Connecting...</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Alerts Section */}
                <div className="glass p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-danger w-5 h-5" /> Emergency Alerts
                    </h2>
                    {alerts.length === 0 ? (
                        <p className="text-text-muted italic">No active alerts.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {alerts.map((alert, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg border-l-4 border-l-danger hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                                        <div>
                                            <p className="font-medium mb-0.5">{alert.type}</p>
                                            <p className="text-xs text-text-muted">Value: {alert.value} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs px-3 py-1 bg-white/5 border border-border-color rounded hover:bg-white/10 transition-colors cursor-pointer">View</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
