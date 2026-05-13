import React, { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { wsUrl } from '../config/api';
import { getAlertSeverityForScore, loadStoredSettings } from '../config/settings';
import '../styles/RealTimeToast.css';

interface AlertData {
    id: string;
    severity: 'high' | 'extreme' | 'moderate';
    score: number;
    message: string;
    drivers: string[];
    timestamp: string;
}

const playNotificationTone = (severity: AlertData['severity']) => {
    const AudioContextClass = window.AudioContext
        || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = severity === 'extreme' ? 880 : 640;
        gain.gain.setValueAtTime(0.001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.24);
    } catch {
        // Browser may block audio until the user has interacted with the page.
    }
};

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
                    const settings = loadStoredSettings();
                    const configuredSeverity = getAlertSeverityForScore(Number(message.data.score || 0), settings);
                    if (!configuredSeverity) return;

                    const nextAlert = { ...message.data, severity: configuredSeverity } as AlertData;
                    setAlert(nextAlert);
                    setVisible(true);
                    if (settings.notificationSounds) playNotificationTone(configuredSeverity);
                    
                    // Auto-hide after 15 seconds for Extreme, 8 for others
                    const duration = configuredSeverity === 'extreme' ? 15000 : 8000;
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
