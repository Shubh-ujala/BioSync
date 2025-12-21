
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, AlertTriangle, X } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalPatients: 0,
        activeDevices: 0,
        criticalAlerts: 0
    });
    const [activeSessions, setActiveSessions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
    }, []);

    useEffect(() => {
        const fetchDbStats = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/admin/stats');
                const data = await res.json();
                setStats(prev => ({ ...prev, totalPatients: data.totalPatients }));
            } catch (err) {
                console.error('Error fetching admin stats:', err);
            }
        };

        const fetchDoctors = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/doctors');
                const data = await res.json();
                setDoctors(data);
            } catch (err) {
                console.error('Error fetching doctors:', err);
            }
        };

        const fetchPendingDoctors = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/admin/pending-doctors');
                const data = await res.json();
                setPendingDoctors(data);
            } catch (err) {
                console.error('Error fetching pending doctors:', err);
            }
        };

        fetchDbStats();
        fetchPendingDoctors();
        fetchDoctors();

        socketRef.current = io('http://127.0.0.1:5001', { transports: ['websocket'] });

        const joinAdminSession = () => {
            socketRef.current.emit('join_session', { username: user?.username || 'Admin', role: 'admin' });
        };

        socketRef.current.on('connect', joinAdminSession);
        if (socketRef.current.connected) joinAdminSession();

        socketRef.current.on('patient_update', (patients) => {
            setActiveSessions(patients);
            setStats(prev => ({ ...prev, activeDevices: patients.length }));
        });

        socketRef.current.on('alert_broadcast', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 10));
            setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));

            const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
            if (currentSettings.notifications !== false) {
                console.log('ALERT RECEIVED:', alert);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/approve-doctor/${id}`, { method: 'PUT' });
            if (res.ok) {
                setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
                alert('Doctor Approved');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/reject-doctor/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
                alert('Doctor Application Rejected');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const statCards = [
        { title: 'Registered Doctors', value: pendingDoctors ? doctors.length + pendingDoctors.length : 0, icon: <Users className="text-primary" />, change: 'Total' },
        { title: 'Pending Approvals', value: pendingDoctors.length, icon: <Activity className="text-accent" />, change: 'Action Req' },
        { title: 'Critical Alerts', value: stats.criticalAlerts, icon: <AlertTriangle className="text-danger" />, change: 'System' },
    ];

    return (
        <div className="page-container relative">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
                    <p className="text-text-muted">System Overview & Management</p>
                </div>
            </header>



            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="glass p-6 border border-white/10 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl flex items-center justify-center bg-white/5 border border-white/5">{stat.icon}</div>
                            <span className={`text-sm font-semibold ${stat.title === 'Critical Alerts' && stat.value > 0 ? 'text-danger' : 'text-success'} `}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold my-2">{stat.value}</h3>
                        <p className="text-text-muted text-sm">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 col-span-2">
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

            {/* Pending Doctor Approvals */}
            <div className="mt-8 glass p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="text-primary w-5 h-5" /> Pending Doctor Approvals
                </h2>
                {pendingDoctors.length === 0 ? (
                    <p className="text-text-muted italic">No pending applications.</p>
                ) : (
                    <div className="grid gap-4">
                        {pendingDoctors.map((doc) => (
                            <div key={doc._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg">
                                <div>
                                    <h3 className="font-bold">{doc.username}</h3>
                                    <p className="text-sm text-text-muted">{doc.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {doc.verificationDocument && (
                                        <a
                                            href={`http://localhost:5001/${doc.verificationDocument}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary text-sm underline mr-4"
                                        >
                                            View Proof
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleApprove(doc._id)}
                                        className="bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30 px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(doc._id)}
                                        className="bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30 px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div >
    );
};

export default AdminDashboard;
