import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { RiskService, type HistoryRecord } from '../services/RiskService';

const History: React.FC = () => {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const data = await RiskService.getHistory();
            setHistory(data);
        } catch (err) {
            console.warn("History sync unavailable. Showing existing or empty log view.", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const intervalId = setInterval(fetchHistory, 10000); 
        return () => clearInterval(intervalId);
    }, []);

    if (loading && history.length === 0) return <div className="p-6"><h3>Syncing with Prediction Registry...</h3></div>;

    return (
        <div className="p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Historical Log</h2>
                    <p className="text-muted">A tabular log of predictions returned by the active RandomForestClassifier pipeline.</p>
                </div>
                {loading && <div className="animate-spin text-muted"><Clock size={20} /></div>}
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                {history.length === 0 && !loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No historical records found in the database.</p>
                    </div>
                ) : (
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
                                    <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        {log.location ?
                                            `${log.location.admin_region || log.location.name || ''}, ${log.location.country || ''}`.replace(/^, | ,/g, '') :
                                            'Unspecified Location'}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{
                                            color: log.risk_level === 'Extreme' ? '#ef4444' : log.risk_level === 'High' ? '#f97316' : log.risk_level === 'Moderate' ? '#eab308' : '#22c55e',
                                            fontWeight: 'bold'
                                        }}>
                                            {log.risk_level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{(log.risk_probability * 100).toFixed(1)}%</td>
                                    <td style={{ padding: '1rem 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{log.primary_drivers || 'None'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default History;
