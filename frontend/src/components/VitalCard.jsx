import React from 'react';

const VitalCard = ({ title, value, unit, status, icon }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'normal': return 'text-success';
            case 'warning': return 'text-warning';
            case 'critical': return 'text-danger';
            default: return 'text-white';
        }
    };

    return (
        <div className="glass p-8 flex flex-col items-center relative hover:border-white/20 hover:scale-[1.02] transition-transform duration-300">
            <div className="mb-4">
                {icon}
            </div>

            <h3 className="text-text-muted text-sm uppercase tracking-widest my-4">{title}</h3>

            <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-bold ${getStatusColor()}`}>{value}</span>
                <span className="text-text-muted text-sm">{unit}</span>
            </div>

            <span className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 ${getStatusColor()}`}>
                {status.toUpperCase()}
            </span>
        </div>
    );
};

export default VitalCard;
