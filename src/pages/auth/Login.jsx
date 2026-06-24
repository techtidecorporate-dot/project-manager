import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (loading) return;

        try {
            const user = await login(credentials.email, credentials.password);
            if (user) {
                navigate('/dashboard');
            }
        } catch (error) {
            alert('Authentication failed. Check telemetry.');
        }
    };

    const handleRoleClick = (role) => {
        const email = `${role.toLowerCase()}@techtide.io`;
        const password = 'password123';
        setCredentials({ email, password });

        // Auto-login after setting credentials
        setTimeout(() => {
            login(email, password);
        }, 100);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans selection:bg-[#453abc] selection:text-white">
            {/* Back Button */}
            <Link to="/" className="fixed top-8 left-8 flex items-center space-x-2 text-[#191a23]/60 hover:text-[#191a23] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-[#e9ebef]/50 flex items-center justify-center group-hover:bg-[#e9ebef] transition-colors shadow-sm border border-[--border]">
                    <ArrowLeft size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Back to Home</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center space-x-3 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#453abc] to-[#60c3e3] rounded-[20px] flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="text-white" size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-[#191a23] tracking-tighter">
                            Task Management
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#191a23] uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#453abc] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={credentials.email}
                                    className="w-full bg-[#e9ebef] border border-[#e9ebef] rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none focus:border-[#453abc] focus:ring-4 focus:ring-[#453abc]/10 transition-all font-bold placeholder:text-[#6b7280]"
                                    placeholder="admin@techtide.io"
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#191a23] uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#453abc] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={credentials.password}
                                    className="w-full bg-[#e9ebef] border border-[#e9ebef] rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none focus:border-[#453abc] focus:ring-4 focus:ring-[#453abc]/10 transition-all font-bold placeholder:text-[#6b7280]"
                                    placeholder="••••••••"
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#453abc] to-[#60c3e3] hover:opacity-90 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>Logging in...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <span>Login</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>
                </div>
            </motion.div >
        </div >
    );
};

export default Login;

