import React from 'react';

export default function StatusBadge({ status }) {
    const getStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'in stock':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'low stock':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'out of stock':
            case 'inactive':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles(status)}`}>
            {status}
        </span>
    );
}
