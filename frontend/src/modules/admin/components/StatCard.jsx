import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({ label, value, icon: Icon, trend, path, colorClass = "bg-primary/10 text-primary" }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => path && navigate(path)}
            className={`card p-6 flex items-center gap-4 h-full transition-all duration-300 ${path ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
        >
            <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-1 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trend} from last month
                    </p>
                )}
            </div>
        </div>
    );
}
