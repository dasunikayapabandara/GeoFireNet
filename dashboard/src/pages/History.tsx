import React, { useEffect, useState } from 'react';
import { RiskService } from '../services/RiskService';

const History: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await RiskService.getHistory();
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-6">Loading History...</div>;

    return (
        <div className="p-6">
            <h2>Historical Log</h2>
            <p style={{ marginBottom: '2rem' }}>A tabular log of predictions returned by the active Random Forest pipeline.</p>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem 0.5rem' }}>Timestamp</th>
                            <th style={{ padding: '1rem 0.5rem' }}>Location</th>
                            <th style={{ padding: '1rem 0.5rem' }}>Risk Level</th>
                            <th style={{ padding: '1rem 0.5rem' }}>Probability</th>
                            <th style={{ padding: '1rem 0.5rem' }}>Primary Drivers</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem 0.5rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '1rem 0.5rem' }}>{log.location?.name || 'Unknown'}</td>
                                <td style={{ padding: '1rem 0.5rem' }}>
                                    <span style={{
                                        color: log.risk_level === 'Extreme' ? '#ef4444' : log.risk_level === 'High' ? '#f97316' : log.risk_level === 'Moderate' ? '#eab308' : '#22c55e',
                                        fontWeight: 'bold'
                                    }}>
                                        {log.risk_level}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 0.5rem' }}>{(log.risk_probability * 100).toFixed(1)}%</td>
                                <td style={{ padding: '1rem 0.5rem', color: '#94a3b8' }}>{log.primary_drivers || 'None'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
