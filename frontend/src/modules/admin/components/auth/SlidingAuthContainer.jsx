import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Github, ArrowLeft } from 'lucide-react';

export default function SlidingAuthContainer({ initialMode = 'signin' }) {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                // In a real app, you'd reset the fields here
            }
        }, 1200);
    };

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

    return (
        <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`} id="main">
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
    );
}
