import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RiskCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    status?: 'low' | 'moderate' | 'high' | 'extreme';
}

const RiskCard: React.FC<RiskCardProps> = ({ title, value, change, trend, status = 'low' }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'low': return 'var(--accent-risk-low)';
            case 'moderate': return 'var(--accent-risk-med)';
            case 'high': return 'var(--accent-risk-high)';
            case 'extreme': return 'var(--accent-risk-extreme)';
            default: return 'var(--text-secondary)';
        }
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <ArrowUpRight size={16} color="var(--accent-risk-extreme)" />;
        if (trend === 'down') return <ArrowDownRight size={16} color="var(--accent-risk-low)" />;
        return <Minus size={16} color="var(--text-secondary)" />;
    };

    return (
        <div className="card" style={{ borderLeft: `4px solid ${getStatusColor()}` }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{title}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                {change && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                        {getTrendIcon()}
                        <span style={{ color: trend === 'up' ? 'var(--accent-risk-extreme)' : trend === 'down' ? 'var(--accent-risk-low)' : 'var(--text-secondary)' }}>
                            {change}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskCard;
