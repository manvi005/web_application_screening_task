import React, { useState } from 'react';
import { setAuthToken } from '../api';
import { motion } from 'framer-motion';
import { User, Lock, Atom, ArrowRight, FlaskConical } from 'lucide-react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate a small network delay for the animation effect
        await new Promise(r => setTimeout(r, 800));

        setAuthToken(username, password);
        if (username && password) {
            onLogin(username, password);
        } else {
            setError("Please enter credentials");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#0b0f19] relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 100, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1/2 -right-1/2 w-[100vw] h-[100vw] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 overflow-hidden relative">

                    {/* Decorative Top lighting */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-500/30"
                        >
                            <Atom size={32} />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-slate-400 mt-2 text-sm text-center">Chemical Equipment Parameter Visualizer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 text-sm text-red-200 bg-red-500/20 rounded-lg border border-red-500/30 text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all outline-none"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all outline-none"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full py-3.5 px-4 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    <FlaskConical className="w-5 h-5" />
                                </motion.div>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}

                            {/* Button Glare Effect */}
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">Authorized Personnel Only • Secure Connection</p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
