import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, FileText, Upload } from 'lucide-react';

const RegisterDoctor = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0] ? e.target.files[0].name : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', 'doctor');
        if (file) {
            data.append('verificationDocument', file);
        }

        try {
            const res = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                body: data
            });
            const resData = await res.json();
            if (res.ok) {
                localStorage.setItem('token', resData.token);
                alert('Doctor Registration Successful! Please wait for verification.');
                navigate('/doctor-dashboard');
            } else {
                alert(resData.msg || 'Registration Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server Error');
        }
    };

    return (
        <div className="page-container flex items-center justify-center min-h-[calc(100vh-70px)]">
            <div className="w-full max-w-[400px] p-10 glass">
                <h2 className="text-3xl font-bold text-center mb-2">Doctor Registration</h2>
                <p className="text-center text-text-muted text-sm mb-8">Join our medical network</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Full Name"
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



                    <div className="relative">
                        <input
                            type="file"
                            id="doc-upload"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                        />
                        <label
                            htmlFor="doc-upload"
                            className={`flex items-center justify-center gap-2 w-full border border-dashed rounded-lg py-3 cursor-pointer transition-colors ${file ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-text-muted hover:border-white/30'}`}
                        >
                            {file ? <FileText className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                            <span className="text-sm truncate max-w-[200px]">{fileName || "Upload Medical License"}</span>
                        </label>
                    </div>

                    <button type="submit" className="btn-primary w-full justify-center mt-2.5">
                        Submit for Verification <ArrowRight className="w-6 h-6 drop-shadow-[0_0_5px_currentColor]" />
                    </button>

                    <div className="flex flex-col gap-2 mt-5 text-center text-sm">
                        <p className="text-text-muted">
                            Not a doctor? <Link to="/register" className="text-primary underline">Patient Registration</Link>
                        </p>
                        <p className="text-text-muted">
                            Already have an account? <Link to="/login" className="text-primary underline">Login</Link>
                        </p>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default RegisterDoctor;
