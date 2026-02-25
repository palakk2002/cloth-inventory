import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Github, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SlidingAuthContainer({ initialMode = 'signin' }) {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Forgot Password Flow States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(0); // 0: Email, 1: Code, 2: Reset
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setIsForgotPassword(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (email === 'clothinventory@gmail.com' && password === '1234') {
                navigate('/admin/dashboard');
            } else {
                setError('Invalid email or password');
            }
        }, 1500);
    };

    const handleForgotPasswordSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
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

    /* ────────────── DESKTOP FORMS (unchanged) ────────────── */

    const renderLoginForm = () => (
        <form
            onSubmit={handleLogin}
            className="bg-white flex flex-col items-center justify-center p-12 h-full text-center"
        >
            <h1 className="text-3xl font-black mb-4">Sign in</h1>
            <div className="flex gap-4 mb-6">
                <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56]"><Facebook size={18} strokeWidth={2.5} /></a>
                <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56] text-sm font-black">G+</a>
                <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56]"><Linkedin size={18} strokeWidth={2.5} /></a>
            </div>
            <span className="text-sm text-slate-500 mb-4">or use your account</span>
            {error && <div className={`text-xs p-2 mb-4 w-full rounded ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{error}</div>}
            <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
            />
            <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100 border-none p-3 mb-4 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
            />
            <button
                type="button"
                onClick={() => { setIsForgotPassword(true); setError(''); setResetStep(0); }}
                className="text-sm text-slate-500 mb-6 hover:text-slate-800 transition-colors"
            >
                Forgot your password?
            </button>
            <button className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md">
                {isLoading ? "Signing In..." : "Sign In"}
            </button>
        </form>
    );

    const renderForgotPassword = () => (
        <form
            onSubmit={handleForgotPasswordSubmit}
            className="bg-white flex flex-col items-center justify-center p-12 h-full text-center animate-in fade-in duration-500"
        >
            <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="self-start text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-xs mb-8"
            >
                <ArrowLeft size={16} /> Back to Sign In
            </button>

            <h1 className="text-3xl font-black mb-4">
                {resetStep === 0 && "Recovery"}
                {resetStep === 1 && "Verification"}
                {resetStep === 2 && "New Password"}
            </h1>

            <p className="text-sm text-slate-500 mb-8 px-4">
                {resetStep === 0 && "Enter your admin email address to receive a recovery code."}
                {resetStep === 1 && "We've sent a code to your email. Please enter it below."}
                {resetStep === 2 && "Create a secure new password for your administration account."}
            </p>

            {resetStep === 0 && (
                <input
                    type="email"
                    placeholder="Admin Email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-slate-100 border-none p-3 mb-8 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
                />
            )}

            {resetStep === 1 && (
                <input
                    type="text"
                    placeholder="Verification Code"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-slate-100 border-none p-3 mb-8 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm text-center tracking-[0.5em] font-bold"
                    maxLength={6}
                />
            )}

            {resetStep === 2 && (
                <div className="w-full space-y-4 mb-8">
                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-100 border-none p-3 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        required
                        className="w-full bg-slate-100 border-none p-3 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                </div>
            )}

            <button className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md">
                {isLoading ? "Processing..." : (
                    resetStep === 0 ? "Send Code" : resetStep === 1 ? "Verify" : "Change Password"
                )}
            </button>
        </form>
    );

    /* ────────────── MOBILE UI ────────────── */

    const renderMobileView = () => (
        <div className="block md:hidden w-full px-4 animate-[fadeInUp_0.5s_ease-out]">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-[#1E3A56] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#1E3A56]/20">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#1E3A56]/60">Cloth Inventory</h2>
                </div>

                {/* Forgot Password Mobile */}
                {!isSignUp && isForgotPassword ? (
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <button
                            type="button"
                            onClick={() => setIsForgotPassword(false)}
                            className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#1E3A56] transition-colors mb-4"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <h1 className="text-2xl font-black text-slate-800 mb-1">
                            {resetStep === 0 && "Recovery"}
                            {resetStep === 1 && "Verification"}
                            {resetStep === 2 && "New Password"}
                        </h1>
                        <p className="text-sm text-slate-400 mb-6">
                            {resetStep === 0 && "Enter your admin email to receive code."}
                            {resetStep === 1 && "Enter the code we sent to your email."}
                            {resetStep === 2 && "Create a secure administration password."}
                        </p>
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                            {resetStep === 0 && (
                                <input
                                    type="email"
                                    placeholder="Admin Email"
                                    required
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                    className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all font-inter"
                                />
                            )}
                            {resetStep === 1 && (
                                <input
                                    type="text"
                                    placeholder="Verification Code"
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none text-center tracking-[0.5em] font-bold border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all font-inter"
                                    maxLength={6}
                                />
                            )}
                            {resetStep === 2 && (
                                <>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all font-inter"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        required
                                        className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all font-inter"
                                    />
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E3A56]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {isLoading ? "Processing..." : (
                                    resetStep === 0 ? "Send Code" : resetStep === 1 ? "Verify" : "Change Password"
                                )}
                            </button>
                        </form>
                    </div>
                ) : !isSignUp ? (
                    /* Sign In Mobile */
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <h1 className="text-2xl font-black text-slate-800 mb-1 text-center">Admin Login</h1>
                        <p className="text-sm text-slate-400 mb-6 text-center">Manage your business operations</p>

                        {error && (
                            <div className={`text-xs p-3 mb-4 w-full rounded-xl ${error.includes('successfully') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400 font-inter"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent focus:border-[#1E3A56]/20 focus:ring-4 focus:ring-[#1E3A56]/5 transition-all placeholder:text-slate-400 font-inter"
                            />

                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setIsForgotPassword(true); setError(''); setResetStep(0); }}
                                    className="text-xs text-[#1E3A56]/70 font-semibold hover:text-[#1E3A56] transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1E3A56] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E3A56]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or continue with</span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="flex justify-center gap-4">
                            <a href="#" className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-[#1E3A56]">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-[#1E3A56] font-black text-sm">
                                G+
                            </a>
                            <a href="#" className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-[#1E3A56]">
                                <Linkedin size={20} />
                            </a>
                        </div>

                        {/* Toggle */}
                        <p className="text-center text-sm text-slate-400 mt-6">
                            Don't have an account?{' '}
                            <button onClick={handleToggle} className="text-[#1E3A56] font-bold hover:underline transition-all">
                                Sign Up
                            </button>
                        </p>
                    </div>
                ) : (
                    /* Sign Up Mobile */
                    <div className="animate-[fadeInUp_0.3s_ease-out]">
                        <h1 className="text-2xl font-black text-slate-800 mb-1 text-center">Admin Registration</h1>
                        <p className="text-sm text-slate-400 mb-6 text-center">Join the Cloth Inventory administration</p>

                        <div className="text-xs bg-amber-50 text-amber-700 p-3 mb-6 rounded-xl border border-amber-100">
                            Registration is restricted. Please use provided admin credentials or contact system owner.
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); setError('Registration restricted.'); }} className="space-y-4 opacity-70">
                            <input
                                type="text"
                                placeholder="Full Name"
                                disabled
                                className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent font-inter"
                            />
                            <input
                                type="email"
                                placeholder="Admin Email"
                                disabled
                                className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent font-inter"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                disabled
                                className="w-full bg-slate-50 p-3.5 rounded-xl text-sm outline-none border border-transparent font-inter"
                            />

                            <button
                                disabled
                                className="w-full bg-[#1E3A56]/50 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm cursor-not-allowed"
                            >
                                Sign Up Restricted
                            </button>
                        </form>

                        {/* Toggle back to Sign In */}
                        <p className="text-center text-sm text-slate-400 mt-8">
                            Already have an account?{' '}
                            <button onClick={handleToggle} className="text-[#1E3A56] font-bold hover:underline transition-all">
                                Sign In
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <p className="text-center text-slate-400/60 text-[10px] font-bold tracking-[0.15em] uppercase mt-6">
                Cloth Inventory &copy; 2026
            </p>
        </div>
    );

    /* ────────────── MAIN RENDER ────────────── */

    return (
        <>
            {/* Mobile View */}
            {renderMobileView()}

            {/* Desktop View */}
            <div className={`auth-container hidden md:block ${isSignUp ? 'right-panel-active' : ''}`} id="main">
                {/* Sign Up Form */}
                <div className="form-container sign-up-container">
                    <form
                        onSubmit={(e) => { e.preventDefault(); setError('Admin registration is restricted. Please contact support.'); }}
                        className="bg-white flex flex-col items-center justify-center p-12 h-full text-center"
                    >
                        <h1 className="text-3xl font-black mb-4">Create Account</h1>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56]"><Facebook size={20} /></a>
                            <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56] text-sm font-black">G+</a>
                            <a href="#" className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-[#1E3A56]"><Linkedin size={20} /></a>
                        </div>
                        {error && isSignUp && <div className="text-xs bg-red-100 text-red-700 p-2 mb-4 w-full rounded">{error}</div>}
                        <span className="text-sm text-slate-500 mb-4">or use your email for registration</span>
                        <input type="text" placeholder="Name" className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" />
                        <input type="email" placeholder="Email" className="w-full bg-slate-100 border-none p-3 mb-2 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" />
                        <input type="password" placeholder="Password" className="w-full bg-slate-100 border-none p-3 mb-6 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" />
                        <button className="bg-[#1E3A56] text-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-[10px] border border-transparent hover:opacity-90 active:scale-95 transition-all shadow-md">
                            Sign Up
                        </button>
                    </form>
                </div>

                {/* Sign In / Forgot Password Form Container */}
                <div className="form-container sign-in-container">
                    {isForgotPassword ? renderForgotPassword() : renderLoginForm()}
                </div>

                {/* Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="text-3xl font-black mb-4">Welcome Back!</h1>
                            <p className="text-sm font-light leading-relaxed mb-8 px-6 opacity-80">
                                To keep connected with us please login with your personal info
                            </p>
                            <button
                                onClick={handleToggle}
                                className="bg-transparent text-white border-2 border-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-primary transition-all active:scale-95 shadow-lg"
                                id="signIn"
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="text-3xl font-black mb-4">Hello, Friend!</h1>
                            <p className="text-sm font-light leading-relaxed mb-8 px-6 opacity-80">
                                Enter your personal details and start journey with us
                            </p>
                            <button
                                onClick={handleToggle}
                                className="bg-transparent text-white border-2 border-white py-3 px-12 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-primary transition-all active:scale-95 shadow-lg"
                                id="signUp"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
