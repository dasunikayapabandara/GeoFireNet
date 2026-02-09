import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from './RiskCard.module.css';

interface RiskCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    status?: 'low' | 'moderate' | 'high' | 'extreme';
}

const RiskCard: React.FC<RiskCardProps> = ({ title, value, change, trend, status = 'low' }) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <ArrowUpRight size={16} color="var(--accent-risk-extreme)" />;
        if (trend === 'down') return <ArrowDownRight size={16} color="var(--accent-risk-low)" />;
        return <Minus size={16} color="var(--text-secondary)" />;
    };

    const getBadgeClass = () => {
        switch (status) {
            case 'low': return styles.badgeLow;
            case 'moderate': return styles.badgeModerate;
            case 'high': return styles.badgeHigh;
            case 'extreme': return styles.badgeExtreme;
            default: return styles.badgeLow;
        }
    };

    const isTrendWarning = trend === 'up' && status !== 'low';

    return (
        <div className={`card ${styles.riskCard} ${styles[status]}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {status && (
                    <span className={`${styles.badge} ${getBadgeClass()}`}>
                        {status}
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <span className={styles.value}>{value}</span>
                {change && (
                    <div className={styles.trendContainer}>
                        {getTrendIcon()}
                        <span className={`${styles.trendText} ${isTrendWarning ? styles.trendWarning : styles.trendNeutral}`}>
                            {change}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskCard;
