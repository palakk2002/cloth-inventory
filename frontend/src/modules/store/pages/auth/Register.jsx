import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import authService from '../../../../services/auth.service';
import { useAuth } from '../../../../context/AuthContext';

export default function StoreRegister() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.storeRegister(name.trim(), email.trim(), password, shopName.trim());
            login(data.token, data.user);
            navigate('/store/pos');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A56] via-[#2d5380] to-[#1a3048] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#1E3A56] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#1E3A56]/30">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">Staff Registration</h1>
                    <p className="text-sm text-slate-400 mt-1 text-center">Create your store staff account</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-100 text-xs p-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                        <input
                            type="text"
                            placeholder="Your full name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-[#1E3A56]/30 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-[#1E3A56]/30 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-3.5 pr-12 rounded-xl text-sm outline-none focus:border-[#1E3A56]/30 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Shop Name <span className="text-slate-300 font-normal">(optional)</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Main Branch"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-[#1E3A56]/30 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E3A56]/25 hover:bg-[#1E3A56]/90 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Registering...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Already registered?{' '}
                    <button
                        onClick={() => navigate('/store/login')}
                        className="text-[#1E3A56] font-bold hover:underline transition-all"
                    >
                        Sign In
                    </button>
                </p>

                <p className="text-center text-slate-300 text-[10px] font-bold tracking-[0.15em] uppercase mt-6">
                    Cloth Inventory Store &copy; 2026
                </p>
            </div>
        </div>
    );
}
