import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Linkedin,
    Github,
    ArrowLeft,
    ShieldCheck,
    Eye,
    EyeOff
} from 'lucide-react';
import authService from '../../../../services/auth.service';
import { useAuth } from '../../../../context/AuthContext';

export default function SlidingAuthContainer({ initialMode = 'signin' }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Sign In form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Admin Register form state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regSecret, setRegSecret] = useState('');

    // Forgot Password Flow
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setIsForgotPassword(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.adminLogin(email.trim(), password);
            if (data.token) {
                login(data.token, data.user);
                navigate('/admin/dashboard');
            } else {
                setError('Login successful but no token received.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.adminRegister(
                regName.trim(),
                regEmail.trim(),
                regPassword,
                regSecret.trim()
            );
            if (data.token) {
                login(data.token, data.user);
                navigate('/admin/dashboard');
            } else {
                setError('Registration successful! Please sign in.');
                setIsSignUp(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please verify your secret key and details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulation for now - should connect to recovery service
        setTimeout(() => {
            setIsLoading(false);
            if (resetStep < 2) {
                setResetStep(resetStep + 1);
            } else {
                setIsForgotPassword(false);
                setResetStep(0);
                setError('Password successfully changed! Please login.');
            }
        }, 1200);
    };

    /* ────────────── LOGIN FORM ────────────── */
    const renderLoginForm = () => (
        <form
            onSubmit={handleLogin}
            className="bg-white flex flex-col items-center justify-center p-12 h-full text-center"
        >
            <h1 className="text-3xl font-black mb-4">Sign in</h1>
            <div className="flex gap-4 mb-6">
                <a href="#" className="border border-slate-200 rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-50 transition-colors"><Facebook size={20} /></a>
                <a href="#" className="border border-slate-200 rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-50 transition-colors"><Twitter size={20} /></a>
                <a href="#" className="border border-slate-200 rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-50 transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="border border-slate-200 rounded-full h-10 w-10 flex items-center justify-center hover:bg-slate-50 transition-colors"><Github size={20} /></a>
            </div>
            {error && (
                <div className={`text-xs p-2 mb-4 w-full rounded ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {error}
                </div>
            )}
            <input
                type="email"
                placeholder="Admin Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
            />
            <div className="w-full relative mb-4">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 border-none p-3 pr-10 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            <button
                type="button"
                onClick={() => { setIsForgotPassword(true); setError(''); setResetStep(0); }}
                className="text-sm text-slate-500 mb-6 hover:text-slate-800 transition-colors"
            >
                Forgot your password?
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
    );

    /* ────────────── REGISTER FORM ────────────── */
    const renderRegisterForm = () => (
        <form
            onSubmit={handleRegister}
            className="bg-white flex flex-col items-center justify-center p-12 h-full text-center"
        >
            <h1 className="text-3xl font-black mb-2">Create Account</h1>
            <p className="text-xs text-slate-500 mb-4">Admin registration requires secret key</p>
            {error && (
                <div className="text-xs bg-red-100 text-red-700 p-2 mb-4 w-full rounded">{error}</div>
            )}
            <input
                type="text"
                placeholder="Full Name"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
            />
            <input
                type="email"
                placeholder="Admin Email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
            />
            <input
                type="password"
                placeholder="Password (min 6 characters)"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
            />
            <input
                type="password"
                placeholder="Admin Secret Key"
                required
                value={regSecret}
                onChange={(e) => setRegSecret(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-6 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60"
            >
                {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
        </form>
    );

    /* ────────────── FORGOT PASSWORD FORM ────────────── */
    const renderForgotPassword = () => (
        <form
            onSubmit={handleForgotPasswordSubmit}
            className="bg-white flex flex-col items-center justify-center p-12 h-full text-center animate-in fade-in duration-500"
        >
            <button type="button" onClick={() => setIsForgotPassword(false)} className="self-start text-slate-400 hover:text-[#1E3A56] transition-colors flex items-center gap-1 text-xs mb-8">
                <ArrowLeft size={16} /> Back to Sign In
            </button>
            <h1 className="text-3xl font-black mb-4">
                {resetStep === 0 && 'Recovery'}
                {resetStep === 1 && 'Verification'}
                {resetStep === 2 && 'New Password'}
            </h1>
            <p className="text-sm text-slate-500 mb-8 px-4">
                {resetStep === 0 && 'Enter your admin email address to receive a recovery code.'}
                {resetStep === 1 && "We've sent a code to your email. Please enter it below."}
                {resetStep === 2 && 'Create a secure new password for your administration account.'}
            </p>
            {resetStep === 0 && <input type="email" placeholder="Admin Email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="w-full bg-slate-100 border-none p-3 mb-8 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm" />}
            {resetStep === 1 && <input type="text" placeholder="Verification Code" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full bg-slate-100 border-none p-3 mb-8 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm text-center tracking-[0.5em] font-bold" maxLength={6} />}
            {resetStep === 2 && <div className="w-full space-y-4 mb-8"><input type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-100 border-none p-3 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm" /><input type="password" placeholder="Confirm New Password" required className="w-full bg-slate-100 border-none p-3 rounded-lg focus:ring-1 focus:ring-[#1E3A56] outline-none text-sm" /></div>}
            <button className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md">
                {isLoading ? 'Processing...' : (resetStep === 0 ? 'Send Code' : resetStep === 1 ? 'Verify' : 'Change Password')}
            </button>
        </form>
    );

    /* ────────────── MOBILE VIEW ────────────── */
    const renderMobileView = () => (
        <div className="block md:hidden w-full px-4 animate-[fadeInUp_0.5s_ease-out]">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-[#1E3A56] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#1E3A56]/20">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#1E3A56]/60">Cloth Inventory Admin</h2>
                </div>

                {/* Mobile Sign In */}
                {!isSignUp && !isForgotPassword && (
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <h1 className="text-2xl font-black text-slate-800 mb-1 text-center">Admin Login</h1>
                        <p className="text-sm text-slate-400 mb-6 text-center">Manage your business operations</p>
                        {error && <div className={`text-xs p-3 mb-4 w-full rounded-xl ${error.includes('successfully') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{error}</div>}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" placeholder="Admin Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400" />
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 p-3.5 pr-12 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                            <div className="flex items-center justify-end">
                                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setResetStep(0); }} className="text-xs text-[#1E3A56]/70 font-semibold hover:text-[#1E3A56] transition-colors">Forgot password?</button>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E3A56]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60">
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-slate-400 mt-6">Need to register? <button onClick={handleToggle} className="text-[#1E3A56] font-bold hover:underline">Sign Up</button></p>
                    </div>
                )}

                {/* Mobile Forgot Password */}
                {!isSignUp && isForgotPassword && (
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <button type="button" onClick={() => setIsForgotPassword(false)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#1E3A56] transition-colors mb-4"><ArrowLeft size={16} /> Back</button>
                        <h1 className="text-2xl font-black text-slate-800 mb-1">{resetStep === 0 && 'Recovery'}{resetStep === 1 && 'Verification'}{resetStep === 2 && 'New Password'}</h1>
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                            {resetStep === 0 && <input type="email" placeholder="Admin Email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none" />}
                            {resetStep === 1 && <input type="text" placeholder="Verification Code" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm text-center tracking-[0.5em] font-bold outline-none" maxLength={6} />}
                            {resetStep === 2 && <><input type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none" /><input type="password" placeholder="Confirm Password" required className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none" /></>}
                            <button type="submit" disabled={isLoading} className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">{isLoading ? 'Processing...' : (resetStep === 0 ? 'Send Code' : resetStep === 1 ? 'Verify' : 'Change Password')}</button>
                        </form>
                    </div>
                )}

                {/* Mobile Register */}
                {isSignUp && (
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <h1 className="text-2xl font-black text-slate-800 mb-1 text-center">Admin Registration</h1>
                        <p className="text-sm text-slate-400 mb-4 text-center">Requires secret key</p>
                        {error && <div className="text-xs bg-red-50 text-red-600 p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <input type="text" placeholder="Full Name" required value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all" />
                            <input type="email" placeholder="Admin Email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all" />
                            <input type="password" placeholder="Password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all" />
                            <input type="password" placeholder="Admin Secret Key" required value={regSecret} onChange={(e) => setRegSecret(e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all" />
                            <button type="submit" disabled={isLoading} className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E3A56]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60">
                                {isLoading ? 'Registering...' : 'Create Account'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-slate-400 mt-6">Already have an account? <button onClick={handleToggle} className="text-[#1E3A56] font-bold hover:underline">Sign In</button></p>
                    </div>
                )}

                <p className="text-center text-slate-400/60 text-[10px] font-bold tracking-[0.15em] uppercase mt-6">Cloth Inventory Admin &copy; 2026</p>
            </div>
        </div>
    );

    /* ────────────── MAIN RENDER ────────────── */
    return (
        <>
            {renderMobileView()}

            {/* Desktop view */}
            <div className={`auth-container hidden md:block ${isSignUp ? 'right-panel-active' : ''}`} id="main">
                {/* Sign Up Form */}
                <div className="form-container sign-up-container">
                    {renderRegisterForm()}
                </div>

                {/* Sign In / Forgot Password */}
                <div className="form-container sign-in-container">
                    {isForgotPassword ? renderForgotPassword() : renderLoginForm()}
                </div>

                {/* Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="text-3xl font-black mb-4">Welcome Back!</h1>
                            <p className="text-sm font-light leading-relaxed mb-8 px-6 opacity-80">Sign in with your admin credentials to continue</p>
                            <button onClick={handleToggle} className="bg-transparent text-white border-2 border-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-[#1E3A56] transition-all active:scale-95 shadow-lg" id="signIn">Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="text-3xl font-black mb-4">New Admin?</h1>
                            <p className="text-sm font-light leading-relaxed mb-8 px-6 opacity-80">Register with your admin secret key to create an account</p>
                            <button onClick={handleToggle} className="bg-transparent text-white border-2 border-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-[#1E3A56] transition-all active:scale-95 shadow-lg" id="signUp">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
