import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                // navigate('/dashboard');
                alert('Registration Successful!');
            } else {
                alert(data.msg || 'Registration Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server Error');
        }
    };

    return (
        <div className="page-container flex items-center justify-center min-h-[calc(100vh-70px)]">
            <div className="w-full max-w-[400px] p-10 glass">
                <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-3 text-white outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full justify-center mt-2.5">
                        Get Started <ArrowRight className="w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />
                    </button>

                    <p className="text-center text-text-muted text-sm mt-5">
                        Already have an account? <Link to="/login" className="text-primary underline">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
