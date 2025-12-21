import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-[70px] bg-black/80 backdrop-blur-md flex justify-between items-center px-10 border-b border-border-color z-50">
            <div className="flex items-center gap-2.5 text-2xl font-bold">
                <Activity className="text-primary w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />
                <Link to="/" className="text-text-main">
                    Bio<span className="text-primary">Pulse</span>
                </Link>
            </div>

            <div className="flex items-center gap-8">
                <Link to="/" className="text-text-muted font-medium hover:text-text-main transition-colors">Home</Link>
                {user && user.role === 'admin' ? (
                    <Link to="/admin-dashboard" className="text-text-muted font-medium hover:text-text-main transition-colors">Admin Dashboard</Link>
                ) : user && user.role === 'doctor' ? (
                    <Link to="/doctor-dashboard" className="text-text-muted font-medium hover:text-text-main transition-colors">Doctor Dashboard</Link>
                ) : (
                    <Link to="/dashboard" className="text-text-muted font-medium hover:text-text-main transition-colors">Dashboard</Link>
                )}

                <div className="flex items-center gap-4 ml-5">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Hi, {user.username}</span>
                            <button
                                onClick={handleLogout}
                                className="btn-primary"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-text-muted font-medium hover:text-text-main transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
