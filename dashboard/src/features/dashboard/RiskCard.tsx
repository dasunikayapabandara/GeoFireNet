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
        <div className="card risk-card" style={{ borderLeft: `4px solid ${getStatusColor()}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{title}</h3>
                {status && (
                    <span className={`status-badge status-${status}`} style={{
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: `${getStatusColor()}20`,
                        color: getStatusColor(),
                        textTransform: 'capitalize'
                    }}>
                        {status}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                {change && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                        {getTrendIcon()}
                        <span style={{ color: trend === 'up' && status !== 'low' ? 'var(--accent-risk-extreme)' : 'var(--text-secondary)' }}>
                            {change}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskCard;
