import React, { useEffect, useState } from 'react';
import { currentSystemStatus } from '../services/RiskService';

const Footer: React.FC = () => {
    const [status, setStatus] = useState<string>('INITIALIZING...');

    useEffect(() => {
        // Polling for status update (since RiskService variable is not reactive)
        // In a real app, use Context or Redux. For this demo, interval is fine.
        const interval = setInterval(() => {
            setStatus(currentSystemStatus);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (s: string) => {
        if (s.includes('PRODUCTION')) return 'green';
        if (s.includes('SIMULATION')) return 'orange';
        return 'red';
    };

    return (
        <footer style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1e1e1e',
            borderTop: '1px solid #333',
            fontSize: '0.8rem',
            color: '#888',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span>GeoFireNet v1.0-RC</span>
            <div>
                System Status: <strong style={{ color: getStatusColor(status) }}>{status}</strong>
            </div>
        </footer>
    );
};

export default Footer;
