import React, { useEffect, useState } from 'react';
import { RiskService, type Alert } from '../services/RiskService';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            const data = await RiskService.getAlerts();
            setAlerts(data);
            setLoading(false);
        };
        fetchAlerts();
    }, []);

    if (loading) return <div className="p-6">Loading Alerts...</div>;

    return (
        <div className="p-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Alerts Center</h2>
            <p style={{ marginBottom: '2rem' }}>View automatically generated warnings for High and Extreme probability events.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.length === 0 ? (
                    <p>No active alerts.</p>
                ) : (
                    alerts.map((alert: Alert) => (
                        <div key={alert.id} className="card" style={{
                            display: 'flex',
                            gap: '1rem',
                            borderLeft: `4px solid ${alert.severity === 'extreme' ? '#ef4444' : '#f97316'}`
                        }}>
                            <div style={{ paddingTop: '0.25rem' }}>
                                {alert.severity === 'extreme' ?
                                    <ShieldAlert color="#ef4444" size={24} /> :
                                    <AlertTriangle color="#f97316" size={24} />
                                }
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: alert.severity === 'extreme' ? '#ef4444' : '#f97316' }}>
                                    {alert.title}
                                </h3>
                                <p style={{ margin: '0.5rem 0', color: '#f8fafc' }}>{alert.description}</p>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Detected: {alert.timestamp}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Alerts;
