import React from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function AuthInput({ label, type, placeholder, value, onChange, icon: Icon, required = true }) {
    return (
        <div className="space-y-1.5 w-full group">
            <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
            </div>
        </div>
    );
}
