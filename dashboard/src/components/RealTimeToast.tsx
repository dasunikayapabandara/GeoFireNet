import React, { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { wsUrl } from '../config/api';
import '../styles/RealTimeToast.css';

interface AlertData {
    id: string;
    severity: string;
    score: number;
    message: string;
    drivers: string[];
    timestamp: string;
}

const RealTimeToast: React.FC = () => {
    const [alert, setAlert] = useState<AlertData | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(wsUrl('/ws'));

        ws.onopen = () => {
            console.log('Connected to GeoFireNet WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'NEW_ALERT') {
                    setAlert(message.data);
                    setVisible(true);
                    
                    // Auto-hide after 15 seconds for Extreme, 8 for others
                    const duration = message.data.severity === 'extreme' ? 15000 : 8000;
                    setTimeout(() => {
                        setVisible(false);
                    }, duration);
                }
            } catch (err) {
                console.error('WebSocket message parse error:', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed. Retrying in 5s...');
            setTimeout(() => {
                // Simple reconnection logic could go here
            }, 5000);
        };

        return () => {
            ws.close();
        };
    }, []);

    if (!alert || !visible) return null;

    return (
        <div className={`realtime-toast ${alert.severity}`}>
            <div className="toast-header">
                <ShieldAlert size={20} />
                <span>REAL-TIME {alert.severity.toUpperCase()} ALERT</span>
                <button className="toast-close" onClick={() => setVisible(false)}>
                    <X size={16} />
                </button>
            </div>
            <div className="toast-body">
                <p>{alert.message}</p>
                <div className="toast-meta">
                    <span>Score: {alert.score.toFixed(1)}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>
            <div className="toast-progress"></div>
        </div>
    );
};

export default RealTimeToast;
