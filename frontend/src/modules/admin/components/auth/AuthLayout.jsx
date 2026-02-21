import React from 'react';

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 font-inter">
            {/* Simple Background Blobs for context */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-float opacity-30" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-float-delayed opacity-30" />

            {/* Fabric Texture Overlay - Very Subtle */}
            <div className="absolute inset-0 fabric-texture opacity-[0.03] pointer-events-none" />

            {/* Container for the sliding panel */}
            <div className="relative z-10 w-full flex items-center justify-center">
                {children}
            </div>

            {/* Footer text */}
            <p className="fixed bottom-8 text-center text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">
                Premium Inventory Management &copy; 2026
            </p>
        </div>
    );
}
